import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { verifyOwner } from "../middleware/verifyOwner.js";
import { verifyPropertyOwner } from "../middleware/verifyPropertyOwner.js";
import * as propertyController from "../controllers/propertyController.js";


const router = express.Router();


// ========== PROPERTY CREATION & MANAGEMENT ==========

/**
 * POST /api/post-property
 * Create a new property listing
 * @auth Required (verifyToken)
 * @body {Object} Property details including title, type, price, location, etc.
 */
router.post("/post-property", verifyToken, propertyController.postProperty);


// ========== PROPERTY RETRIEVAL ==========

/**
 * GET /api/my-properties?email=user@example.com
 * Get all properties of authenticated user
 * @auth Required (verifyToken, verifyOwner)
 * @query {string} email - User email for verification
 */
router.get("/my-properties", verifyToken, verifyOwner, propertyController.getMyProperties);


/**
 * GET /api/property/:id
 * Get single property details by property ID
 * @auth Required (verifyToken)
 * @param {string} id - Property MongoDB ObjectId
 */
router.get("/property/:id", verifyToken, propertyController.getPropertyById);


/**
 * GET /api/active-properties
 * Get all approved and active property listings
 * @auth Required (verifyToken)
 */
router.get("/active-properties", verifyToken, propertyController.getActiveProperties);


/**
 * GET /api/featured-properties
 * Get featured properties for homepage display
 * @auth Not required (public endpoint)
 */
router.get("/featured-properties", propertyController.getFeaturedProperties);


// ========== PROPERTY MODIFICATION ==========

/**
 * PUT /api/property/:id
 * Update property details
 * @auth Required (verifyToken, verifyPropertyOwner)
 * @param {string} id - Property MongoDB ObjectId
 * @body {Object} Updated property fields
 */
router.put("/property/:id", verifyToken, verifyPropertyOwner, propertyController.updateProperty);


/**
 * DELETE /api/property/:id
 * Delete property listing completely
 * @auth Required (verifyToken, verifyPropertyOwner)
 * @param {string} id - Property MongoDB ObjectId
 */
router.delete("/property/:id", verifyToken, verifyPropertyOwner, propertyController.deleteProperty);


// ========== PROPERTY STATUS MANAGEMENT ==========

/**
 * PATCH /api/property/:id/visibility
 * Toggle property visibility (hide/show)
 * @auth Required (verifyToken, verifyPropertyOwner)
 * @param {string} id - Property MongoDB ObjectId
 * @body {boolean} visible - Visibility status
 */
router.patch("/property/:id/visibility", verifyToken, verifyPropertyOwner, propertyController.togglePropertyVisibility);


/**
 * PATCH /api/property/:id/reopen
 * Reopen a listed property (for rented properties)
 * @auth Required (verifyToken, verifyPropertyOwner)
 * @param {string} id - Property MongoDB ObjectId
 */
router.patch("/property/:id/reopen", verifyToken, verifyPropertyOwner, propertyController.reopenListing);


export default router;
