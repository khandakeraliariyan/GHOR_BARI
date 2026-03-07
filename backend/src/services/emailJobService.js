import { getDatabase } from "../config/db.js";
import { EmailJobModel } from "../models/EmailJob.js";


// ========== EMAIL QUEUE MANAGEMENT ==========

/**
 * Enqueue an email job for asynchronous processing
 * 
 * Creates a new email job document in the database with pending status.
 * Supports deduplication via dedupeKey to prevent duplicate emails.
 * Implements exponential backoff retry strategy with configurable max attempts.
 * 
 * @param {Object} params - Email job configuration
 * @param {string} params.type - Email type (e.g., 'verification', 'notification')
 * @param {string} params.to - Recipient email address (required)
 * @param {Object} params.payload - Email data (subject, body, variables, etc.)
 * @param {string} params.dedupeKey - Optional deduplication key for duplicate prevention
 * @param {number} params.maxAttempts - Max retry attempts (default 5)
 * 
 * @returns {Promise<Object>} Job enqueue result
 * @returns {boolean} result.queued - True if job was successfully queued
 * @returns {string} result.reason - Failure reason if queued is false
 *                                   ('missing_recipient', 'duplicate')
 * 
 * @throws {Error} If database operation fails (excluding duplicate key conflict)
 * 
 * @example
 * const result = await enqueueEmailJob({
 *   type: 'account-verification',
 *   to: 'user@example.com',
 *   payload: { verificationCode: 'ABC123' },
 *   dedupeKey: 'user-123-verification',
 *   maxAttempts: 3
 * });
 */
export async function enqueueEmailJob({
    type,
    to,
    payload,
    dedupeKey,
    maxAttempts = 5
}) {

    // Validate recipient email is provided
    if (!to) {
        return { queued: false, reason: "missing_recipient" };
    }

    // Get database connection
    const db = getDatabase();

    // Get current timestamp for job creation
    const now = new Date();

    try {

        // Create new email job document with pending status
        await EmailJobModel.create(db, {
            type,
            to,
            payload,
            status: "pending",
            attempts: 0,
            maxAttempts,
            nextRunAt: now,
            dedupeKey,
            createdAt: now,
            updatedAt: now,
            sentAt: null,
            lastError: null
        });

        // Return success response
        return { queued: true };

    } catch (error) {

        // Handle duplicate key violation (dedupeKey already exists)
        if (error?.code === 11000) {
            return { queued: false, reason: "duplicate" };
        }

        // Re-throw other database errors
        throw error;

    }

}
