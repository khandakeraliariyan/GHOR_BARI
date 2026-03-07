import { WishlistModel } from "../models/Wishlist.js";
import { ObjectId } from "mongodb";


// ========== WISHLIST CONTROLLER ==========

/**
 * User Wishlist Management
 * 
 * Allows users to save favorite properties and add personal notes
 * Features:
 * - Save/bookmark properties of interest
 * - Add custom notes for each property
 * - View all saved properties at once
 * - Remove properties from wishlist
 * - Each user has personal independent wishlist
 */


// ========== WISHLIST RETRIEVAL ==========

/**
 * Get user's complete wishlist
 * 
 * GET /api/user/wishlist
 * 
 * Retrieves all properties saved by authenticated user
 * Includes full property details and user's notes
 * Returns empty array if no items in wishlist
 * 
 * @returns {200} Wishlist retrieved
 * @returns {200} Array of wishlist items
 * @returns {200.propertyId} Property MongoDB ObjectId
 * @returns {200.note} User's custom note for property
 * @returns {200.property} Full property object with details
 * @returns {200.savedAt} Timestamp when added to wishlist
 * 
 * @returns {401} Unauthenticated
 * @returns {500} Server error
 * 
 * @auth Required (verifyToken)
 * @param {Object} req.user - Authenticated user
 * @param {string} req.user.email - User email from Firebase
 * 
 * @example
 * Response:
 * [
 *   {
 *     propertyId: "507f1f77bcf86cd799439011",
 *     note: "Good location, nice balcony",
 *     property: { _id, title, price, location, ... },
 *     savedAt: "2024-01-15T10:30:00Z"
 *   }
 * ]
 */
export const getUserWishlist = async (req, res) => {

    try {

        const db = req.db;
        const userEmail = req.user.email;

        // ========== FETCH WISHLIST WITH PROPERTY DETAILS ==========

        /**
         * Get all wishlist items enriched with full property information
         * Joins wishlist entries with properties collection
         */
        const items = await WishlistModel.getFullByUser(db, userEmail);

        return res.status(200).json(items);

    } catch (error) {

        console.error("GET /user-wishlist error:", error);
        res.status(500).json({ message: "Server error" });

    }

};


// ========== WISHLIST MODIFICATION ==========

/**
 * Add property to wishlist
 * 
 * POST /api/wishlist/add
 * 
 * Saves property to user's wishlist with optional personal note
 * Duplicate additions on same property update the note
 * 
 * @param {Object} req.body
 * @param {ObjectId|string} req.body.propertyId - Property to save (required)
 * @param {string} req.body.note - Personal note about property (optional)
 * 
 * @returns {200} Property added to wishlist
 * 
 * @returns {400} Missing propertyId
 * @returns {401} Unauthenticated
 * @returns {404} Property not found in database
 * @returns {500} Server error
 * 
 * @auth Required (verifyToken)
 * @param {Object} req.user - Authenticated user
 * @param {string} req.user.email - User email from Firebase
 * 
 * @example
 * POST /api/wishlist/add
 * {
 *   "propertyId": "507f1f77bcf86cd799439011",
 *   "note": "Check this one - good price, needs negotiation"
 * }
 * 
 * Note behavior:
 * - Note is optional, defaults to empty string
 * - Maximum length typically 500 characters
 * - Can be updated later with updateWishlistNote
 */
export const addToWishlist = async (req, res) => {

    try {

        const db = req.db;
        const userEmail = req.user.email;
        const { propertyId, note } = req.body;

        // ========== VALIDATE PROPERTY ID ==========

        /**
         * Property ID is required to add to wishlist
         */
        if (!propertyId) {
            return res.status(400).json({ message: "Property ID is required" });
        }

        // ========== VERIFY PROPERTY EXISTS ==========

        /**
         * Ensure property exists before adding to wishlist
         * Prevents saving references to non-existent properties
         */
        const property = await db.collection("properties").findOne({
            _id: new ObjectId(propertyId)
        });
        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }

        // ========== ADD TO WISHLIST ==========

        /**
         * Add property to user's wishlist
         * If already exists, updates the note (upsert behavior)
         */
        await WishlistModel.add(db, userEmail, propertyId, note || "");

        return res.status(200).json({ message: "Added to wishlist" });

    } catch (error) {

        console.error("POST /wishlist/add error:", error);
        res.status(500).json({ message: "Server error" });

    }

};


/**
 * Update note on wishlist item
 * 
 * PATCH /api/wishlist/:propertyId
 * 
 * Modifies the personal note attached to a wishlist entry
 * Only updates note, not the property itself
 * 
 * @param {string} req.params.propertyId - Property ID in wishlist
 * @param {Object} req.body
 * @param {string} req.body.note - New note text (required, can be empty string)
 * 
 * @returns {200} Note updated
 * 
 * @returns {400} Missing propertyId / Missing note field
 * @returns {401} Unauthenticated
 * @returns {404} Wishlist entry not found for this user
 * @returns {500} Server error
 * 
 * @auth Required (verifyToken)
 * @param {Object} req.user - Authenticated user
 * @param {string} req.user.email - User email from Firebase
 * 
 * @example
 * PATCH /api/wishlist/507f1f77bcf86cd799439011
 * {
 *   "note": "Updated note - price too high now"
 * }
 * 
 * Note that:
 * - Can clear note by passing empty string
 * - Property must already be in user's wishlist
 * - Returns 404 if property not in this user's wishlist
 */
export const updateWishlistNote = async (req, res) => {

    try {

        const db = req.db;
        const userEmail = req.user.email;
        const { propertyId } = req.params;
        const { note } = req.body;

        // ========== VALIDATE INPUTS ==========

        /**
         * Both propertyId and note are required
         */
        if (!propertyId) {
            return res.status(400).json({ message: "Property ID is required" });
        }
        if (note === undefined) {
            return res.status(400).json({ message: "Note is required" });
        }

        // ========== UPDATE NOTE ==========

        /**
         * Update note for wishlist entry
         * Returns update result with matchedCount
         */
        const result = await WishlistModel.updateNote(db, userEmail, propertyId, note);

        // Check if entry was found and updated
        if (!result || result.matchedCount === 0) {
            return res.status(404).json({ message: "Wishlist entry not found" });
        }

        return res.status(200).json({ message: "Note updated" });

    } catch (error) {

        console.error("PATCH /wishlist/:propertyId error:", error);
        res.status(500).json({ message: "Server error" });

    }

};


/**
 * Remove property from wishlist
 * 
 * DELETE /api/wishlist/:propertyId
 * 
 * Removes property from user's wishlist
 * Deletes wishlist entry completely
 * Note: Deletion silently succeeds even if not in wishlist
 * 
 * @param {string} req.params.propertyId - Property to remove
 * 
 * @returns {200} Removed from wishlist
 * 
 * @returns {400} Missing propertyId
 * @returns {401} Unauthenticated
 * @returns {500} Server error
 * 
 * @auth Required (verifyToken)
 * @param {Object} req.user - Authenticated user
 * @param {string} req.user.email - User email from Firebase
 * 
 * @example
 * DELETE /api/wishlist/507f1f77bcf86cd799439011
 * 
 * Response: { "message": "Removed from wishlist" }
 * 
 * Note:
 * - Returns 200 even if property not in wishlist (idempotent)
 * - Cannot be undone - user must re-add if needed
 * - Removes entry regardless of whether property still exists
 */
export const removeFromWishlist = async (req, res) => {

    try {

        const db = req.db;
        const userEmail = req.user.email;
        const { propertyId } = req.params;

        // ========== VALIDATE PROPERTY ID ==========

        /**
         * Property ID required to identify what to remove
         */
        if (!propertyId) {
            return res.status(400).json({ message: "Property ID is required" });
        }

        // ========== REMOVE FROM WISHLIST ==========

        /**
         * Remove wishlist entry for this user and property
         * Idempotent - succeeds even if not in wishlist
         */
        await WishlistModel.remove(db, userEmail, propertyId);

        return res.status(200).json({ message: "Removed from wishlist" });

    } catch (error) {

        console.error("DELETE /wishlist/:propertyId error:", error);
        res.status(500).json({ message: "Server error" });

    }

};
