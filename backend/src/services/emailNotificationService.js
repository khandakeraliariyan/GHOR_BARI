import { enqueueEmailJob } from "./emailJobService.js";


// ========== DEDUPLICATION KEY GENERATION ==========

/**
 * Build a deduplication key for email job
 * Ensures duplicate notifications for same event aren't sent
 * 
 * @param {string} type - Notification type (e.g., 'application_submitted')
 * @param {string|ObjectId} entityId - Application or entity identifier
 * @param {string} recipientEmail - Email address of recipient
 * @param {Date} occurredAt - Timestamp when event occurred
 * 
 * @returns {string} Unique deduplication key for this notification
 * 
 * @example
 * const dedupeKey = buildDedupeKey(
 *   'application_submitted',
 *   app._id,
 *   'owner@example.com',
 *   new Date()
 * );
 */
function buildDedupeKey(type, entityId, recipientEmail, occurredAt) {
    return `${type}:${entityId}:${recipientEmail}:${occurredAt.toISOString()}`;
}


// ========== NOTIFICATION QUEUE HANDLER ==========

/**
 * Queue a notification email for asynchronous delivery
 * Handles error logging and graceful degradation if queueing fails
 * 
 * @param {Object} params - Notification parameters
 * @param {string} params.type - Email type identifier
 * @param {string} params.recipientEmail - Target recipient
 * @param {Object} params.payload - Email content data
 * @param {Date} params.occurredAt - Event timestamp
 * @param {string|ObjectId} params.entityId - Application identifier for deduplication
 * 
 * @returns {Promise<Object>} Queue result indicating success or failure
 * @returns {boolean} result.queued - True if successfully queued
 * @returns {string} result.reason - Failure reason if applicable
 */
async function queueNotification({
    type,
    recipientEmail,
    payload,
    occurredAt,
    entityId
}) {

    try {

        // Enqueue email job with deduplication
        return await enqueueEmailJob({
            type,
            to: recipientEmail,
            payload,
            dedupeKey: buildDedupeKey(type, entityId, recipientEmail, occurredAt)
        });

    } catch (error) {

        // Log queue failure for debugging
        console.error(`Failed to enqueue ${type} email:`, error?.message || error);

        // Return failure response without throwing
        return { queued: false, reason: "enqueue_failed" };

    }

}


// ========== PAYLOAD BUILDER ==========

/**
 * Build standardized email payload base
 * Extracts common fields from application for email templates
 * 
 * @param {Object} application - Application document from database
 * @param {Object} overrides - Optional field overrides to customize payload
 * @param {string} overrides.actorName - Person who triggered the email action
 * @param {number} overrides.proposedPrice - Price amount for negotiation emails
 * @param {string} overrides.message - Custom message to include in email
 * @param {string} overrides.finalStatus - Deal status for completion emails
 * 
 * @returns {Object} Email payload object for template rendering
 * @returns {string} payload.applicationId - MongoDB ObjectId as string
 * @returns {string} payload.propertyTitle - Property name/title
 * @returns {string} payload.actorName - User who initiated action
 * @returns {number|null} payload.proposedPrice - Current negotiated price
 * @returns {string} payload.message - Negotiation message
 * @returns {string} payload.finalStatus - Final deal status
 */
function buildBasePayload(application, overrides = {}) {

    return {
        applicationId: application._id?.toString?.() || String(application._id),
        propertyTitle: application.propertySnapshot?.title || overrides.propertyTitle || "Property",
        actorName: overrides.actorName || "GhorBari User",
        proposedPrice: overrides.proposedPrice ?? application.proposedPrice ?? application.finalPrice ?? null,
        message: overrides.message ?? application.message ?? "",
        finalStatus: overrides.finalStatus || ""
    };

}


// ========== APPLICATION WORKFLOW NOTIFICATIONS ==========

/**
 * Queue email notification when seeker submits application
 * Sent to property owner to notify about new application
 * 
 * @param {Object} application - Application document with seeker/owner info
 * @param {Date} occurredAt - Timestamp when application was submitted
 * 
 * @returns {Promise<Object>} Queue result
 */
export async function queueApplicationSubmittedEmail(application, occurredAt) {

    return queueNotification({
        type: "application_submitted",
        recipientEmail: application.owner?.email,
        occurredAt,
        entityId: application._id,
        payload: buildBasePayload(application, {
            actorName: application.seeker?.name
        })
    });

}


/**
 * Queue email notification for counter offer from owner
 * Sent to seeker when owner responds with different price
 * 
 * @param {Object} application - Application document
 * @param {Date} occurredAt - Timestamp of counter offer
 * @param {Object} counterOffer - Counter offer details
 * @param {number} counterOffer.proposedPrice - Counter proposed price
 * @param {string} counterOffer.message - Owner's message with counter offer
 * 
 * @returns {Promise<Object>} Queue result
 */
export async function queueCounterOfferEmail(application, occurredAt, {
    proposedPrice,
    message
}) {

    return queueNotification({
        type: "counter_offer",
        recipientEmail: application.seeker?.email,
        occurredAt,
        entityId: application._id,
        payload: buildBasePayload(application, {
            actorName: application.owner?.name,
            proposedPrice,
            message
        })
    });

}


/**
 * Queue email notification when owner rejects application
 * Sent to seeker to inform about rejection
 * 
 * @param {Object} application - Application document
 * @param {Date} occurredAt - Timestamp when rejected
 * 
 * @returns {Promise<Object>} Queue result
 */
export async function queueApplicationRejectedEmail(application, occurredAt) {

    return queueNotification({
        type: "application_rejected",
        recipientEmail: application.seeker?.email,
        occurredAt,
        entityId: application._id,
        payload: buildBasePayload(application, {
            actorName: application.owner?.name
        })
    });

}


/**
 * Queue email notification when deal moves to in-progress status
 * Sent to seeker after owner accepts offer
 * 
 * @param {Object} application - Application document
 * @param {Date} occurredAt - Timestamp of status change
 * 
 * @returns {Promise<Object>} Queue result
 */
export async function queueDealInProgressEmail(application, occurredAt) {

    return queueNotification({
        type: "deal_in_progress",
        recipientEmail: application.seeker?.email,
        occurredAt,
        entityId: application._id,
        payload: buildBasePayload(application, {
            actorName: application.owner?.name
        })
    });

}


/**
 * Queue email notification when seeker revises offer
 * Sent to owner with new seeker offer and message
 * 
 * @param {Object} application - Application document
 * @param {Date} occurredAt - Timestamp of revision
 * @param {Object} revision - Revision details
 * @param {number} revision.proposedPrice - Revised price from seeker
 * @param {string} revision.message - Seeker's message with revised offer
 * 
 * @returns {Promise<Object>} Queue result
 */
export async function queueOfferRevisedEmail(application, occurredAt, {
    proposedPrice,
    message
}) {

    return queueNotification({
        type: "offer_revised",
        recipientEmail: application.owner?.email,
        occurredAt,
        entityId: application._id,
        payload: buildBasePayload(application, {
            actorName: application.seeker?.name,
            proposedPrice,
            message
        })
    });

}


/**
 * Queue email notification when seeker accepts owner's counter offer
 * Sent to owner confirming deal acceptance
 * 
 * @param {Object} application - Application document
 * @param {Date} occurredAt - Timestamp of acceptance
 * 
 * @returns {Promise<Object>} Queue result
 */
export async function queueCounterAcceptedEmail(application, occurredAt) {

    return queueNotification({
        type: "counter_accepted",
        recipientEmail: application.owner?.email,
        occurredAt,
        entityId: application._id,
        payload: buildBasePayload(application, {
            actorName: application.seeker?.name
        })
    });

}


/**
 * Queue email notification when seeker withdraws application
 * Sent to owner to notify application is withdrawn
 * 
 * @param {Object} application - Application document
 * @param {Date} occurredAt - Timestamp of withdrawal
 * 
 * @returns {Promise<Object>} Queue result
 */
export async function queueApplicationWithdrawnEmail(application, occurredAt) {

    return queueNotification({
        type: "application_withdrawn",
        recipientEmail: application.owner?.email,
        occurredAt,
        entityId: application._id,
        payload: buildBasePayload(application, {
            actorName: application.seeker?.name
        })
    });

}


/**
 * Queue email notifications when deal is completed
 * Sends completion emails to both owner and seeker
 * 
 * @param {Object} application - Application document
 * @param {Date} occurredAt - Timestamp of deal completion
 * @param {string} finalStatus - Status of completed deal
 * 
 * @returns {Promise<void>} Queues both emails (doesn't wait for completion)
 */
export async function queueDealCompletedEmails(application, occurredAt, finalStatus) {

    // Build payload with final price and status
    const payload = buildBasePayload(application, {
        proposedPrice: application.finalPrice ?? application.proposedPrice,
        finalStatus
    });

    // Queue email to owner
    await queueNotification({
        type: "deal_completed",
        recipientEmail: application.owner?.email,
        occurredAt,
        entityId: application._id,
        payload
    });

    // Queue email to seeker
    await queueNotification({
        type: "deal_completed",
        recipientEmail: application.seeker?.email,
        occurredAt,
        entityId: application._id,
        payload
    });

}


/**
 * Queue email notifications when deal is cancelled
 * Sends cancellation emails to both owner and seeker
 * 
 * @param {Object} application - Application document
 * @param {Date} occurredAt - Timestamp of cancellation
 * 
 * @returns {Promise<void>} Queues both emails (doesn't wait for completion)
 */
export async function queueDealCancelledEmails(application, occurredAt) {

    // Build payload with final price
    const payload = buildBasePayload(application, {
        proposedPrice: application.finalPrice ?? application.proposedPrice
    });

    // Queue email to owner
    await queueNotification({
        type: "deal_cancelled",
        recipientEmail: application.owner?.email,
        occurredAt,
        entityId: application._id,
        payload
    });

    // Queue email to seeker
    await queueNotification({
        type: "deal_cancelled",
        recipientEmail: application.seeker?.email,
        occurredAt,
        entityId: application._id,
        payload
    });

}
