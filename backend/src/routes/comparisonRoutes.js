import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import * as comparisonController from "../controllers/comparisonController.js";


const router = express.Router();


// ========== COMPARISON CREATION & RETRIEVAL ==========

/**
 * POST /api/create-comparison
 * Create a new property comparison
 * @auth Required (verifyToken)
 * @body {string} title - Comparison title
 * @body {array} propertyIds - Array of property MongoDB ObjectIds
 */
router.post(
    "/create-comparison", 
    verifyToken, 
    comparisonController.createComparison
);


/**
 * GET /api/comparison/:comparisonId
 * Get specific comparison with all property details
 * @auth Required (verifyToken)
 * @param {string} comparisonId - Comparison MongoDB ObjectId
 */
router.get(
    "/comparison/:comparisonId", 
    verifyToken, 
    comparisonController.getComparison
);


/**
 * GET /api/comparison/share/:shareLink
 * Access comparison by public share link
 * No authentication required for shared comparisons
 * @param {string} shareLink - Unique share link identifier
 */
router.get(
    "/comparison/share/:shareLink", 
    comparisonController.getComparisonByShareLink
);


/**
 * GET /api/user-comparisons
 * Get all comparisons created by authenticated user
 * @auth Required (verifyToken)
 */
router.get(
    "/user-comparisons", 
    verifyToken, 
    comparisonController.getUserComparisons
);


// ========== COMPARISON MODIFICATION ==========

/**
 * PUT /api/comparison/:comparisonId
 * Update comparison details (title, description, etc.)
 * @auth Required (verifyToken)
 * @param {string} comparisonId - Comparison MongoDB ObjectId
 * @body {object} Updated comparison fields
 */
router.put(
    "/comparison/:comparisonId", 
    verifyToken, 
    comparisonController.updateComparison
);


/**
 * POST /api/comparison/:comparisonId/add-property
 * Add a property to existing comparison
 * @auth Required (verifyToken)
 * @param {string} comparisonId - Comparison MongoDB ObjectId
 * @body {string} propertyId - Property MongoDB ObjectId to add
 */
router.post(
    "/comparison/:comparisonId/add-property", 
    verifyToken, 
    comparisonController.addPropertyToComparison
);


/**
 * DELETE /api/comparison/:comparisonId/property/:propertyId
 * Remove a property from comparison
 * @auth Required (verifyToken)
 * @param {string} comparisonId - Comparison MongoDB ObjectId
 * @param {string} propertyId - Property MongoDB ObjectId to remove
 */
router.delete(
    "/comparison/:comparisonId/property/:propertyId", 
    verifyToken, 
    comparisonController.removePropertyFromComparison
);


// ========== SHARING & VISIBILITY ==========

/**
 * POST /api/comparison/:comparisonId/share
 * Make comparison public and generate share link
 * @auth Required (verifyToken)
 * @param {string} comparisonId - Comparison MongoDB ObjectId
 */
router.post(
    "/comparison/:comparisonId/share", 
    verifyToken, 
    comparisonController.shareComparison
);


/**
 * POST /api/comparison/:comparisonId/private
 * Make comparison private (disable share link)
 * @auth Required (verifyToken)
 * @param {string} comparisonId - Comparison MongoDB ObjectId
 */
router.post(
    "/comparison/:comparisonId/private", 
    verifyToken, 
    comparisonController.makeComparisonPrivate
);


// ========== DELETION ==========

/**
 * DELETE /api/comparison/:comparisonId
 * Delete comparison permanently
 * @auth Required (verifyToken)
 * @param {string} comparisonId - Comparison MongoDB ObjectId
 */
router.delete(
    "/comparison/:comparisonId", 
    verifyToken, 
    comparisonController.deleteComparison
);


export default router;

export default router;
