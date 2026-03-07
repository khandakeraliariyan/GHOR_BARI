import { getDatabase } from "../config/db.js";

import { ObjectId } from "mongodb";
import { generatePropertyAppraisal } from "../services/propertyAppraisalService.js";


// ========== PROPERTY CONTROLLER ==========

/**
 * Property Listing Management
 * 
 * Handles full property lifecycle:
 * - Create, read, update, delete property listings
 * - Manage property visibility (hide/show)
 * - Track property status through deal lifecycle
 * - Generate AI appraisals for properties
 * - Marketplace browsing and featured properties
 * 
 * Property Status Flow:
 * - active: Listed on marketplace, accepting applications
 * - hidden: Owner-hidden (temporarily not visible)
 * - pending: Awaiting admin approval (not visible)
 * - rejected: Rejected by admin (hidden)
 * - deal-in-progress: Active proposal accepted
 * - sold/rented: Deal completed
 * - removed: Soft-deleted by admin
 * 
 * Deal Protection:
 * - Cannot edit properties in: deal-in-progress, sold, rented
 * - Cannot delete properties with active applications
 * - Cannot delete properties in: deal-in-progress, sold, rented
 */


// ========== PROPERTY CREATION ==========

/**
 * Create new property listing
 * 
 * POST /api/properties/create
 * 
 * Owner submits new property listing
 * Automatically generates AI appraisal for fair market evaluation
 * Property starts as "active" and immediately visible to seekers
 * 
 * @param {Object} req.body - Property data
 * @param {string} req.body.title - Property title/name (required)
 * @param {string} req.body.listingType - 'rent' or 'sale' (required)
 * @param {string} req.body.propertyType - 'flat' or 'building' (required)
 * @param {number} req.body.price - Price (sale price or monthly rent) (required)
 * @param {number} req.body.areaSqFt - Area in square feet (required)
 * @param {Object} req.body.address - Address components (required)
 * @param {string} req.body.address.division_id - Division code
 * @param {string} req.body.address.district_id - District code
 * @param {string} req.body.address.upazila_id - Upazila/Sub-district code
 * @param {string} req.body.address.street - Street address
 * @param {Array<string>} req.body.images - Image URLs from ImgBB
 * @param {string} req.body.overview - Property description
 * @param {Array<string>} req.body.amenities - Array of amenity tags
 * @param {Object} req.body.location - GPS coordinates (required)
 * @param {number} req.body.location.lat - Latitude
 * @param {number} req.body.location.lng - Longitude
 * @param {number} req.body.roomCount - [Flat only] Number of bedrooms
 * @param {number} req.body.bathrooms - [Flat only] Number of bathrooms
 * @param {number} req.body.floorCount - [Building only] Number of floors
 * @param {number} req.body.totalUnits - [Building only] Total units in building
 * 
 * @returns {201} Property created successfully
 * @returns {201.success} true
 * @returns {201.id} New property MongoDB ObjectId
 * 
 * @returns {400} Validation error
 * @returns {500} Server/appraisal service error
 * 
 * @auth Required (authenticated owner)
 * 
 * Features:
 * - Auto-generates AI appraisal (estimated market value, confidence, reasoning)
 * - Stores owner information at time of creation
 * - Initializes active_proposal_id as null
 * - Captures creation timestamp
 * - Gracefully handles appraisal generation failures
 * 
 * @example
 * POST /api/properties/create
 * {
 *   "title": "Cozy Apartment in Gulshan",
 *   "listingType": "rent",
 *   "propertyType": "flat",
 *   "price": 50000,
 *   "areaSqFt": 1200,
 *   "roomCount": 2,
 *   "bathrooms": 1,
 *   "address": {
 *     "division_id": "10",
 *     "district_id": "60",
 *     "upazila_id": "601",
 *     "street": "123 Main Street"
 *   },
 *   "location": { "lat": 23.77, "lng": 90.41 },
 *   "images": ["https://...jpg"],
 *   "amenities": ["WiFi", "Parking", "AC"],
 *   "overview": "Beautiful apartment with natural light..."
 * }
 * 
 * Response: { "success": true, "id": "507f1f77bcf86cd799439011" }
 */
export const postProperty = async (req, res) => {

    try {

        const db = getDatabase();

        const data = req.body;

        const propertyType = data.propertyType; // flat | building

        // Base property object
        const property = {

            title: data.title,
            listingType: data.listingType,        // rent | sale
            propertyType: propertyType,           // flat | building
            price: Number(data.price),             // sale price or rent per month
            areaSqFt: Number(data.areaSqFt),

            // Address object now stores IDs + full address
            address: {
                division_id: data.address.division_id,
                district_id: data.address.district_id,
                upazila_id: data.address.upazila_id,
                street: data.address.street
            },

            // Array of image URLs from ImgBB
            images: data.images || [],

            overview: data.overview,
            amenities: data.amenities || [],

            location: {
                lat: Number(data.location.lat),
                lng: Number(data.location.lng)
            },

            owner: {
                uid: req.user.uid,
                name: req.user.name,
                email: req.user.email,
                photoURL: req.user.photoURL
            },

            isOwnerVerified: req.user.isVerified,
            status: "active", // pending → active (approved) → hidden (owner hides) → deal-in-progress → sold/rented
            active_proposal_id: null, // No active proposal initially
            createdAt: new Date()
        };

        // Dynamic fields based on property type
        if (propertyType === "building") {
            // For building: floorCount and totalUnits
            property.floorCount = Number(data.floorCount);
            property.totalUnits = Number(data.totalUnits);
        } else if (propertyType === "flat") {
            // For flat: roomCount and bathrooms
            property.roomCount = Number(data.roomCount);
            property.bathrooms = Number(data.bathrooms);
        }

        try {
            property.aiAppraisal = await generatePropertyAppraisal(property);
        } catch (appraisalError) {
            console.error("Property appraisal generation failed during property creation:", appraisalError.message);
            property.aiAppraisal = null;
        }

        // Insert directly into the "properties" collection

        const result = await db.collection("properties").insertOne(property);

        res.status(201).send({ success: true, id: result.insertedId });

    } catch (error) {

        console.error(error);

        res.status(500).send({ message: "Server error" });

    }



// ========== PROPERTY RETRIEVAL ==========

/**
 * Get owner's properties
 * 
 * GET /api/properties/my-properties?email=user@example.com
 * 
 * Lists all properties owned by authenticated user
 * Includes count of active applications for each property
 * Sorted by creation date (newest first)
 * 
 * @query {string} email - Owner's email (required)
 * 
 * @returns {200} Array of owner's properties with application counts
 * @returns {200[].requestsCount} Number of active applications
 * 
 * @returns {400} Missing email
 * @returns {500} Database error
 * 
 * @auth Required (authenticated owner)
 * 
 * Application count includes pending, counter, deal-in-progress, and completed statuses
 * 
 * @example
 * GET /api/properties/my-properties?email=owner@example.com
 * 
 * Response: [
 *   { _id, title, price, status, requestsCount: 3, ... },
 *   { _id, title, price, status, requestsCount: 0, ... }
 * ]
 */
export const getMyProperties = async (req, res) => {

    try {

        const db = getDatabase();

        const email = req.query.email;

        const query = { "owner.email": email };

        // Sorting by newest first
        const properties = await db.collection("properties")
            .find(query)
            .sort({ createdAt: -1 })
            .toArray();

        // Get application counts for each property
        const propertiesWithCounts = await Promise.all(
            properties.map(async (property) => {
                const applicationCount = await db.collection("applications").countDocuments({
                    propertyId: property._id,
                    status: { $in: ["pending", "counter", "deal-in-progress", "completed"] }
                });
                return {
                    ...property,
                    requestsCount: applicationCount
                };
            })
        );

        res.send(propertiesWithCounts);

    } catch (error) {

        console.error("GET /my-properties error:", error);

        res.status(500).send({ message: "Server error" });

    }



// ========== SINGLE PROPERTY DETAILS ==========

/**
 * Get property details
 * 
 * GET /api/properties/:id
 * 
 * Retrieves complete property information by ID
 * Returns all property details including owner info and appraisal
 * No authentication required - public data for marketplace
 * 
 * @param {string} req.params.id - Property MongoDB ObjectId
 * 
 * @returns {200} Complete property object
 * @returns {200._id, title, price, owner, aiAppraisal, ...} All property fields
 * 
 * @returns {400} Invalid ID format
 * @returns {404} Property not found
 * @returns {500} Database error
 * 
 * @example
 * GET /api/properties/507f1f77bcf86cd799439011
 * 
 * Response: { _id, title, price, location, owner, status, aiAppraisal, ... }
 */
export const getPropertyById = async (req, res) => {

    try {

        const db = getDatabase();

        const id = req.params.id;

        if (!ObjectId.isValid(id)) {

            return res.status(400).send({ message: "Invalid ID format" });

        }

        const result = await db.collection("properties").findOne({ _id: new ObjectId(id) });

        if (!result) return res.status(404).send({ message: "Property not found" });

        res.send(result);

    } catch (error) {

        console.error("GET /property/:id error:", error);

        res.status(500).send({ message: "Server error" });

    }



// ========== MARKETPLACE BROWSING ==========

/**
 * Get all active properties (marketplace)
 * 
 * GET /api/properties
 * 
 * Lists all active properties available on marketplace
 * Returns only properties with active status (publicly listed)
 * Sorted by newest first
 * Public endpoint (no authentication required)
 * 
 * @returns {200} Array of active properties
 * @returns {200[].status} Always "active"
 * @returns {200[].owner, title, price, location, ...} Property details
 * 
 * @returns {500} Database error
 * 
 * Usage: Primary endpoint for marketplace browsing
 * Results automatically exclude: pending, rejected, hidden, sold, rented, removed
 * 
 * @example
 * GET /api/properties
 * 
 * Response: [
 *   { _id, title, price, location, owner, images, ... },
 *   ...
 * ]
 */
export const getActiveProperties = async (req, res) => {

    try {

        const db = getDatabase();

        // Only show active properties (not pending, rejected, hidden, sold, rented, removed)
        const result = await db.collection("properties")
            .find({ 
                status: "active"  // Only active properties are shown in marketplace
            })
            .sort({ createdAt: -1 })          // newest first
            .toArray();

        return res.json(result);

    } catch (error) {

        console.error("GET /properties error:", error);

        res.status(500).json({ message: "Server error" });

    }
    


// ========== PROPERTY MODIFICATION ==========

/**
 * Update property details
 * 
 * PATCH /api/properties/:id
 * 
 * Owner updates property information
 * Regenerates AI appraisal with updated data
 * Cannot update while in active deal (deal-in-progress, sold, rented)
 * Cannot edit title, listing type, property type, or owner info
 * 
 * @param {string} req.params.id - Property MongoDB ObjectId
 * @param {Object} req.body - Updated property fields
 * @param {number} req.body.price - Updated price/rent
 * @param {number} req.body.areaSqFt - Updated area
 * @param {Object} req.body.location - Updated coordinates
 * @param {string} req.body.overview - Updated description
 * @param {Array} req.body.amenities - Updated amenities list
 * @param {Array<string>} req.body.images - Updated image URLs
 * @param {number} req.body.roomCount - [Flat] Updated rooms
 * @param {number} req.body.bathrooms - [Flat] Updated bathrooms
 * @param {number} req.body.floorCount - [Building] Updated floors
 * @param {number} req.body.totalUnits - [Building] Updated units
 * 
 * @returns {200} Property updated successfully
 * 
 * @returns {400} Invalid ID format / Property in active deal (cannot edit)
 * @returns {404} Property not found / Ownership verification failed
 * @returns {500} Database/appraisal generation error
 * 
 * @auth Required (authenticated owner)
 * 
 * Deal Protection:
 * - Blocks edits if status: deal-in-progress, sold, rented
 * - Owner must cancel/complete deal before editing
 * 
 * Appraisal:
 * - Regenerated with updated property data
 * - Gracefully falls back to existing if service unavailable
 * 
 * @example
 * PATCH /api/properties/507f1f77bcf86cd799439011
 * {
 *   "price": 55000,
 *   "areaSqFt": 1400,
 *   "overview": "Updated description..."
 * }
 * 
 * Response: { "success": true, "message": "Property updated successfully" }
 */
export const updateProperty = async (req, res) => {

    try {

        const db = getDatabase();

        const id = req.params.id;

        if (!ObjectId.isValid(id)) {

            return res.status(400).send({ message: "Invalid ID format" });

        }

        const data = req.body;

        // Get the existing property to check propertyType
        const existingProperty = await db.collection("properties").findOne({ _id: new ObjectId(id) });
        
        if (!existingProperty) {
            return res.status(404).send({ message: "Property not found" });
        }

        // Prevent editing properties that are in deal-in-progress, sold, or rented
        if (["deal-in-progress", "sold", "rented"].includes(existingProperty.status)) {
            return res.status(400).send({ 
                message: `Cannot edit property that is ${existingProperty.status}. Please complete or cancel the deal first.` 
            });
        }

        const propertyType = existingProperty.propertyType; // flat | building

        // Only allow updating specific fields
        const updateData = {

            price: Number(data.price),
            areaSqFt: Number(data.areaSqFt),
            images: data.images || [],
            overview: data.overview,
            amenities: data.amenities || [],
            location: {
                lat: Number(data.location.lat),
                lng: Number(data.location.lng)
            },
            updatedAt: new Date()

        };

        // Dynamic fields based on property type
        if (propertyType === "building") {
            // For building: floorCount and totalUnits
            updateData.floorCount = Number(data.floorCount);
            updateData.totalUnits = Number(data.totalUnits);
        } else if (propertyType === "flat") {
            // For flat: roomCount and bathrooms
            updateData.roomCount = Number(data.roomCount);
            updateData.bathrooms = Number(data.bathrooms);
        }

        try {
            updateData.aiAppraisal = await generatePropertyAppraisal({
                ...existingProperty,
                ...updateData,
                propertyType,
                listingType: existingProperty.listingType,
                address: existingProperty.address
            });
        } catch (appraisalError) {
            console.error("Property appraisal generation failed during property update:", appraisalError.message);
            updateData.aiAppraisal = existingProperty.aiAppraisal || null;
        }

        const result = await db.collection("properties").updateOne(
            { _id: new ObjectId(id), "owner.email": req.user.email },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {

            return res.status(404).send({ message: "Property not found or you don't have permission" });

        }

        res.send({ success: true, message: "Property updated successfully" });

    } catch (error) {

        console.error("UPDATE /property/:id error:", error);

        res.status(500).send({ message: "Server error" });

    }



/**
 * Delete property
 * 
 * DELETE /api/properties/:id
 * 
 * Owner permanently removes property listing
 * Includes critical deal protection logic
 * Cannot delete properties with active applications or deals
 * 
 * @param {string} req.params.id - Property MongoDB ObjectId
 * 
 * @returns {200} Property deleted successfully
 * 
 * @returns {400} Invalid ID format / Has active applications / In active deal
 * @returns {403} Not property owner
 * @returns {404} Property not found
 * @returns {500} Database error
 * 
 * @auth Required (authenticated owner)
 * 
 * Deletion Protections:
 * - Cannot delete if status: deal-in-progress, sold, rented
 * - Cannot delete if has pending, counter, or in-progress applications
 * - Must complete/cancel deals and resolve applications first
 * - Owner must be verified before deletion allowed
 * 
 * @example
 * DELETE /api/properties/507f1f77bcf86cd799439011
 * 
 * Response: { "success": true, "message": "Property deleted successfully" }
 * 
 * Errors:
 * 400 "Cannot delete property that is deal-in-progress..."
 * 400 "Cannot delete property with active applications..."
 * 403 "You don't have permission to delete this property"
 */
export const deleteProperty = async (req, res) => {

    try {

        const db = getDatabase();

        const id = req.params.id;

        if (!ObjectId.isValid(id)) {

            return res.status(400).send({ message: "Invalid ID format" });

        }

        // Get the property first to check status
        const property = await db.collection("properties").findOne({
            _id: new ObjectId(id)
        });

        if (!property) {
            return res.status(404).send({ message: "Property not found" });
        }

        // Verify ownership
        if (property.owner.email !== req.user.email) {
            return res.status(403).send({ message: "You don't have permission to delete this property" });
        }

        // CRITICAL: Cannot delete properties with active deals
        if (["deal-in-progress", "sold", "rented"].includes(property.status)) {
            return res.status(400).send({ 
                message: `Cannot delete property that is ${property.status}. Please complete or cancel the deal first.` 
            });
        }

        // Check if property has any active applications
        const activeApplications = await db.collection("applications").countDocuments({
            propertyId: new ObjectId(id),
            status: { $in: ["pending", "counter", "deal-in-progress"] }
        });

        if (activeApplications > 0) {
            return res.status(400).send({ 
                message: "Cannot delete property with active applications. Please wait for applications to be resolved or reject them first." 
            });
        }

        const result = await db.collection("properties").deleteOne(
            { _id: new ObjectId(id), "owner.email": req.user.email }
        );

        if (result.deletedCount === 0) {

            return res.status(404).send({ message: "Property not found or you don't have permission" });

        }

        res.send({ success: true, message: "Property deleted successfully" });

    } catch (error) {

        console.error("DELETE /property/:id error:", error);

        res.status(500).send({ message: "Server error" });

    }



// ========== PROPERTY VISIBILITY MANAGEMENT ==========

/**
 * Toggle property visibility (hide/show)
 * 
 * PATCH /api/properties/:id/visibility
 * 
 * Owner hides or shows property on marketplace
 * Supports toggling between active and hidden states
 * Can hide deal-in-progress properties (restores when unhiding)
 * Cannot toggle properties in other states: sold, rented, rejected, pending, removed
 * 
 * @param {string} req.params.id - Property MongoDB ObjectId
 * 
 * @returns {200} Visibility toggled successfully
 * @returns {200.status} New status ('active' or 'hidden')
 * 
 * @returns {400} Invalid ID format / Cannot toggle this property status
 * @returns {403} Not property owner
 * @returns {404} Property not found
 * @returns {500} Database error
 * 
 * @auth Required (authenticated owner)
 * 
 * Toggling Logic:
 * - active → hidden: Hide property from marketplace
 * - hidden → active: Show property again (or restore previous status)
 * - deal-in-progress → hidden: Hide during active deal, save state
 * - hidden (from deal) → deal-in-progress: Restore to deal when unhiding
 * 
 * Cannot toggle: sold, rented, rejected, pending, removed
 * 
 * @example
 * PATCH /api/properties/507f1f77bcf86cd799439011/visibility
 * 
 * If status was active:
 * Response: { "success": true, "message": "Property hidden successfully", "status": "hidden" }
 * 
 * If status was hidden:
 * Response: { "success": true, "message": "Property shown successfully", "status": "active" }
 */
export const togglePropertyVisibility = async (req, res) => {

    try {

        const db = getDatabase();

        const id = req.params.id;

        if (!ObjectId.isValid(id)) {

            return res.status(400).send({ message: "Invalid ID format" });

        }

        // Get the property
        const property = await db.collection("properties").findOne({ _id: new ObjectId(id) });

        if (!property) {

            return res.status(404).send({ message: "Property not found" });

        }

        // Verify ownership
        if (property.owner.email !== req.user.email) {

            return res.status(403).send({ message: "You don't have permission to update this property" });

        }

        // Can toggle between active, hidden, and deal-in-progress
        // Cannot toggle if property is sold, rented, rejected, pending, or removed
        if (!["active", "hidden", "deal-in-progress"].includes(property.status)) {

            return res.status(400).send({ 
                message: `Cannot toggle visibility for properties with status: ${property.status}. Can only toggle for active, hidden, or deal-in-progress properties.` 
            });

        }

        // Toggle status: active ↔ hidden (for deal-in-progress, toggle to hidden)
        let newStatus;
        let updateData = {
            updatedAt: new Date()
        };
        
        if (property.status === "active") {
            newStatus = "hidden";
        } else if (property.status === "hidden") {
            // When unhiding, restore to previousStatus if it exists (deal-in-progress), otherwise active
            newStatus = property.previousStatus || "active";
            // Clear previousStatus if we're restoring
            if (property.previousStatus) {
                updateData.previousStatus = null;
            }
        } else if (property.status === "deal-in-progress") {
            // For deal-in-progress, hide it but store deal-in-progress as previousStatus
            newStatus = "hidden";
            updateData.previousStatus = "deal-in-progress";
        } else {
            newStatus = "active"; // fallback
        }
        
        updateData.status = newStatus;

        const result = await db.collection("properties").updateOne(
            { _id: new ObjectId(id) },
            { 
                $set: updateData
            }
        );

        if (result.matchedCount === 0) {

            return res.status(404).send({ message: "Property not found" });

        }

        res.send({ 
            success: true, 
            message: `Property ${newStatus === "active" ? "shown" : "hidden"} successfully`,
            status: newStatus
        });

    } catch (error) {

        console.error("PATCH /property/:id/visibility error:", error);

        res.status(500).send({ message: "Server error" });

    }



/**
 * Reopen rented property
 * 
 * PATCH /api/properties/:id/reopen
 * 
 * Owner re-lists property after rental period ends
 * Changes status from 'rented' back to 'active'
 * Only works for rented properties (sold cannot be reopened)
 * Clears active proposal ID to allow new applications
 * 
 * @param {string} req.params.id - Property MongoDB ObjectId
 * 
 * @returns {200} Listing reopened successfully
 * @returns {200.status} 'active'
 * 
 * @returns {400} Invalid ID format / Property not rented
 * @returns {403} Not property owner
 * @returns {404} Property not found
 * @returns {500} Database error
 * 
 * @auth Required (authenticated owner)
 * 
 * Restrictions:
 * - Only works if status === 'rented'
 * - Sold properties cannot be reopened
 * - Clears active_proposal_id to accept new applications
 * - Sets visibility to 'visible'
 * 
 * @example
 * PATCH /api/properties/507f1f77bcf86cd799439011/reopen
 * 
 * Response: {
 *   "success": true,
 *   "message": "Listing reopened successfully. Your property is now active and visible on the marketplace.",
 *   "status": "active"
 * }
 * 
 * Error: Cannot reopen sold property
 */
export const reopenListing = async (req, res) => {

    try {

        const db = getDatabase();

        const id = req.params.id;

        if (!ObjectId.isValid(id)) {

            return res.status(400).send({ message: "Invalid ID format" });

        }

        // Get the property
        const property = await db.collection("properties").findOne({ _id: new ObjectId(id) });

        if (!property) {

            return res.status(404).send({ message: "Property not found" });

        }

        // Verify ownership
        if (property.owner.email !== req.user.email) {

            return res.status(403).send({ message: "You don't have permission to update this property" });

        }

        // Only allow reopening rented properties, not sold properties
        if (property.status !== "rented") {

            return res.status(400).send({ 
                message: "Can only reopen rented properties. Sold properties cannot be reopened." 
            });

        }

        // Change status from "rented" to "active" and clear visibility
        const result = await db.collection("properties").updateOne(
            { _id: new ObjectId(id) },
            { 
                $set: { 
                    status: "active",
                    visibility: "visible",
                    active_proposal_id: null, // Clear any active proposal
                    updatedAt: new Date()
                } 
            }
        );

        if (result.matchedCount === 0) {

            return res.status(404).send({ message: "Property not found" });

        }

        res.send({ 
            success: true, 
            message: "Listing reopened successfully. Your property is now active and visible on the marketplace.",
            status: "active"
        });

    } catch (error) {

        console.error("PATCH /property/:id/reopen error:", error);

        res.status(500).send({ message: "Server error" });

    }



// ========== FEATURED/HOMEPAGE PROPERTIES ==========

/**
 * Get featured properties for homepage
 * 
 * GET /api/properties/featured?limit=8
 * 
 * Retrieves newest active properties for homepage display
 * Returns limited subset of active marketplace properties
 * Sorted by creation date (newest first)
 * Public endpoint (no authentication required)
 * 
 * @query {number} limit - Number of properties to return (default: 8)
 * 
 * @returns {200} Array of featured properties (newest first)
 * @returns {200[].status} Always "active"
 * @returns {200[].title, price, location, owner, ...} Featured property details
 * 
 * @returns {500} Database error
 * 
 * Usage: Homepage featured section showing latest available properties
 * Only shows: active properties
 * Excludes: pending, rejected, hidden, sold, rented, removed
 * 
 * @example
 * GET /api/properties/featured?limit=8
 * 
 * Response: [
 *   { _id, title, price, location, owner, images, ... },
 *   { _id, title, price, location, owner, images, ... },
 *   ...
 * ]
 * 
 * Customization:
 * - Default shows 8 properties
 * - Can request more/fewer with ?limit=N parameter
 */
export const getFeaturedProperties = async (req, res) => {

    try {

        const db = getDatabase();

        const limit = parseInt(req.query.limit) || 8; // Default to 8, can be customized

        // Get latest active properties (not pending, rejected, hidden, sold, rented, removed)
        const result = await db.collection("properties")
            .find({ 
                status: "active"  // Only active properties are shown
            })
            .sort({ createdAt: -1 })          // newest first
            .limit(limit)
            .toArray();

        return res.json(result);

    } catch (error) {

        console.error("GET /featured-properties error:", error);

        res.status(500).json({ message: "Server error" });

    }
    
};
