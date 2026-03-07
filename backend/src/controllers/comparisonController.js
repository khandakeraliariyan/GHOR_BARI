import { ComparisonModel } from "../models/Comparison.js";
import { ObjectId } from "mongodb";


// ========== COMPARISON CONTROLLER ==========

/**
 * Property Comparison Feature
 * 
 * Allows users to create side-by-side property comparisons
 * Features:
 * - Create comparison of 1-10 properties
 * - Save comparisons for later viewing
 * - Share comparisons via public share links
 * - Dynamic property list updates (add/remove)
 * - Public/private visibility control
 * 
 * Access Control:
 * - Creator can view/edit their own comparisons
 * - Public comparisons accessible via share link
 * - Private comparisons only visible to creator
 */


// ========== COMPARISON CREATION ==========

/**
 * Create a new property comparison
 * 
 * POST /api/comparison
 * 
 * @param {Object} req.body
 * @param {Array<ObjectId|string>} req.body.propertyIds - IDs of properties to compare (1-10)
 * @param {string} req.body.title - Custom name for comparison (optional)
 * @param {boolean} req.body.isPublic - Make publicly shareable (default false)
 * 
 * @returns {201} Comparison created successfully
 * @returns {201.comparison._id} MongoDB ObjectId of new comparison
 * @returns {201.comparison.userId} Creator's Firebase UID
 * @returns {201.comparison.userEmail} Creator's email
 * @returns {201.comparison.propertyIds} Array of compared property IDs
 * @returns {201.comparison.isPublic} Visibility setting
 * @returns {201.comparison.shareLink} Share link token (if public)
 * @returns {201.comparison.createdAt} Creation timestamp
 * 
 * @returns {400} Missing properties or too many properties (>10)
 * @returns {401} Unauthenticated
 * @returns {404} One or more properties not found
 * @returns {500} Server error
 * 
 * @auth Required (verifyToken)
 * @param {Object} req.user - Authenticated user from middleware
 * @param {string} req.user.uid - Firebase User ID
 * @param {string} req.user.email - User email address
 */
export const createComparison = async (req, res) => {

    try {

        const db = req.db;
        const { propertyIds, title, isPublic } = req.body;
        const userEmail = req.user.email;

        // Validate properties array is provided
        if (!propertyIds || propertyIds.length === 0) {
            return res.status(400).json({ message: "At least one property is required" });
        }

        // Enforce maximum comparison limit
        if (propertyIds.length > 10) {
            return res.status(400).json({ message: "Cannot compare more than 10 properties" });
        }

        // ========== VERIFY PROPERTIES EXIST ==========

        /**
         * Query database for all provided property IDs
         * Ensures valid property references before creating comparison
         */
        const properties = await db.collection("properties")
            .find({ _id: { $in: propertyIds.map(id => new ObjectId(id)) } })
            .toArray();

        // Check if all properties were found
        if (properties.length !== propertyIds.length) {
            return res.status(404).json({ message: "One or more properties not found" });
        }

        // ========== CREATE COMPARISON ==========

        /**
         * Create new comparison document with user context
         * Assigns title, visibility, and property list
         */
        const comparisonId = await ComparisonModel.create(db, {
            userId: req.user.uid,
            userEmail,
            title: title || "My Property Comparison",
            propertyIds,
            isPublic: isPublic || false
        });

        // Fetch created comparison with full details
        const comparison = await ComparisonModel.findById(db, comparisonId);

        return res.status(201).json({
            message: "Comparison created successfully",
            comparison
        });

    } catch (error) {

        console.error("POST /create-comparison error:", error);
        res.status(500).json({ message: "Server error" });

    }

};


// ========== COMPARISON RETRIEVAL ==========

/**
 * Get single comparison by ID
 * 
 * GET /api/comparison/:comparisonId
 * 
 * Retrieves full comparison with enriched property data and owner information
 * Private comparisons only accessible to creator
 * Public comparisons accessible to anyone
 * 
 * @param {string} req.params.comparisonId - Comparison MongoDB ObjectId
 * 
 * @returns {200} Comparison retrieved
 * @returns {200.comparison._id} Comparison ID
 * @returns {200.comparison.title} Comparison name
 * @returns {200.comparison.properties} Array of full property objects with owners
 * @returns {200.comparison.isPublic} Visibility status
 * @returns {200.comparison.createdAt} Creation timestamp
 * 
 * @returns {401} Unauthenticated
 * @returns {403} Unauthorized - user cannot access private comparison
 * @returns {404} Comparison not found
 * @returns {500} Server error
 * 
 * @auth Required (verifyToken) for private comparisons
 */
export const getComparison = async (req, res) => {

    try {

        const db = req.db;
        const { comparisonId } = req.params;

        // ========== FETCH COMPARISON WITH PROPERTIES ==========

        /**
         * Retrieves comparison with enriched property data
         * includes full property objects and owner information
         */
        const comparison = await ComparisonModel.getComparisonWithPropertiesAndOwners(db, comparisonId);

        // Check if comparison exists
        if (!comparison) {
            return res.status(404).json({ message: "Comparison not found" });
        }

        // ========== ACCESS CONTROL ==========

        /**
         * Verify user has access to this comparison
         * Public comparisons accessible to all
         * Private comparisons only to creator
         */
        if (!comparison.isPublic && comparison.userEmail !== req.user?.email) {
            return res.status(403).json({ message: "Unauthorized access" });
        }

        return res.status(200).json({
            message: "Comparison retrieved",
            comparison
        });

    } catch (error) {

        console.error("GET /comparison/:comparisonId error:", error);
        res.status(500).json({ message: "Server error" });

    }

};


/**
 * Get comparison by public share link
 * 
 * GET /api/comparison/share/:shareLink
 * 
 * Retrieves comparison using share token instead of ID
 * Only accessible for public comparisons
 * Share links can expire
 * 
 * @param {string} req.params.shareLink - Share token generated on publish
 * 
 * @returns {200} Comparison retrieved via share link
 * @returns {200.comparison} Full comparison with properties
 * 
 * @returns {404} Share link not found or expired
 * @returns {500} Server error
 * 
 * @auth Not required - public endpoint
 */
export const getComparisonByShareLink = async (req, res) => {

    try {

        const db = req.db;
        const { shareLink } = req.params;

        // ========== FIND BY SHARE LINK ==========

        /**
         * Look up comparison using public share token
         * Verifies share link exists and hasn't expired
         */
        const comparison = await ComparisonModel.findByShareLink(db, shareLink);

        // Check if share link valid
        if (!comparison) {
            return res.status(404).json({ message: "Comparison not found or has expired" });
        }

        // ========== FETCH FULL COMPARISON DATA ==========

        /**
         * Get complete comparison with enriched property details
         * includes owners and full property information
         */
        const fullComparison = await ComparisonModel.getComparisonWithPropertiesAndOwners(
            db,
            comparison._id.toString()
        );

        return res.status(200).json({
            message: "Comparison retrieved",
            comparison: fullComparison
        });

    } catch (error) {

        console.error("GET /comparison/share/:shareLink error:", error);
        res.status(500).json({ message: "Server error" });

    }

};


/**
 * Get all comparisons for authenticated user
 * 
 * GET /api/user/comparisons
 * 
 * Returns list of all comparisons created by current user
 * Includes both public and private comparisons
 * 
 * @returns {200} All user comparisons
 * @returns {200.comparisons} Array of comparison documents
 * 
 * @returns {401} Unauthenticated
 * @returns {500} Server error
 * 
 * @auth Required (verifyToken)
 */
export const getUserComparisons = async (req, res) => {

    try {

        const db = req.db;
        const userEmail = req.user.email;

        // ========== FETCH USER'S COMPARISONS ==========

        /**
         * Query all comparisons where user is creator
         * Sorted by creation date (newest first)
         */
        const comparisons = await ComparisonModel.findByUserId(db, userEmail);

        return res.status(200).json({
            message: "User comparisons retrieved",
            comparisons
        });

    } catch (error) {

        console.error("GET /user-comparisons error:", error);
        res.status(500).json({ message: "Server error" });

    }

};


// ========== COMPARISON MODIFICATION ==========

/**
 * Update comparison title and visibility
 * 
 * PUT /api/comparison/:comparisonId
 * 
 * Allows modifications to comparison settings
 * Only creator can update
 * 
 * @param {string} req.params.comparisonId - Comparison ID
 * @param {Object} req.body
 * @param {string} req.body.title - New comparison title (optional)
 * @param {boolean} req.body.isPublic - Update visibility (optional)
 * @param {Array<ObjectId|string>} req.body.propertyIds - Replace properties list (optional, max 10)
 * 
 * @returns {200} Comparison updated
 * @returns {200.comparison} Updated comparison object
 * 
 * @returns {400} Invalid property count (>10)
 * @returns {401} Unauthenticated
 * @returns {403} Unauthorized - not creator
 * @returns {404} Comparison not found
 * @returns {500} Server error
 * 
 * @auth Required (verifyToken)
 */
export const updateComparison = async (req, res) => {

    try {

        const db = req.db;
        const { comparisonId } = req.params;
        const { title, isPublic, propertyIds } = req.body;
        const userEmail = req.user.email;

        // ========== VERIFY OWNERSHIP ==========

        /**
         * Only creator can modify comparison
         * Fetch current comparison to check ownership
         */
        const comparison = await ComparisonModel.findById(db, comparisonId);
        if (!comparison) {
            return res.status(404).json({ message: "Comparison not found" });
        }

        // Verify user owns this comparison
        if (comparison.userEmail !== userEmail) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // ========== VALIDATE UPDATES ==========

        /**
         * If updating property list, enforce 10-property limit
         */
        if (propertyIds && propertyIds.length > 10) {
            return res.status(400).json({ message: "Cannot compare more than 10 properties" });
        }

        // ========== PREPARE UPDATE ==========

        /**
         * Build update object with only provided fields
         * Ignores undefined fields to allow partial updates
         */
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (isPublic !== undefined) updateData.isPublic = isPublic;
        if (propertyIds !== undefined) updateData.propertyIds = propertyIds;

        // Perform update
        await ComparisonModel.update(db, comparisonId, updateData);

        // Fetch updated comparison
        const updatedComparison = await ComparisonModel.findById(db, comparisonId);

        return res.status(200).json({
            message: "Comparison updated",
            comparison: updatedComparison
        });

    } catch (error) {

        console.error("PUT /comparison/:comparisonId error:", error);
        res.status(500).json({ message: "Server error" });

    }

};


/**
 * Add single property to comparison
 * 
 * POST /api/comparison/:comparisonId/add-property
 * 
 * Dynamically adds property to existing comparison
 * Maximum 10 properties per comparison
 * Prevents duplicate additions
 * 
 * @param {string} req.params.comparisonId - Comparison ID
 * @param {Object} req.body
 * @param {ObjectId|string} req.body.propertyId - Property to add
 * 
 * @returns {200} Property added
 * @returns {200.comparison} Updated comparison
 * 
 * @returns {400} Missing property ID / already at max / duplicate property
 * @returns {401} Unauthenticated
 * @returns {403} Unauthorized - not creator
 * @returns {404} Comparison not found / property not found
 * @returns {500} Server error
 * 
 * @auth Required (verifyToken)
 */
export const addPropertyToComparison = async (req, res) => {

    try {

        const db = req.db;
        const { comparisonId } = req.params;
        const { propertyId } = req.body;
        const userEmail = req.user.email;

        // Validate property ID provided
        if (!propertyId) {
            return res.status(400).json({ message: "Property ID is required" });
        }

        // ========== VERIFY OWNERSHIP ==========

        /**
         * Only creator can modify comparison properties
         */
        const comparison = await ComparisonModel.findById(db, comparisonId);
        if (!comparison) {
            return res.status(404).json({ message: "Comparison not found" });
        }

        if (comparison.userEmail !== userEmail) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // ========== CHECK CAPACITY ==========

        /**
         * Enforce 10-property maximum limit
         */
        if (comparison.propertyIds.length >= 10) {
            return res.status(400).json({ message: "Cannot add more than 10 properties to comparison" });
        }

        // ========== CHECK DUPLICATES ==========

        /**
         * Prevent adding same property twice
         */
        if (comparison.propertyIds.some(id => id.toString() === propertyId)) {
            return res.status(400).json({ message: "Property already in comparison" });
        }

        // ========== VERIFY PROPERTY EXISTS ==========

        /**
         * Ensure property exists in database before adding
         */
        const property = await db.collection("properties").findOne({
            _id: new ObjectId(propertyId)
        });

        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }

        // ========== ADD PROPERTY ==========

        /**
         * Add property ID to comparison's property list
         */
        await ComparisonModel.addProperty(db, comparisonId, propertyId);

        // Fetch updated comparison
        const updatedComparison = await ComparisonModel.findById(db, comparisonId);

        return res.status(200).json({
            message: "Property added to comparison",
            comparison: updatedComparison
        });

    } catch (error) {

        console.error("POST /comparison/:comparisonId/add-property error:", error);
        res.status(500).json({ message: "Server error" });

    }

};


/**
 * Remove property from comparison
 * 
 * DELETE /api/comparison/:comparisonId/property/:propertyId
 * 
 * Removes specific property from comparison
 * Only creator can remove properties
 * 
 * @param {string} req.params.comparisonId - Comparison ID
 * @param {string} req.params.propertyId - Property ID to remove
 * 
 * @returns {200} Property removed
 * @returns {200.comparison} Updated comparison
 * 
 * @returns {401} Unauthenticated
 * @returns {403} Unauthorized - not creator
 * @returns {404} Comparison not found
 * @returns {500} Server error
 * 
 * @auth Required (verifyToken)
 */
export const removePropertyFromComparison = async (req, res) => {

    try {

        const db = req.db;
        const { comparisonId, propertyId } = req.params;
        const userEmail = req.user.email;

        // ========== VERIFY OWNERSHIP ==========

        /**
         * Only creator can modify comparison
         */
        const comparison = await ComparisonModel.findById(db, comparisonId);
        if (!comparison) {
            return res.status(404).json({ message: "Comparison not found" });
        }

        if (comparison.userEmail !== userEmail) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // ========== REMOVE PROPERTY ==========

        /**
         * Remove property ID from comparison's list
         */
        await ComparisonModel.removeProperty(db, comparisonId, propertyId);

        // Fetch updated comparison
        const updatedComparison = await ComparisonModel.findById(db, comparisonId);

        return res.status(200).json({
            message: "Property removed from comparison",
            comparison: updatedComparison
        });

    } catch (error) {

        console.error("DELETE /comparison/:comparisonId/property/:propertyId error:", error);
        res.status(500).json({ message: "Server error" });

    }

};


// ========== COMPARISON DELETION ==========

/**
 * Delete comparison permanently
 * 
 * DELETE /api/comparison/:comparisonId
 * 
 * Removes comparison and all associated data
 * Only creator can delete
 * Irreversible action
 * 
 * @param {string} req.params.comparisonId - Comparison ID
 * 
 * @returns {200} Comparison deleted
 * 
 * @returns {401} Unauthenticated
 * @returns {403} Unauthorized - not creator
 * @returns {404} Comparison not found
 * @returns {500} Server error
 * 
 * @auth Required (verifyToken)
 */
export const deleteComparison = async (req, res) => {

    try {

        const db = req.db;
        const { comparisonId } = req.params;
        const userEmail = req.user.email;

        // ========== VERIFY OWNERSHIP ==========

        /**
         * Only creator can delete comparison
         */
        const comparison = await ComparisonModel.findById(db, comparisonId);
        if (!comparison) {
            return res.status(404).json({ message: "Comparison not found" });
        }

        if (comparison.userEmail !== userEmail) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // ========== DELETE COMPARISON ==========

        /**
         * Permanently remove comparison from database
         */
        await ComparisonModel.delete(db, comparisonId);

        return res.status(200).json({
            message: "Comparison deleted"
        });

    } catch (error) {

        console.error("DELETE /comparison/:comparisonId error:", error);
        res.status(500).json({ message: "Server error" });

    }

};


// ========== COMPARISON SHARING ==========

/**
 * Share comparison via public link
 * 
 * POST /api/comparison/:comparisonId/share
 * 
 * Makes comparison publicly accessible via share link
 * Generates unique share token
 * Allows sharing with non-users
 * 
 * @param {string} req.params.comparisonId - Comparison ID
 * 
 * @returns {200} Comparison made public
 * @returns {200.comparison} Updated comparison
 * @returns {200.shareLink} Path to share with others
 * 
 * @returns {401} Unauthenticated
 * @returns {403} Unauthorized - not creator
 * @returns {404} Comparison not found
 * @returns {500} Server error
 * 
 * @auth Required (verifyToken)
 */
export const shareComparison = async (req, res) => {

    try {

        const db = req.db;
        const { comparisonId } = req.params;
        const userEmail = req.user.email;

        // ========== VERIFY OWNERSHIP ==========

        /**
         * Only creator can share comparison
         */
        const comparison = await ComparisonModel.findById(db, comparisonId);
        if (!comparison) {
            return res.status(404).json({ message: "Comparison not found" });
        }

        if (comparison.userEmail !== userEmail) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // ========== MAKE PUBLIC ==========

        /**
         * Update comparison visibility to public
         * Enables share link access
         */
        await ComparisonModel.update(db, comparisonId, { isPublic: true });

        // Fetch updated comparison with share settings
        const updatedComparison = await ComparisonModel.findById(db, comparisonId);

        return res.status(200).json({
            message: "Comparison is now public",
            comparison: updatedComparison,
            shareLink: `/comparison/share/${updatedComparison.shareLink}`
        });

    } catch (error) {

        console.error("POST /comparison/:comparisonId/share error:", error);
        res.status(500).json({ message: "Server error" });

    }

};


/**
 * Revoke public access to comparison
 * 
 * POST /api/comparison/:comparisonId/private
 * 
 * Makes comparison private again
 * Invalidates share link
 * Only creator can access after this
 * 
 * @param {string} req.params.comparisonId - Comparison ID
 * 
 * @returns {200} Comparison made private
 * @returns {200.comparison} Updated comparison
 * 
 * @returns {401} Unauthenticated
 * @returns {403} Unauthorized - not creator
 * @returns {404} Comparison not found
 * @returns {500} Server error
 * 
 * @auth Required (verifyToken)
 */
export const makeComparisonPrivate = async (req, res) => {

    try {

        const db = req.db;
        const { comparisonId } = req.params;
        const userEmail = req.user.email;

        // ========== VERIFY OWNERSHIP ==========

        /**
         * Only creator can change visibility
         */
        const comparison = await ComparisonModel.findById(db, comparisonId);
        if (!comparison) {
            return res.status(404).json({ message: "Comparison not found" });
        }

        if (comparison.userEmail !== userEmail) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // ========== MAKE PRIVATE ==========

        /**
         * Update comparison visibility to private
         * Disables share link access
         */
        await ComparisonModel.update(db, comparisonId, { isPublic: false });

        // Fetch updated comparison
        const updatedComparison = await ComparisonModel.findById(db, comparisonId);

        return res.status(200).json({
            message: "Comparison is now private",
            comparison: updatedComparison
        });

    } catch (error) {

        console.error("POST /comparison/:comparisonId/private error:", error);
        res.status(500).json({ message: "Server error" });

    }

};
    try {
        const db = req.db;
        const { propertyIds, title, isPublic } = req.body;
        const userEmail = req.user.email;

        if (!propertyIds || propertyIds.length === 0) {
            return res.status(400).json({ message: "At least one property is required" });
        }

        if (propertyIds.length > 10) {
            return res.status(400).json({ message: "Cannot compare more than 10 properties" });
        }

        // Verify all properties exist
        const properties = await db.collection("properties")
            .find({ _id: { $in: propertyIds.map(id => new ObjectId(id)) } })
            .toArray();

        if (properties.length !== propertyIds.length) {
            return res.status(404).json({ message: "One or more properties not found" });
        }

        const comparisonId = await ComparisonModel.create(db, {
            userId: req.user.uid,
            userEmail,
            title: title || "My Property Comparison",
            propertyIds,
            isPublic: isPublic || false
        });

        const comparison = await ComparisonModel.findById(db, comparisonId);

        return res.status(201).json({
            message: "Comparison created successfully",
            comparison
        });

    } catch (error) {
        console.error("POST /create-comparison error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getComparison = async (req, res) => {
    try {
        const db = req.db;
        const { comparisonId } = req.params;

        const comparison = await ComparisonModel.getComparisonWithPropertiesAndOwners(db, comparisonId);

        if (!comparison) {
            return res.status(404).json({ message: "Comparison not found" });
        }

        // Check if user has access
        if (!comparison.isPublic && comparison.userEmail !== req.user?.email) {
            return res.status(403).json({ message: "Unauthorized access" });
        }

        return res.status(200).json({
            message: "Comparison retrieved",
            comparison
        });

    } catch (error) {
        console.error("GET /comparison/:comparisonId error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getComparisonByShareLink = async (req, res) => {
    try {
        const db = req.db;
        const { shareLink } = req.params;

        const comparison = await ComparisonModel.findByShareLink(db, shareLink);

        if (!comparison) {
            return res.status(404).json({ message: "Comparison not found or has expired" });
        }

        // Get full comparison with properties and owners
        const fullComparison = await ComparisonModel.getComparisonWithPropertiesAndOwners(
            db,
            comparison._id.toString()
        );

        return res.status(200).json({
            message: "Comparison retrieved",
            comparison: fullComparison
        });

    } catch (error) {
        console.error("GET /comparison/share/:shareLink error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getUserComparisons = async (req, res) => {
    try {
        const db = req.db;
        const userEmail = req.user.email;

        const comparisons = await ComparisonModel.findByUserId(db, userEmail);

        return res.status(200).json({
            message: "User comparisons retrieved",
            comparisons
        });

    } catch (error) {
        console.error("GET /user-comparisons error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const updateComparison = async (req, res) => {
    try {
        const db = req.db;
        const { comparisonId } = req.params;
        const { title, isPublic, propertyIds } = req.body;
        const userEmail = req.user.email;

        // Verify ownership
        const comparison = await ComparisonModel.findById(db, comparisonId);
        if (!comparison) {
            return res.status(404).json({ message: "Comparison not found" });
        }

        if (comparison.userEmail !== userEmail) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // Validate property count if updating
        if (propertyIds && propertyIds.length > 10) {
            return res.status(400).json({ message: "Cannot compare more than 10 properties" });
        }

        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (isPublic !== undefined) updateData.isPublic = isPublic;
        if (propertyIds !== undefined) updateData.propertyIds = propertyIds;

        await ComparisonModel.update(db, comparisonId, updateData);

        const updatedComparison = await ComparisonModel.findById(db, comparisonId);

        return res.status(200).json({
            message: "Comparison updated",
            comparison: updatedComparison
        });

    } catch (error) {
        console.error("PUT /comparison/:comparisonId error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const addPropertyToComparison = async (req, res) => {
    try {
        const db = req.db;
        const { comparisonId } = req.params;
        const { propertyId } = req.body;
        const userEmail = req.user.email;

        if (!propertyId) {
            return res.status(400).json({ message: "Property ID is required" });
        }

        // Verify ownership
        const comparison = await ComparisonModel.findById(db, comparisonId);
        if (!comparison) {
            return res.status(404).json({ message: "Comparison not found" });
        }

        if (comparison.userEmail !== userEmail) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // Check property count
        if (comparison.propertyIds.length >= 10) {
            return res.status(400).json({ message: "Cannot add more than 10 properties to comparison" });
        }

        // Check if property already exists
        if (comparison.propertyIds.some(id => id.toString() === propertyId)) {
            return res.status(400).json({ message: "Property already in comparison" });
        }

        // Verify property exists
        const property = await db.collection("properties").findOne({
            _id: new ObjectId(propertyId)
        });

        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }

        await ComparisonModel.addProperty(db, comparisonId, propertyId);

        const updatedComparison = await ComparisonModel.findById(db, comparisonId);

        return res.status(200).json({
            message: "Property added to comparison",
            comparison: updatedComparison
        });

    } catch (error) {
        console.error("POST /comparison/:comparisonId/add-property error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const removePropertyFromComparison = async (req, res) => {
    try {
        const db = req.db;
        const { comparisonId, propertyId } = req.params;
        const userEmail = req.user.email;

        // Verify ownership
        const comparison = await ComparisonModel.findById(db, comparisonId);
        if (!comparison) {
            return res.status(404).json({ message: "Comparison not found" });
        }

        if (comparison.userEmail !== userEmail) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await ComparisonModel.removeProperty(db, comparisonId, propertyId);

        const updatedComparison = await ComparisonModel.findById(db, comparisonId);

        return res.status(200).json({
            message: "Property removed from comparison",
            comparison: updatedComparison
        });

    } catch (error) {
        console.error("DELETE /comparison/:comparisonId/property/:propertyId error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const deleteComparison = async (req, res) => {
    try {
        const db = req.db;
        const { comparisonId } = req.params;
        const userEmail = req.user.email;

        // Verify ownership
        const comparison = await ComparisonModel.findById(db, comparisonId);
        if (!comparison) {
            return res.status(404).json({ message: "Comparison not found" });
        }

        if (comparison.userEmail !== userEmail) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await ComparisonModel.delete(db, comparisonId);

        return res.status(200).json({
            message: "Comparison deleted"
        });

    } catch (error) {
        console.error("DELETE /comparison/:comparisonId error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const shareComparison = async (req, res) => {
    try {
        const db = req.db;
        const { comparisonId } = req.params;
        const userEmail = req.user.email;

        // Verify ownership
        const comparison = await ComparisonModel.findById(db, comparisonId);
        if (!comparison) {
            return res.status(404).json({ message: "Comparison not found" });
        }

        if (comparison.userEmail !== userEmail) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // Make it public
        await ComparisonModel.update(db, comparisonId, { isPublic: true });

        const updatedComparison = await ComparisonModel.findById(db, comparisonId);

        return res.status(200).json({
            message: "Comparison is now public",
            comparison: updatedComparison,
            shareLink: `/comparison/share/${updatedComparison.shareLink}`
        });

    } catch (error) {
        console.error("POST /comparison/:comparisonId/share error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const makeComparisonPrivate = async (req, res) => {
    try {
        const db = req.db;
        const { comparisonId } = req.params;
        const userEmail = req.user.email;

        // Verify ownership
        const comparison = await ComparisonModel.findById(db, comparisonId);
        if (!comparison) {
            return res.status(404).json({ message: "Comparison not found" });
        }

        if (comparison.userEmail !== userEmail) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // Make it private
        await ComparisonModel.update(db, comparisonId, { isPublic: false });

        const updatedComparison = await ComparisonModel.findById(db, comparisonId);

        return res.status(200).json({
            message: "Comparison is now private",
            comparison: updatedComparison
        });

    } catch (error) {
        console.error("POST /comparison/:comparisonId/private error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
