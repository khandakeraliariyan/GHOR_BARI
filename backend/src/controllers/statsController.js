import { getDatabase } from "../config/db.js";


// ========== STATS CONTROLLER ==========

/**
 * Platform Statistics and Analytics
 * 
 * Provides aggregate statistics about platform status
 * Public endpoint - no authentication required
 * Used for homepage showcase and metrics display
 */


// ========== PUBLIC STATISTICS ENDPOINT ==========

/**
 * Get public platform statistics
 * 
 * GET /api/stats
 * 
 * Returns key platform metrics for public homepage display
 * Shows active listings, successful deals, verified users, and total activity
 * No authentication required
 * 
 * @returns {200} Platform statistics object
 * @returns {200.activeListings} Count of active properties available (status: 'active')
 * @returns {200.successfulDeals} Count of completed deals (status: 'sold' OR 'rented')
 * @returns {200.verifiedUsers} Count of NID-verified users
 * @returns {200.totalProperties} Total properties (excluding removed/deleted)
 * 
 * @returns {500} Database error
 * 
 * Statistics Details:
 * 
 * Active Listings:
 * - Only properties with status === 'active'
 * - Publicly visible on marketplace
 * - Excludes: pending, rejected, hidden, removed, sold, rented, deal-in-progress
 * 
 * Successful Deals:
 * - Sum of properties marked 'sold' + 'rented'
 * - Transactions completed on platform
 * - Verified platform success metric
 * 
 * Verified Users:
 * - Users with nidVerified === 'verified'
 * - Passed NID registry verification
 * - Trusted user metric
 * 
 * Total Properties:
 * - All properties excluding 'removed' (soft-deletes)
 * - Historic and current activity
 * - Platform growth metric
 * 
 * @example
 * GET /api/stats
 * 
 * Response:
 * {
 *   "activeListings": 1248,
 *   "successfulDeals": 156,
 *   "verifiedUsers": 892,
 *   "totalProperties": 2341
 * }
 * 
 * Use Case:
 * - Homepage hero section showing platform vitality
 * - Trust signal for new users
 * - Platform growth tracking
 * - Public transparency metrics
 */
export const getPublicStats = async (req, res) => {
    try {
        const db = getDatabase();

        // 1. Active Property Listings (status: "active")
        const activeListings = await db.collection("properties")
            .countDocuments({ status: "active" });

        // 2. Successful Deals (rented + sold)
        const rentedCount = await db.collection("properties")
            .countDocuments({ status: "rented" });
        const soldCount = await db.collection("properties")
            .countDocuments({ status: "sold" });
        const successfulDeals = rentedCount + soldCount;

        // 3. Number of verified users (nidVerified: "verified")
        const verifiedUsers = await db.collection("users")
            .countDocuments({ nidVerified: "verified" });

        // 4. Total Properties (all statuses except removed)
        const totalProperties = await db.collection("properties")
            .countDocuments({ status: { $ne: "removed" } });

        res.send({
            activeListings,
            successfulDeals,
            verifiedUsers,
            totalProperties
        });

    } catch (error) {
        console.error("Error fetching public stats:", error);
        res.status(500).send({ message: "Server error" });
    }
};

