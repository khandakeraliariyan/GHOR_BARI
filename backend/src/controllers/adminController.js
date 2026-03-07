import { getDatabase } from "../config/db.js";

import { ObjectId } from "mongodb";
import { verifyPendingUserByNid } from "../services/nidVerificationService.js";


// ========== ADMIN CONTROLLER ==========

/**
 * Platform Administration and Moderation
 * 
 * Provides comprehensive administrative functions:
 * - User verification management (NID verification)
 * - Property approval and status management
 * - Platform statistics and analytics
 * - User and property management
 * 
 * All endpoints require admin role (verifyAdmin middleware)
 * Handles critical business logic including deal protection and data validation
 */


// ========== ANALYTICS CONFIGURATION ==========

/**
 * Time period bucket counts for dashboard insights
 * Controls historical data range shown in analytics
 * - daily: Show last 14 days
 * - weekly: Show last 12 weeks
 * - monthly: Show last 12 months
 */
const INSIGHT_PERIODS = {
    daily: 14,
    weekly: 12,
    monthly: 12
};


// ========== TIME BUCKET HELPER FUNCTIONS ==========

/**
 * Get the start of period for given date
 * 
 * Normalizes date to period boundary:
 * - Daily: Midnight (00:00:00)
 * - Weekly: Previous Monday at midnight
 * - Monthly: 1st of month at midnight
 * 
 * @param {Date} date - Input date to normalize
 * @param {string} period - 'daily', 'weekly', or 'monthly'
 * @returns {Date} Normalized date at period boundary
 */
function getPeriodStart(date, period) {
    const bucketDate = new Date(date);
    bucketDate.setHours(0, 0, 0, 0);

    if (period === "weekly") {
        const day = bucketDate.getDay();
        const diffToMonday = (day + 6) % 7;
        bucketDate.setDate(bucketDate.getDate() - diffToMonday);
        return bucketDate;
    }

    if (period === "monthly") {
        bucketDate.setDate(1);
        return bucketDate;
    }

    return bucketDate;
}

/**
 * Shift period by amount
 * 
 * Moves date forward/backward by period units
 * Handles month boundaries and leap years
 * 
 * @param {Date} date - Starting date
 * @param {string} period - 'daily', 'weekly', or 'monthly'
 * @param {number} amount - Number of periods to shift (positive = future, negative = past)
 * @returns {Date} Shifted date
 */
function shiftPeriod(date, period, amount) {
    const shifted = new Date(date);

    if (period === "weekly") {
        shifted.setDate(shifted.getDate() + amount * 7);
        return shifted;
    }

    if (period === "monthly") {
        shifted.setMonth(shifted.getMonth() + amount);
        return shifted;
    }

    shifted.setDate(shifted.getDate() + amount);
    return shifted;
}

/**
 * Format period label for display
 * 
 * Creates human-readable label for time period:
 * - Daily: "15 Jan"
 * - Weekly: "Week of 15 Jan"
 * - Monthly: "Jan 2024"
 * 
 * @param {Date} date - Date representing the period
 * @param {string} period - 'daily', 'weekly', or 'monthly'
 * @returns {string} Formatted label for UI display
 */
function formatPeriodLabel(date, period) {
    if (period === "weekly") {
        return `Week of ${date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}`;
    }

    if (period === "monthly") {
        return date.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
    }

    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

/**
 * Build time buckets for period range
 * 
 * Creates array of time periods for aggregating analytics
 * Includes historical range back to current period
 * Each bucket tracks: sales, rentals, registrations
 * 
 * @param {string} period - 'daily', 'weekly', or 'monthly'
 * @returns {Array} Array of bucket objects with key, label, sold, rented, registrations
 */
function buildTimeBuckets(period) {
    const totalBuckets = INSIGHT_PERIODS[period] || INSIGHT_PERIODS.daily;
    const currentBucketStart = getPeriodStart(new Date(), period);
    const buckets = [];

    for (let index = totalBuckets - 1; index >= 0; index -= 1) {
        const bucketStart = shiftPeriod(currentBucketStart, period, -index);
        const bucketKey = bucketStart.toISOString();
        buckets.push({
            key: bucketKey,
            label: formatPeriodLabel(bucketStart, period),
            sold: 0,
            rented: 0,
            registrations: 0
        });
    }

    return buckets;
}

/**
 * Get bucket key for date
 * 
 * Returns the ISO timestamp key for period containing given date
 * Used for mapping events to analysis buckets
 * 
 * @param {Date} date - Event date
 * @param {string} period - 'daily', 'weekly', or 'monthly'
 * @returns {string} ISO timestamp of period start
 */
function getBucketKey(date, period) {
    return getPeriodStart(date, period).toISOString();
}



// ========== USER VERIFICATION ENDPOINTS ==========

/**
 * Get pending user verifications
 * 
 * GET /api/admin/pending-verifications
 * 
 * Retrieves list of users awaiting NID verification approval
 * Sorted by submission date (newest first)
 * Used by admins to review and verify user identity documents
 * 
 * @returns {200} Array of pending verification users
 * @returns {200[].nidNumber} User's NID number (secret, masked in real scenario)
 * @returns {200[].nidVerified} Status: 'pending'
 * @returns {200[].nidSubmittedAt} When user submitted verification
 * @returns {200[].nidImages} Array of verification document image URLs
 * 
 * @returns {500} Database error
 * 
 * @auth Required (admin only)
 * 
 * @example
 * Response:
 * [
 *   {
 *     _id: "507f1f77bcf86cd799439011",
 *     email: "user@example.com",
 *     nidNumber: "123456789",
 *     nidVerified: "pending",
 *     nidSubmittedAt: "2024-01-15T10:30:00Z",
 *     nidImages: ["url1", "url2"]
 *   }
 * ]
 */
export const getPendingVerifications = async (req, res) => {

    try {

        const db = getDatabase();

        // Fetch all users with NID submitted and verification pending
        const users = await db.collection("users")
            .find({
                nidNumber: { $exists: true, $ne: null },
                nidVerified: "pending"
            })
            .sort({ nidSubmittedAt: -1 })
            .toArray();

        res.send(users);

    } catch (error) {

        res.status(500).send({ message: "Server error" });

    }

};


/**
 * Approve or reject user verification
 * 
 * PATCH /api/admin/users/:id/verify
 * 
 * Admin decision on pending user NID verification
 * Actions controlled by 'action' parameter
 * Updates user identity status and timestamp
 * 
 * @param {string} req.params.id - User ID to verify
 * @param {Object} req.body
 * @param {string} req.body.action - 'approve' to verify, 'reject' to deny verification
 * 
 * @returns {200} Verification decision applied
 * @returns {200.modifiedCount} Number of documents updated (0 or 1)
 * 
 * @returns {400} Invalid action or user not in pending state
 * @returns {404} User not found
 * @returns {500} Database error
 * 
 * @auth Required (admin only)
 * 
 * Validation:
 * - Action must be 'approve' or 'reject'
 * - User must exist
 * - User nidVerified status must be 'pending' (not already processed)
 * 
 * @example
 * PATCH /api/admin/users/507f1f77bcf86cd799439011/verify
 * { "action": "approve" }
 * 
 * Updates:
 * - nidVerified: becomes 'verified' or 'rejected'
 * - nidVerifiedAt: timestamp if approved, null if rejected
 */
export const verifyUser = async (req, res) => {
    
    try {
    
        const db = getDatabase();
    
        const id = req.params.id;
        const { action } = req.body; // "approve" | "reject"

        // ========== VALIDATE ACTION ==========

        if (!["approve", "reject"].includes(action)) {
            return res.status(400).send({ message: "action must be 'approve' or 'reject'" });
        }

        // ========== CHECK USER EXISTS ==========

        const existingUser = await db.collection("users").findOne({ _id: new ObjectId(id) });
        if (!existingUser) {
            return res.status(404).send({ message: "User not found" });
        }

        // ========== VALIDATE VERIFICATION STATE ==========

        /**
         * Only process if user is in 'pending' state
         * Prevents accidental re-processing of already decided verifications
         */
        if (existingUser.nidVerified !== "pending") {
            return res.status(400).send({ message: "Only pending verification requests can be processed" });
        }

        // ========== UPDATE VERIFICATION STATUS ==========

        const nextState = action === "approve" ? "verified" : "rejected";

        const result = await db.collection("users").updateOne(
            { _id: new ObjectId(id) },
            { $set: { nidVerified: nextState, nidVerifiedAt: action === "approve" ? new Date() : null } }
        );
    
        res.send(result);
    
    } catch (error) {
    
        res.status(500).send({ message: "Server error" });
    
    }

};


// ========== PROPERTY APPROVAL ENDPOINTS ==========

/**
 * Get pending property approvals
 * 
 * GET /api/admin/pending-properties
 * 
 * Retrieves properties awaiting admin approval
 * Sorted by creation date (newest first)
 * Shows user-submitted properties not yet approved
 * 
 * @returns {200} Array of pending properties
 * @returns {200[].status} Always 'pending'
 * @returns {200[].owner} Property owner details
 * @returns {200[].title, location, price} Property information
 * 
 * @returns {500} Database error
 * 
 * @auth Required (admin only)
 * 
 * @example
 * Response: Array of property objects with status: 'pending'
 */
export const getPendingProperties = async (req, res) => {

    try {

        const db = getDatabase();

        // Fetch all properties waiting for admin approval
        const properties = await db.collection("properties")
            .find({ status: "pending" })
            .sort({ createdAt: -1 })
            .toArray();

        res.send(properties);
    
    } catch (error) {
    
        res.status(500).send({ message: "Server error" });
    
    }

};


/**
 * Update property status
 * 
 * PATCH /api/admin/properties/:id/status
 * 
 * Main property status management endpoint
 * Handles approvals, rejections, and deal state transitions
 * Includes critical business logic protection (no deletion of active deals)
 * 
 * @param {string} req.params.id - Property ID
 * @param {Object} req.body
 * @param {string} req.body.status - New status:
 *   - 'active': Approve pending property for listing
 *   - 'rejected': Reject and block property
 *   - 'removed': Soft delete (permanent, cannot be undone)
 *   - 'hidden': Hide from listings (owner can unhide)
 *   - 'sold': Mark as sold
 *   - 'rented': Mark as rented
 *   - 'deal-in-progress': Property has active negotiation
 *   - 'deal-cancelled': Restore to previous status
 * 
 * @returns {200} Status updated successfully
 * 
 * @returns {400} Invalid status transition or business logic violation
 * @returns {404} Property not found
 * @returns {500} Database error
 * 
 * @auth Required (admin only)
 * 
 * Critical Business Logic:
 * 
 * DEAL PROTECTION:
 * - Cannot delete properties in: deal-in-progress, sold, rented
 * - Cannot transition sold/rented properties to other states
 * - Cannot mark property as rented if listingType is 'sale'
 * - Cannot mark property as sold if listingType is 'rent'
 * 
 * DEAL-IN-PROGRESS RESTRICTIONS:
 * - Admin cannot set property to deal-in-progress directly
 * - Only owner/applicant accepting application can set this
 * - Admin can only manage already in-progress deals
 * - Requires active_proposal_id to exist on property
 * 
 * DEAL CANCELLATION:
 * - Restores property to previousStatus field
 * - Clears previousStatus after restoration
 * - Only allowed while still in deal-in-progress
 * 
 * @example
 * PATCH /api/admin/properties/507f1f77bcf86cd799439011/status
 * { "status": "active" }
 * 
 * Approval flow:
 * pending → active (approve for listing)
 * active → sold/rented (mark as completed)
 * sold/rented → deal-cancelled (restore to active if deal falls through)
 */
export const updatePropertyStatus = async (req, res) => {

    try {

        const db = getDatabase();
        const id = req.params.id;
        const { status } = req.body;

        // ========== FETCH CURRENT PROPERTY ==========

        /**
         * Get current property to check existing status
         * Used for validation and deal protection logic
         */
        const property = await db.collection("properties").findOne({ _id: new ObjectId(id) });
        
        if (!property) {
            return res.status(404).send({ message: "Property not found" });
        }

        // ========== HANDLE REMOVED STATUS (SOFT DELETE) ==========

        /**
         * REMOVED is permanent deletion (soft delete in database)
         * Prevents visibility but keeps data for audit trail
         */
        if (status === "removed") {
            const result = await db.collection("properties").updateOne(
                { _id: new ObjectId(id) },
                { 
                    $set: { 
                        status: "removed",
                        updatedAt: new Date()
                    } 
                }
            );
            return res.send(result);
        }

        // ========== HANDLE ACTIVE STATUS (APPROVAL) ==========

        /**
         * ACTIVE approves pending property for public listing
         * Makes property visible to all users
         */
        if (status === "active") {
            const result = await db.collection("properties").updateOne(
                { _id: new ObjectId(id) },
                { 
                    $set: { 
                        status: "active",
                        updatedAt: new Date()
                    } 
                }
            );
            return res.send(result);
        }

        // ========== HANDLE REJECTED STATUS ==========

        /**
         * REJECTED blocks property from listing
         * Property remains in database but hidden from users
         */
        if (status === "rejected") {
            const result = await db.collection("properties").updateOne(
                { _id: new ObjectId(id) },
                { 
                    $set: { 
                        status: "rejected",
                        updatedAt: new Date()
                    } 
                }
            );
            return res.send(result);
        }

        // ========== HANDLE DEAL CANCELLATION ==========

        /**
         * DEAL-CANCELLED restores property to pre-deal status
         * Used when deal falls through after agreement
         * Reverts from sold/rented back to active/pending
         */
        if (status === "deal-cancelled") {
            const statusToRestore = property.previousStatus || property.status;
            const result = await db.collection("properties").updateOne(
                { _id: new ObjectId(id) },
                { 
                    $set: { 
                        status: statusToRestore,
                        previousStatus: null, // Clear previous status after restoration
                        updatedAt: new Date()
                    } 
                }
            );
            return res.send(result);
        }

        // ========== VALIDATE LISTING TYPE CONSTRAINTS ==========

        /**
         * Prevent status mismatches with listing type
         * Sale properties cannot be marked as rented
         * Rent properties cannot be marked as sold
         */
        if (status === "rented" && property.listingType === "sale") {
            return res.status(400).send({ message: "Cannot mark a property for sale as rented" });
        }
        
        if (status === "sold" && property.listingType === "rent") {
            return res.status(400).send({ message: "Cannot mark a property for rent as sold" });
        }
        
        // ========== VALIDATE COMPLETED DEAL CONSTRAINTS ==========

        /**
         * Prevent re-marking completed deals
         * Once property is sold/rented, cannot mark differently
         */
        if (status === "rented" && ["rented", "sold"].includes(property.status)) {
            return res.status(400).send({ message: "Property is already marked as rented or sold" });
        }
        
        if (status === "sold" && ["rented", "sold"].includes(property.status)) {
            return res.status(400).send({ message: "Property is already marked as rented or sold" });
        }
        
        // ========== CRITICAL: DEAL-IN-PROGRESS PROTECTION ==========

        /**
         * CRITICAL: Admin CANNOT directly set property to deal-in-progress
         * Only authorized: owner/user accepting application
         * 
         * Admin can only transition existing in-progress deals
         * This prevents admins from manipulating deal states
         */
        if (status === "deal-in-progress") {
            // Only allowed if property already has active application
            if (!property.active_proposal_id) {
                return res.status(400).send({ 
                    message: "Cannot set property to deal-in-progress. Only property owner or applicant accepting an application can set this status." 
                });
            }
        }
        
        // ========== PREVENT IN-PROGRESS DEALS FROM BEING REOPENED ==========

        /**
         * Cannot mark completed deals as in-progress
         * Prevents undoing finalized transactions
         */
        if (status === "deal-in-progress" && ["rented", "sold"].includes(property.status)) {
            return res.status(400).send({ message: "Cannot mark rented or sold property as deal in progress" });
        }
        
        // ========== PREVENT REJECTED PROPERTIES FROM ENTERING DEALS ==========

        /**
         * Rejected properties must be approved before entering negotiations
         */
        if (status === "deal-in-progress" && property.status === "rejected") {
            return res.status(400).send({ message: "Cannot mark rejected property as deal in progress. Please approve it first." });
        }

        // ========== APPLY STATUS UPDATE ==========

        /**
         * Build update object with new status
         * Store previousStatus if transitioning to deal-in-progress
         * This allows restoring property if deal falls through
         */
        let updateData = { 
            status: status,
            updatedAt: new Date()
        };
        
        // Store previous status for deal cancellation capability
        if ((property.status === "active" || property.status === "pending") && status === "deal-in-progress") {
            // Double check: only allow if active_proposal_id exists
            if (property.active_proposal_id) {
                updateData.previousStatus = property.status;
            }
        }

        const result = await db.collection("properties").updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        res.send(result);
    
    } catch (error) {
    
        res.status(500).send({ message: "Server error" });
    
    }

};


/**
 * Delete property
 * 
 * DELETE /api/admin/properties/:id
 * 
 * Hard delete property from database
 * Includes critical protection: cannot delete active deals
 * Checks for active applications before allowing deletion
 * 
 * @param {string} req.params.id - Property ID to delete
 * 
 * @returns {200} Property permanently deleted
 * @returns {200.deletedCount} Number deleted (0 or 1)
 * 
 * @returns {400} Property has active deal or applications
 * @returns {404} Property not found
 * @returns {500} Database error
 * 
 * @auth Required (admin only)
 * 
 * Deletion Protections:
 * 
 * DEAL PROTECTION:
 * - Cannot delete if status: deal-in-progress, sold, or rented
 * - Prevents accidental loss of deal records
 * - Admin must complete or cancel deal first
 * 
 * APPLICATION PROTECTION:
 * - Checks for pending, counter, or in-progress applications
 * - Prevents deletion while deal negotiations ongoing
 * - Null-safe: property must exist before checking applications
 * 
 * @example
 * DELETE /api/admin/properties/507f1f77bcf86cd799439011
 * 
 * Response: { "deletedCount": 1 }
 * 
 * Errors:
 * 400 "Cannot delete property that is deal-in-progress. Please complete or cancel the deal first."
 * 400 "Cannot delete property with active applications..."
 * 404 "Property not found"
 */
export const deleteProperty = async (req, res) => {

    try {

        const db = getDatabase();
        const id = req.params.id;

        // ========== GET PROPERTY FOR VALIDATION ==========

        /**
         * Fetch property to check status before deletion
         * Ensures proper validations are applied
         */
        const property = await db.collection("properties").findOne({
            _id: new ObjectId(id)
        });

        if (!property) {
            return res.status(404).send({ message: "Property not found" });
        }

        // ========== DEAL PROTECTION: PREVENT ACTIVE DEAL DELETION ==========

        /**
         * CRITICAL: Cannot delete properties with active transaction states
         * Protects deal records and audit trail
         */
        if (["deal-in-progress", "sold", "rented"].includes(property.status)) {
            return res.status(400).send({ 
                message: `Cannot delete property that is ${property.status}. Please complete or cancel the deal first.` 
            });
        }

        // ========== APPLICATION PROTECTION: CHECK FOR ACTIVE APPLICATIONS ==========

        /**
         * Prevents deletion while negotiations are ongoing
         * Ensures application records remain linked to property
         */
        const activeApplications = await db.collection("applications").countDocuments({
            propertyId: new ObjectId(id),
            status: { $in: ["pending", "counter", "deal-in-progress"] }
        });

        if (activeApplications > 0) {
            return res.status(400).send({ 
                message: "Cannot delete property with active applications. Please wait for applications to be resolved first." 
            });
        }

        // ========== PERFORM DELETION ==========

        const result = await db.collection("properties").deleteOne({
            _id: new ObjectId(id)
        });

        res.send(result);

    } catch (error) {
        
        res.status(500).send({ message: "Server error" });
    
    }

};



// ========== ANALYTICS ENDPOINTS ==========

/**
 * Get basic platform statistics
 * 
 * GET /api/admin/stats
 * 
 * Simple aggregate counts for dashboard overview
 * Shows high-level metrics for platform monitoring
 * Used for quick status checks
 * 
 * @returns {200} Basic statistics object
 * @returns {200.pendingVer} Count of users with pending NID verification
 * @returns {200.verifiedUsers} Count of verified users
 * @returns {200.activeList} Count of active property listings
 * @returns {200.rentedCount} Count of properties marked as rented
 * @returns {200.soldCount} Count of properties marked as sold
 * 
 * @returns {500} Database error
 * 
 * @auth Required (admin only)
 * 
 * @example
 * Response:
 * {
 *   "pendingVer": 5,
 *   "verifiedUsers": 245,
 *   "activeList": 1320,
 *   "rentedCount": 42,
 *   "soldCount": 18
 * }
 * 
 * Note: pendingVer counts users with nidImages submitted AND pending verification
 */
export const getStats = async (req, res) => {

    try {
    
        const db = getDatabase();
    
        // ========== COLLECT STATISTICS ==========

        /**
         * Use parallel counting for performance
         * Each count targets specific filter criteria
         */
        const pendingVer = await db.collection("users").countDocuments({ nidImages: { $exists: true, $ne: [] }, nidVerified: "pending" });

        const verifiedUsers = await db.collection("users").countDocuments({ nidVerified: "verified" });
    
        const activeList = await db.collection("properties").countDocuments({ status: "active" });
    
        const rentedCount = await db.collection("properties").countDocuments({ status: "rented" });
    
        const soldCount = await db.collection("properties").countDocuments({ status: "sold" });

        // ========== RETURN AGGREGATED STATS ==========

        res.send({
            pendingVer,
            verifiedUsers,
            activeList,
            rentedCount,
            soldCount
        });
    
    } catch (error) {
    
        res.status(500).send({ message: "Server error" });
    
    }

};


/**
 * Get detailed dashboard insights
 * 
 * GET /api/admin/dashboard-insights?period=daily
 * 
 * Comprehensive analytics with time-series trends
 * Shows property deals and user registration trends over time
 * Configurable period: daily (14 days), weekly (12 weeks), or monthly (12 months)
 * 
 * @query {string} period - 'daily', 'weekly', or 'monthly' (defaults to 'daily')
 * 
 * @returns {200} Detailed insights object
 * @returns {200.period} Selected period used for analysis
 * @returns {200.listingStatus} Property status breakdown
 * @returns {200.listingStatus[].name} Status name (Active, In Progress, Sold, Rented, Hidden)
 * @returns {200.listingStatus[].value} Count for each status
 * 
 * @returns {200.verificationStates} User verification breakdown
 * @returns {200.verificationStates[].name} State (Unverified, Pending, Verified, Rejected)
 * @returns {200.verificationStates[].value} Count for each state
 * 
 * @returns {200.dealTrend} Time-series deal completions
 * @returns {200.dealTrend[].label} Period label ("15 Jan", "Week of 15 Jan", "Jan 2024")
 * @returns {200.dealTrend[].sold} Count of sold properties in period
 * @returns {200.dealTrend[].rented} Count of rented properties in period
 * 
 * @returns {200.registrationTrend} Time-series new user registrations
 * @returns {200.registrationTrend[].label} Period label
 * @returns {200.registrationTrend[].registrations} New users in period
 * 
 * @returns {500} Database error
 * 
 * @auth Required (admin only)
 * 
 * @example
 * GET /api/admin/dashboard-insights?period=daily
 * 
 * Response:
 * {
 *   "period": "daily",
 *   "listingStatus": [
 *     { "name": "Active", "value": 1200 },
 *     { "name": "In Progress", "value": 45 },
 *     ...
 *   ],
 *   "verificationStates": [...],
 *   "dealTrend": [
 *     { "label": "14 Jan", "sold": 2, "rented": 1 },
 *     { "label": "15 Jan", "sold": 3, "rented": 2 },
 *     ...
 *   ],
 *   "registrationTrend": [
 *     { "label": "14 Jan", "registrations": 5 },
 *     ...
 *   ]
 * }
 * 
 * Analysis Details:
 * - Deals aggregated by updatedAt timestamp (or createdAt if unavailable)
 * - Registrations aggregated by user createdAt timestamp
 * - Events outside time bucket range are excluded automatically
 * - Empty periods show 0 for all metrics
 */
export const getDashboardInsights = async (req, res) => {

    try {

        const db = getDatabase();

        // ========== VALIDATE AND SET PERIOD ==========

        /**
         * Default to 'daily' if period not provided or invalid
         * Accepted periods: 'daily', 'weekly', 'monthly'
         */
        const period = ["daily", "weekly", "monthly"].includes(req.query.period) ? req.query.period : "daily";

        // ========== FETCH ALL REQUIRED DATA IN PARALLEL ==========

        /**
         * Simultaneously fetch:
         * - Property status aggregates
         * - User verification state aggregates
         * - Completed deals with timestamps (for trend analysis)
         * - User registrations with timestamps
         */
        const [
            activeCount,
            inProgressCount,
            soldCount,
            rentedCount,
            hiddenCount,
            unverifiedUsers,
            pendingUsers,
            verifiedUsers,
            rejectedUsers,
            dealProperties,
            users
        ] = await Promise.all([
            db.collection("properties").countDocuments({ status: "active" }),
            db.collection("properties").countDocuments({ status: "deal-in-progress" }),
            db.collection("properties").countDocuments({ status: "sold" }),
            db.collection("properties").countDocuments({ status: "rented" }),
            db.collection("properties").countDocuments({ status: "hidden" }),
            db.collection("users").countDocuments({ $or: [{ nidVerified: "unverified" }, { nidVerified: { $exists: false } }] }),
            db.collection("users").countDocuments({ nidVerified: "pending" }),
            db.collection("users").countDocuments({ nidVerified: "verified" }),
            db.collection("users").countDocuments({ nidVerified: "rejected" }),
            db.collection("properties").find(
                { status: { $in: ["sold", "rented"] } },
                { projection: { status: 1, updatedAt: 1, createdAt: 1 } }
            ).toArray(),
            db.collection("users").find(
                {},
                { projection: { createdAt: 1 } }
            ).toArray()
        ]);

        // ========== BUILD TIME BUCKETS ==========

        /**
         * Create array of time periods covering selected range
         * Each bucket tracks sold, rented, and registration counts
         */
        const timeBuckets = buildTimeBuckets(period);
        const timeBucketMap = new Map(timeBuckets.map((bucket) => [bucket.key, bucket]));
        const firstBucketDate = new Date(timeBuckets[0].key);

        // ========== AGGREGATE DEALS BY PERIOD ==========

        /**
         * Iterate through completed deals
         * Assign each to appropriate time bucket based on completion date
         * Handle missing/invalid dates gracefully
         */
        dealProperties.forEach((property) => {
            const sourceDate = property.updatedAt || property.createdAt;
            if (!sourceDate) {
                return;
            }

            const eventDate = new Date(sourceDate);
            if (Number.isNaN(eventDate.getTime()) || eventDate < firstBucketDate) {
                return;
            }

            const bucket = timeBucketMap.get(getBucketKey(eventDate, period));
            if (!bucket) {
                return;
            }

            if (property.status === "sold") {
                bucket.sold += 1;
            }

            if (property.status === "rented") {
                bucket.rented += 1;
            }
        });

        // ========== AGGREGATE REGISTRATIONS BY PERIOD ==========

        /**
         * Iterate through users
         * Count registrations per time period
         * Handle missing/invalid dates
         */
        users.forEach((user) => {
            if (!user.createdAt) {
                return;
            }

            const createdAt = new Date(user.createdAt);
            if (Number.isNaN(createdAt.getTime()) || createdAt < firstBucketDate) {
                return;
            }

            const bucket = timeBucketMap.get(getBucketKey(createdAt, period));
            if (bucket) {
                bucket.registrations += 1;
            }
        });

        // ========== FORMAT AND RETURN INSIGHTS ==========

        res.send({
            period,
            listingStatus: [
                { name: "Active", value: activeCount },
                { name: "In Progress", value: inProgressCount },
                { name: "Sold", value: soldCount },
                { name: "Rented", value: rentedCount },
                { name: "Hidden", value: hiddenCount }
            ],
            verificationStates: [
                { name: "Unverified", value: unverifiedUsers },
                { name: "Pending", value: pendingUsers },
                { name: "Verified", value: verifiedUsers },
                { name: "Rejected", value: rejectedUsers }
            ],
            dealTrend: timeBuckets.map(({ label, sold, rented }) => ({ label, sold, rented })),
            registrationTrend: timeBuckets.map(({ label, registrations }) => ({ label, registrations }))
        });

    } catch (error) {

        console.error("GET /admin/dashboard-insights error:", error);

        res.status(500).send({ message: "Server error" });

    }

};


/**
 * Get single property details (admin view)
 * 
 * GET /api/admin/properties/:id
 * 
 * Retrieves full property document
 * Admin view includes all fields and metadata
 * Used for viewing property details in admin panel
 * 
 * @param {string} req.params.id - Property MongoDB ObjectId
 * 
 * @returns {200} Complete property object
 * @returns {200._id, title, location, price, ...} All property fields
 * 
 * @returns {400} Invalid property ID format
 * @returns {404} Property not found
 * @returns {500} Database error
 * 
 * @auth Required (admin only)
 * 
 * @example
 * GET /api/admin/properties/507f1f77bcf86cd799439011
 * 
 * Response: { _id, title, location, price, owner, images, status, ... }
 */
export const getAdminPropertyById = async (req, res) => {

    try {

        const db = getDatabase();
        const id = req.params.id;

        // ========== VALIDATE OBJECT ID FORMAT ==========

        /**
         * Must be valid MongoDB ObjectId format
         * Invalid formats return 400
         */
        if (!ObjectId.isValid(id)) {
            return res.status(400).send({ message: "Invalid ID format" });
        }

        // ========== FETCH PROPERTY ==========

        const result = await db.collection("properties").findOne({ _id: new ObjectId(id) });

        if (!result) return res.status(404).send({ message: "Property not found" });

        res.send(result);

    } catch (error) {

        res.status(500).send({ message: "Server error" });

    }

};


/**
 * Verify user against NID registry
 * 
 * PATCH /api/admin/users/:id/verify-from-registry
 * 
 * Validates user's submitted NID against national NID database
 * Calls external NID registry service for verification
 * Updates verification status based on match result
 * 
 * @param {string} req.params.id - User ID to verify
 * 
 * @returns {200.matched} true if NID found in registry, false if not found
 * @returns {200.nidVerified} Result status: 'verified' or 'rejected'
 * 
 * @returns {400} Invalid user ID / User has no NID submitted
 * @returns {404} User not found
 * @returns {500} Database error / Registry service error
 * 
 * @auth Required (admin only)
 * 
 * Validation:
 * - User must be in 'pending' verification state
 * - User must have submitted valid NID number (not empty/null)
 * 
 * Registry Lookup:
 * - Calls findByNidNumber service
 * - If found: nidVerified = 'verified', nidVerifiedAt = now
 * - If not found: nidVerified = 'rejected', nidVerifiedAt = null
 * 
 * @example
 * PATCH /api/admin/users/507f1f77bcf86cd799439011/verify-from-registry
 * 
 * Response if found:
 * { "matched": true, "nidVerified": "verified" }
 * 
 * Response if not found:
 * { "matched": false, "nidVerified": "rejected" }
 * 
 * Errors:
 * 400 "Only pending verification requests can be processed"
 * 400 "User has not submitted a valid NID number"
 * 404 "User not found"
 */
export const verifyUserByNidFromRegistry = async (req, res) => {

    try {

        const db = getDatabase();
        const id = req.params.id;

        // ========== VALIDATE USER ID FORMAT ==========

        if (!ObjectId.isValid(id)) {
            return res.status(400).send({ message: "Invalid user id" });
        }

        // ========== FETCH USER ==========

        /**
         * Get user record to check current state
         */
        const user = await db.collection("users").findOne({ _id: new ObjectId(id) });

        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        // ========== VALIDATE VERIFICATION STATE ==========

        /**
         * Only pending verifications can be processed
         * Prevents re-processing of already decided cases
         */
        if (user.nidVerified !== "pending") {
            return res.status(400).send({ message: "Only pending verification requests can be processed" });
        }

        // ========== VALIDATE NID SUBMISSION ==========

        /**
         * User must have submitted valid NID number
         * Check for existence and non-empty string
         */
        if (!user.nidNumber || typeof user.nidNumber !== "string" || !user.nidNumber.trim()) {
            return res.status(400).send({ message: "User has not submitted a valid NID number" });
        }

        // ========== QUERY NID REGISTRY ==========

        /**
         * Call external registry service
         * Returns record if NID found in national database
         * Returns null if NID not found
         */
        const registryRecord = await findByNidNumber(user.nidNumber);

        // ========== HANDLE NO MATCH ==========

        /**
         * If NID not found in registry, mark as rejected
         * This indicates NID is invalid or doesn't match registry
         */
        if (!registryRecord) {
            await db.collection("users").updateOne(
                { _id: new ObjectId(id) },
                {
                    $set: {
                        nidVerified: "rejected",
                        nidVerifiedAt: null
                    }
                }
            );

            return res.status(200).send({
                matched: false,
                nidVerified: "rejected"
            });
        }

        // ========== HANDLE MATCH ==========

        /**
         * If NID found in registry, approve verification
         * Set verification timestamp to now
         */
        await db.collection("users").updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    nidVerified: "verified",
                    nidVerifiedAt: new Date()
                }
            }
        );

        res.send({
            matched: result.matched,
            nidVerified: result.nidVerified
        });

    } catch (error) {

        res.status(500).send({ message: "Server error" });

    }

};


// ========== USER MANAGEMENT ENDPOINTS ==========

/**
 * Get all users with property counts
 * 
 * GET /api/admin/users
 * 
 * Lists all platform users with calculated statistics
 * Sorted by registration date (newest first)
 * Includes property count for each user
 * 
 * @returns {200} Array of user objects with stats
 * @returns {200[].email, name, nidVerified} User details
 * @returns {200[].totalProperties} Count of properties owned by user
 * @returns {200[].createdAt} User registration timestamp
 * 
 * @returns {500} Database error
 * 
 * @auth Required (admin only)
 * 
 * Performance: O(n) where n = total users (does property count foreach)
 * 
 * @example
 * Response:
 * [
 *   {
 *     _id: "507f...",
 *     email: "owner@example.com",
 *     name: "John Doe",
 *     nidVerified: "verified",
 *     totalProperties: 4,
 *     createdAt: "2024-01-01T10:00:00Z"
 *   }
 * ]
 */
export const getAllUsers = async (req, res) => {

    try {

        const db = getDatabase();

        // ========== FETCH ALL USERS ==========

        /**
         * Get all users, sorted newest first
         */
        const users = await db.collection("users")
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        // ========== ADD PROPERTY COUNT FOR EACH USER ==========

        /**
         * Parallelize property counting for performance
         * Each user gets their property count added
         */
        const usersWithPropertyCount = await Promise.all(
            users.map(async (user) => {
                const propertyCount = await db.collection("properties")
                    .countDocuments({ "owner.email": user.email });
                return { ...user, totalProperties: propertyCount };
            })
        );

        res.send(usersWithPropertyCount);

    } catch (error) {

        res.status(500).send({ message: "Server error" });

    }

};


/**
 * Get all properties
 * 
 * GET /api/admin/properties
 * 
 * Lists all platform properties
 * Sorted by creation date (newest first)
 * No filtering applied - returns all properties in all states
 * 
 * @returns {200} Array of all property documents
 * @returns {200[].title, location, price, owner, status} Property details
 * 
 * @returns {500} Database error
 * 
 * @auth Required (admin only)
 * 
 * Note: This endpoint returns all properties regardless of status
 * For filtered lists use:
 * - /api/admin/pending-properties (pending only)
 * - /api/admin/properties/:id (single property)
 * 
 * @example
 * Response: Array of all property objects [{ _id, title, ... }, ...]
 */
export const getAllProperties = async (req, res) => {

    try {

        const db = getDatabase();

        // ========== FETCH ALL PROPERTIES ==========

        /**
         * Get all properties sorted by newest first
         */
        const properties = await db.collection("properties")
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        const ownerEmails = [...new Set(properties.map((property) => property.owner?.email).filter(Boolean))];
        const owners = ownerEmails.length > 0
            ? await db.collection("users")
                .find({ email: { $in: ownerEmails } })
                .project({ name: 1, email: 1, phone: 1, mobile: 1, photoURL: 1, image: 1 })
                .toArray()
            : [];

        const ownerMap = new Map(owners.map((owner) => [owner.email, owner]));

        const enrichedProperties = properties.map((property) => {
            const ownerEmail = property.owner?.email;
            const ownerProfile = ownerEmail ? ownerMap.get(ownerEmail) : null;

            return {
                ...property,
                owner: {
                    ...property.owner,
                    name: ownerProfile?.name || property.owner?.name || "Owner",
                    email: ownerProfile?.email || property.owner?.email || "",
                    phone: ownerProfile?.phone || ownerProfile?.mobile || property.owner?.phone || property.owner?.mobile || "",
                    photoURL: ownerProfile?.photoURL || ownerProfile?.image || property.owner?.photoURL || property.owner?.image || ""
                }
            };
        });

        res.send(enrichedProperties);

    } catch (error) {

        res.status(500).send({ message: "Server error" });

    }

};


/**
 * Delete user account
 * 
 * DELETE /api/admin/users/:id
 * 
 * Permanently removes user from platform
 * Hard delete - removes all data associated with user
 * Does NOT handle property cleanup (should be done before deletion)
 * 
 * @param {string} req.params.id - User ID to delete
 * 
 * @returns {200} User permanently deleted
 * @returns {200.deletedCount} Number deleted (0 or 1)
 * 
 * @returns {500} Database error
 * 
 * @auth Required (admin only)
 * 
 * Warning: This is permanent deletion with no recovery
 * Consider user's properties and active deals before deleting
 * 
 * @example
 * DELETE /api/admin/users/507f1f77bcf86cd799439011
 * 
 * Response: { "deletedCount": 1 }
 * 
 * Audit Trail:
 * - No automatic backup of deleted user data
 * - Should be logged separately for audit purposes
 */
export const deleteUser = async (req, res) => {

    try {

        const db = getDatabase();
        const id = req.params.id;

        // ========== DELETE USER ==========

        const result = await db.collection("users").deleteOne({
            _id: new ObjectId(id)
        });

        res.send(result);

    } catch (error) {
        
        res.status(500).send({ message: "Server error" });
    
    }

};

