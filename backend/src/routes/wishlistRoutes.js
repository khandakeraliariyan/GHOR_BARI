import express from "express";
import { 
    getUserWishlist, 
    addToWishlist, 
    updateWishlistNote, 
    removeFromWishlist 
} from "../controllers/wishlistController.js";
import { verifyToken } from "../middleware/verifyToken.js";


const router = express.Router();


// ========== WISHLIST RETRIEVAL ==========

/**
 * GET /api/user-wishlist
 * Get the authenticated user's wishlist
 * Returns all saved properties with notes
 * @auth Required (verifyToken)
 */
router.get(
    "/user-wishlist", 
    verifyToken, 
    getUserWishlist
);


// ========== WISHLIST MODIFICATION ==========

/**
 * POST /api/wishlist/add
 * Add a property to user's wishlist
 * @auth Required (verifyToken)
 * @body {string} propertyId - MongoDB ObjectId of property
 * @body {string} note - Optional note about the property
 */
router.post(
    "/wishlist/add", 
    verifyToken, 
    addToWishlist
);


/**
 * PATCH /api/wishlist/:propertyId
 * Update personal note/comment for a wishlist item
 * @auth Required (verifyToken)
 * @param {string} propertyId - MongoDB ObjectId of property
 * @body {string} note - Updated note content
 */
router.patch(
    "/wishlist/:propertyId", 
    verifyToken, 
    updateWishlistNote
);


/**
 * DELETE /api/wishlist/:propertyId
 * Remove a property from user's wishlist
 * @auth Required (verifyToken)
 * @param {string} propertyId - MongoDB ObjectId of property
 */
router.delete(
    "/wishlist/:propertyId", 
    verifyToken, 
    removeFromWishlist
);


export default router;
