import express from "express";
import { processPendingEmailJobs } from "../services/emailProcessorService.js";


const router = express.Router();


// ========== INTERNAL ENDPOINTS (CRON JOBS) ==========

/**
 * POST /api/internal/process-email-jobs
 * Internal endpoint for processing pending email queue
 * Called by external cron job service
 * 
 * Security:
 *   - Requires INTERNAL_CRON_SECRET header
 *   - Not exposed to public
 *   - Called by trusted cron service only
 * 
 * @auth Required (x-internal-cron-secret header)
 * @header {string} x-internal-cron-secret - Secret token for verification
 */
router.post("/internal/process-email-jobs", async (req, res) => {

    // Get expected secret from environment
    const expectedSecret = process.env.INTERNAL_CRON_SECRET;
    
    // Get provided secret from request header
    const providedSecret = req.headers["x-internal-cron-secret"];


    // Validate secret match
    if (!expectedSecret || providedSecret !== expectedSecret) {
        return res.status(403).send({ message: "Forbidden" });
    }


    try {

        // Process all pending email jobs in queue
        const result = await processPendingEmailJobs();
        
        return res.send({
            success: true,
            ...result
        });

    } catch (error) {

        console.error("Email job processing error:", error);
        
        return res.status(500).send({
            message: "Email job processing failed"
        });

    }

});


export default router;
