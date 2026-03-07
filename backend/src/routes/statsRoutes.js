import express from "express";
import * as statsController from "../controllers/statsController.js";


const router = express.Router();


// ========== PUBLIC STATISTICS ==========

/**
 * GET /api/public/stats
 * Get public platform statistics
 * No authentication required
 * Returns:
 *   - Total number of users
 *   - Total number of properties
 *   - Total number of completed deals
 *   - Platform metrics and growth
 * @auth Not required (public endpoint)
 */
router.get(
    "/public/stats", 
    statsController.getPublicStats
);


export default router;