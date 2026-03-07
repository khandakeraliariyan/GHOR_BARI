import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { verifyAdmin } from "../middleware/verifyAdmin.js";
import * as adminController from "../controllers/adminController.js";


const router = express.Router();


// ========== USER VERIFICATION & MANAGEMENT ==========

/**
 * GET /api/admin/pending-verifications
 * Get all users with pending NID verification submissions
 * @auth Required (verifyToken)
 * Requires admin role
 */
router.get(
    "/admin/pending-verifications", 
    verifyToken, 
    adminController.getPendingVerifications
);


/**
 * PATCH /api/admin/verify-user/:id
 * Update user verification status
 * @auth Required (verifyToken)
 * @param {string} id - User MongoDB ObjectId
 * @body {boolean} verified - Verification status
 */
router.patch(
    "/admin/verify-user/:id", 
    verifyToken, 
    adminController.verifyUser
);


/**
 * PATCH /api/admin/verify-user-nid/:id
 * Verify user NID against external NID registry
 * @auth Required (verifyToken)
 * @param {string} id - User MongoDB ObjectId
 */
router.patch(
    "/admin/verify-user-nid/:id", 
    verifyToken, 
    adminController.verifyUserByNidFromRegistry
);


/**
 * GET /api/admin/all-users
 * Get paginated list of all users in system
 * @auth Required (verifyToken)
 * @query {number} page - Page number for pagination
 * @query {number} limit - Items per page
 */
router.get(
    "/admin/all-users", 
    verifyToken, 
    adminController.getAllUsers
);


/**
 * DELETE /api/admin/delete-user/:id
 * Delete a user from the system
 * @auth Required (verifyToken)
 * @param {string} id - User MongoDB ObjectId
 */
router.delete(
    "/admin/delete-user/:id", 
    verifyToken, 
    adminController.deleteUser
);


// ========== PROPERTY MANAGEMENT & MODERATION ==========

/**
 * GET /api/admin/pending-properties
 * Get all properties awaiting admin approval
 * @auth Required (verifyToken)
 */
router.get(
    "/admin/pending-properties", 
    verifyToken, 
    adminController.getPendingProperties
);


/**
 * PATCH /api/admin/property-status/:id
 * Update property status (approve, reject, block)
 * @auth Required (verifyToken)
 * @param {string} id - Property MongoDB ObjectId
 * @body {string} status - New status (approved/rejected/blocked)
 * @body {string} reason - Reason for status change (if rejected)
 */
router.patch(
    "/admin/property-status/:id", 
    verifyToken, 
    adminController.updatePropertyStatus
);


/**
 * GET /api/admin/property/:id
 * Get property details regardless of approval status
 * Admin-only access to all properties
 * @auth Required (verifyToken, verifyAdmin)
 * @param {string} id - Property MongoDB ObjectId
 */
router.get(
    "/admin/property/:id", 
    verifyToken, 
    verifyAdmin, 
    adminController.getAdminPropertyById
);


/**
 * GET /api/admin/all-properties
 * Get paginated list of all properties
 * @auth Required (verifyToken)
 * @query {number} page - Page number for pagination
 * @query {string} status - Filter by status (pending/approved/rejected)
 */
router.get(
    "/admin/all-properties", 
    verifyToken, 
    adminController.getAllProperties
);


/**
 * DELETE /api/admin/delete-property/:id
 * Permanently delete a property from database
 * @auth Required (verifyToken)
 * @param {string} id - Property MongoDB ObjectId
 */
router.delete(
    "/admin/delete-property/:id", 
    verifyToken, 
    adminController.deleteProperty
);


// ========== ANALYTICS & DASHBOARD ==========

/**
 * GET /api/admin/stats
 * Get key statistics about the platform
 * Includes user count, property count, etc.
 * @auth Required (verifyToken)
 */
router.get(
    "/admin/stats", 
    verifyToken, 
    adminController.getStats
);


/**
 * GET /api/admin/dashboard-insights
 * Get detailed dashboard insights and metrics
 * Includes trends, growth metrics, user activity
 * @auth Required (verifyToken)
 */
router.get(
    "/admin/dashboard-insights", 
    verifyToken, 
    adminController.getDashboardInsights
);


export default router;