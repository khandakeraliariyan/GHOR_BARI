import { getDatabase } from "../config/db.js";
import { EmailJobModel } from "../models/EmailJob.js";
import { sendEmail } from "./emailService.js";
import { renderEmailTemplate } from "./emailTemplateService.js";


// ========== EMAIL JOB PROCESSOR CONFIGURATION ==========

/**
 * Default batch size for email job processing
 * Limits number of emails processed per cron cycle
 * Configurable via EMAIL_JOB_BATCH_SIZE environment variable
 */
const DEFAULT_BATCH_SIZE = Number(process.env.EMAIL_JOB_BATCH_SIZE || 10);

/**
 * Retry delay strategy in minutes
 * Implements exponential backoff for failed email attempts
 * [1 min, 5 min, 15 min, 1 hour, 6 hours]
 */
const RETRY_DELAYS_MINUTES = [1, 5, 15, 60, 360];


// ========== RETRY DELAY CALCULATION ==========

/**
 * Calculate next run time for failed email job
 * Uses exponential backoff strategy based on attempt count
 * 
 * @param {number} attempts - Number of failed attempts so far
 * 
 * @returns {Date} Scheduled time for next retry
 * 
 * @example
 * // After 1st failure: retry in 1 minute
 * const nextRun1 = getNextRunAt(1);
 * 
 * // After 3rd failure: retry in 15 minutes
 * const nextRun3 = getNextRunAt(3);
 * 
 * // After 6th+ failures: retry in 6 hours (max delay)
 * const nextRun6 = getNextRunAt(6);
 */
function getNextRunAt(attempts) {

    // Calculate retry index based on attempts
    const retryIndex = Math.max(0, attempts - 1);

    // Get delay from backoff schedule, using max delay if exhausted
    const delayMinutes = RETRY_DELAYS_MINUTES[
        Math.min(retryIndex, RETRY_DELAYS_MINUTES.length - 1)
    ];

    // Return future date with delay applied
    return new Date(Date.now() + delayMinutes * 60 * 1000);

}


// ========== EMAIL JOB PROCESSING ==========

/**
 * Process all pending email jobs due for sending
 * 
 * Main cron task that:
 * 1. Requeues stale processing jobs (stuck for >10 mins)
 * 2. Claims batch of due pending jobs
 * 3. Renders email templates from payloads
 * 4. Sends emails via SMTP
 * 5. Marks successful jobs as sent
 * 6. Reschedules failed jobs with exponential backoff
 * 
 * @param {Object} options - Processing options
 * @param {number} options.limit - Max jobs to process per cycle (default: 10)
 * 
 * @returns {Promise<Object>} Processing result
 * @returns {number} result.processed - Number of jobs successfully sent
 * 
 * @throws {Error} If database connection fails
 * 
 * @example
 * // Process default batch (10 jobs)
 * const result = await processPendingEmailJobs();
 * console.log(`Sent ${result.processed} emails`);
 * 
 * // Process custom batch size
 * const result = await processPendingEmailJobs({ limit: 50 });
 * 
 * @details
 * Job States:
 * - pending: Initial state, waiting for processing
 * - processing: Claimed by a cron cycle (times out after 10 mins)
 * - sent: Successfully delivered
 * - failed: Exceeded max attempts and won't retry
 */
export async function processPendingEmailJobs({
    limit = DEFAULT_BATCH_SIZE
} = {}) {

    // Get database connection
    const db = getDatabase();


    // ========== HANDLE STALE JOBS ==========

    /**
     * Move stale jobs back to pending
     * If job stuck in "processing" state for >10 minutes, reset it
     * Prevents hung jobs from blocking queue forever
     */
    await EmailJobModel.requeueStaleProcessingJobs(
        db,
        new Date(Date.now() - 10 * 60 * 1000)
    );


    // ========== CLAIM BATCH ==========

    /**
     * Get next batch of jobs ready to send
     * Only jobs with nextRunAt <= now are claimed
     * Status changes to "processing" during send
     */
    const jobs = await EmailJobModel.claimDueJobs(db, limit);


    // ========== PROCESS EACH JOB ==========

    for (const job of jobs) {

        try {

            // ========== RENDER EMAIL TEMPLATE ==========

            /**
             * Convert job payload to email HTML
             * Uses email type and payload to render template
             */
            const { subject, html } = renderEmailTemplate(job.type, job.payload);


            // ========== SEND EMAIL ==========

            /**
             * Send rendered email via SMTP
             * Throws if SMTP fails or recipient invalid
             */
            await sendEmail({
                to: job.to,
                subject,
                html
            });


            // ========== MARK AS SENT ==========

            /**
             * Update job status to "sent" and set sentAt timestamp
             * Successful completion of job lifecycle
             */
            await EmailJobModel.markSent(db, job._id);

        } catch (error) {

            // ========== HANDLE FAILURE ==========

            /**
             * Increment attempt counter
             * Represents number of failed send attempts
             */
            const nextAttempts = (job.attempts || 0) + 1;

            /**
             * Calculate next retry time based on exponential backoff
             */
            const nextRunAt = getNextRunAt(nextAttempts);


            // ========== REQUEUE OR FAIL JOB ==========

            /**
             * Mark job for retry or permanent failure
             * If nextAttempts >= maxAttempts, job marked as "failed"
             * Otherwise scheduled for next retry with updated timestamp
             */
            await EmailJobModel.markForRetry(
                db,
                job._id,
                nextAttempts,
                job.maxAttempts || 5,
                nextRunAt,
                error?.message || "Email send failed"
            );

            // Log error for monitoring
            console.error(`Email job ${job._id} failed:`, error?.message || error);

        }

    }

    // Return count of successfully processed jobs
    return {
        processed: jobs.length
    };

}
