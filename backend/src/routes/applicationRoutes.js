import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import * as applicationController from "../controllers/applicationController.js";


const router = express.Router();


// ========== APPLICATION CREATION ==========

/**
 * POST /api/application
 * Property seeker creates application to rent/buy property
 * @auth Required (verifyToken)
 * @body {string} propertyId - Target property MongoDB ObjectId
 * @body {number} offerAmount - Proposed offer amount
 * @body {string} message - Optional message to property owner
 */
router.post(
    "/application", 
    verifyToken, 
    applicationController.createApplication
);


// ========== APPLICATION RETRIEVAL ==========

/**
 * GET /api/my-applications
 * Get all applications sent by authenticated user (seeker view)
 * Shows applications and their current status
 * @auth Required (verifyToken)
 */
router.get(
    "/my-applications", 
    verifyToken, 
    applicationController.getMyApplications
);


/**
 * GET /api/property/:propertyId/applications
 * Get all applications received for a property (owner view)
 * Returns applications from seekers for the property
 * @auth Required (verifyToken)
 * @param {string} propertyId - Property MongoDB ObjectId
 */
router.get(
    "/property/:propertyId/applications", 
    verifyToken, 
    applicationController.getPropertyApplications
);


// ========== APPLICATION STATUS MANAGEMENT ==========

/**
 * PATCH /api/application/:id
 * Update application status (owner actions: accept/reject/counter)
 * @auth Required (verifyToken)
 * @param {string} id - Application MongoDB ObjectId
 * @body {string} status - New status (accepted/rejected/counter)
 * @body {number} counterAmount - Counter offer amount (if status is counter)
 */
router.patch(
    "/application/:id", 
    verifyToken, 
    applicationController.updateApplicationStatus
);


/**
 * PATCH /api/application/:id/withdraw
 * Seeker withdraws their application
 * @auth Required (verifyToken)
 * @param {string} id - Application MongoDB ObjectId
 */
router.patch(
    "/application/:id/withdraw", 
    verifyToken, 
    applicationController.withdrawApplication
);


/**
 * PATCH /api/application/:id/revise
 * Seeker revises offer in response to owner's counter
 * @auth Required (verifyToken)
 * @param {string} id - Application MongoDB ObjectId
 * @body {number} offerAmount - Revised offer amount
 */
router.patch(
    "/application/:id/revise", 
    verifyToken, 
    applicationController.reviseApplication
);


/**
 * PATCH /api/application/:id/accept-counter
 * Seeker accepts owner's counter offer
 * Moves application to accepted status
 * @auth Required (verifyToken)
 * @param {string} id - Application MongoDB ObjectId
 */
router.patch(
    "/application/:id/accept-counter", 
    verifyToken, 
    applicationController.acceptCounterOffer
);


// ========== NEGOTIATION & COMMUNICATION ==========

/**
 * POST /api/application/:id/message
 * Send message within application negotiation
 * Used for owner-seeker communication
 * @auth Required (verifyToken)
 * @param {string} id - Application MongoDB ObjectId
 * @body {string} message - Message content
 */
router.post(
    "/application/:id/message", 
    verifyToken, 
    applicationController.sendApplicationMessage
);


// ========== DEAL FINALIZATION ==========

/**
 * PATCH /api/property/:propertyId/deal
 * Complete or cancel deal on property
 * Admin and owner actions to finalize transaction
 * @auth Required (verifyToken)
 * @param {string} propertyId - Property MongoDB ObjectId
 * @body {string} dealStatus - Deal status (completed/cancelled)
 */
router.patch(
    "/property/:propertyId/deal", 
    verifyToken, 
    applicationController.updateDealStatus
);


export default router;
