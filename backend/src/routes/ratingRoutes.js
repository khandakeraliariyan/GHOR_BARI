import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { 
    submitRating, 
    getCanRateStatus, 
    getReceivedRatings 
} from "../controllers/ratingController.js";


const router = express.Router();


// ========== RATING MANAGEMENT ==========

/**
 * POST /api/ratings
 * Submit a rating for another user
 * Can only rate after completed transaction
 * @auth Required (verifyToken)
 * @body {string} applicationId - Application reference
 * @body {number} rating - Rating value (1-5)
 * @body {string} review - Optional review text
 */
router.post(
    "/ratings", 
    verifyToken, 
    submitRating
);


// ========== RATING ELIGIBILITY ==========

/**
 * GET /api/ratings/can-rate/:applicationId
 * Check if user can rate another user
 * Verifies completion and eligibility
 * @auth Required (verifyToken)
 * @param {string} applicationId - Application MongoDB ObjectId
 */
router.get(
    "/ratings/can-rate/:applicationId", 
    verifyToken, 
    getCanRateStatus
);


// ========== USER RATINGS ==========

/**
 * GET /api/ratings/received/:email
 * Get all ratings received by a user
 * Shows user's rating history and average
 * @auth Required (verifyToken)
 * @param {string} email - User email address
 */
router.get(
    "/ratings/received/:email", 
    verifyToken, 
    getReceivedRatings
);


export default router;
