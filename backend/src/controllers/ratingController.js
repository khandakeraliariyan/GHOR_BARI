import { ObjectId } from "mongodb";
import { RatingModel } from "../models/Rating.js";


// ========== RATING CONTROLLER ==========

/**
 * User Rating System
 * 
 * Allows property transaction participants to rate each other
 * Features:
 * - Rate counterparty after deal completion or cancellation
 * - 1-5 star scale with optional text review
 * - Aggregated ratings stored on user profile
 * - Prevents self-rating and duplicate ratings
 * - Access control: only deal participants can rate
 * 
 * Rating Context:
 * - owner_to_seeker: Property owner rates tenant/buyer
 * - seeker_to_owner: Tenant/buyer rates property owner
 */


// ========== RATING CONFIGURATION ==========

/**
 * Application statuses that allow rating
 * Prevents rating during active negotiations
 */
const ALLOWED_APPLICATION_STATUSES = ["completed", "cancelled"];


// ========== HELPER FUNCTIONS ==========

/**
 * Determine rating direction based on application participants
 * 
 * @param {Object} application - Application document
 * @param {string} raterEmail - Email of person submitting rating
 * 
 * @returns {string|null} Role context ('owner_to_seeker', 'seeker_to_owner', or null)
 */
const getRoleContext = (application, raterEmail) => {

    // Check if rater is the owner
    if (application?.owner?.email === raterEmail) return "owner_to_seeker";

    // Check if rater is the seeker
    if (application?.seeker?.email === raterEmail) return "seeker_to_owner";

    return null;

};


/**
 * Get email of person being rated
 * 
 * @param {Object} application - Application document
 * @param {string} raterEmail - Email of person submitting rating
 * 
 * @returns {string|null} Email of counterparty or null
 */
const getRateeEmail = (application, raterEmail) => {

    // If rater is owner, ratee is seeker
    if (application?.owner?.email === raterEmail) return application?.seeker?.email || null;

    // If rater is seeker, ratee is owner
    if (application?.seeker?.email === raterEmail) return application?.owner?.email || null;

    return null;

};


/**
 * Update user's aggregated rating statistics
 * 
 * Recalculates average rating and rating summary from all received ratings
 * Updates user document with new aggregated data
 * 
 * @param {Object} db - MongoDB database connection
 * @param {string} rateeEmail - User email whose aggregate to update
 * 
 * @returns {Promise<Object>} Updated rating aggregate object
 */
const updateUserRatingAggregate = async (db, rateeEmail) => {

    // Recalculate aggregate from all ratings received by this user
    const aggregate = await RatingModel.getAggregateForRatee(db, rateeEmail);

    // Update user document with new rating stats
    await db.collection("users").updateOne(
        { email: rateeEmail },
        {
            $set: {
                rating: aggregate,
                updatedAt: new Date()
            }
        }
    );

    return aggregate;

};


// ========== RATING SUBMISSION ==========

/**
 * Submit rating for counterparty
 * 
 * POST /api/ratings
 * 
 * Records rating and review after deal completes or is cancelled
 * Updates both rating document and user's aggregate statistics
 * Supports rating updates (upsert by application + rater)
 * 
 * @param {Object} req.body
 * @param {ObjectId|string} req.body.applicationId - Application ID (required)
 * @param {number} req.body.score - Rating 1-5 stars (required)
 * @param {string} req.body.review - Optional text review
 * 
 * @returns {200} Rating submitted successfully
 * @returns {200.success} true
 * @returns {200.rating} Rating document created/updated
 * @returns {200.userRating} Updated rating aggregate for ratee
 * 
 * @returns {400} Invalid score / Invalid application status / Self-rating / Duplicate rating attempt
 * @returns {401} Unauthenticated
 * @returns {403} User not participant in this application
 * @returns {404} Application not found
 * @returns {500} Server error
 * 
 * @auth Required (verifyToken)
 * 
 * @example
 * POST /api/ratings
 * {
 *   "applicationId": "507f1f77bcf86cd799439011",
 *   "score": 5,
 *   "review": "Great experience, would recommend!"
 * }
 * 
 * Rating Requirements:
 * - Application must be completed or cancelled
 * - Rater must be owner or seeker participant
 * - Can only rate once per application
 * - Score must be 1-5
 */
export const submitRating = async (req, res) => {

    try {

        const db = req.db;
        const raterEmail = req.user.email;
        const { applicationId, score, review = "" } = req.body;

        // ========== VALIDATE APPLICATION ID ==========

        /**
         * Ensure valid MongoDB ObjectId format
         */
        if (!applicationId || !ObjectId.isValid(applicationId)) {
            return res.status(400).json({ message: "Valid applicationId is required" });
        }

        // ========== VALIDATE RATING SCORE ==========

        /**
         * Score must be integer 1-5
         */
        const numericScore = Number(score);
        if (!Number.isFinite(numericScore) || numericScore < 1 || numericScore > 5) {
            return res.status(400).json({ message: "score must be between 1 and 5" });
        }

        // ========== FETCH APPLICATION ==========

        /**
         * Verify application exists
         */
        const application = await db.collection("applications").findOne({
            _id: new ObjectId(applicationId)
        });
        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        // ========== VERIFY PARTICIPANT STATUS ==========

        /**
         * Only owner and seeker can rate
         * Prevents third parties from rating
         */
        const isParticipant = [application?.owner?.email, application?.seeker?.email].includes(raterEmail);
        if (!isParticipant) {
            return res.status(403).json({ message: "You are not part of this deal" });
        }

        // ========== VERIFY APPLICATION STATUS ==========

        /**
         * Only allow rating on completed or cancelled applications
         * Prevents rating during active negotiations
         */
        if (!ALLOWED_APPLICATION_STATUSES.includes(application.status)) {
            return res.status(400).json({
                message: `Rating is only allowed when application status is one of: ${ALLOWED_APPLICATION_STATUSES.join(", ")}`
            });
        }

        // ========== DETERMINE RATING DIRECTION ==========

        /**
         * Get counterparty email and verify valid rating direction
         */
        const rateeEmail = getRateeEmail(application, raterEmail);
        const roleContext = getRoleContext(application, raterEmail);

        if (!rateeEmail || !roleContext) {
            return res.status(400).json({ message: "Unable to resolve rating direction" });
        }

        // ========== PREVENT SELF-RATING ==========

        /**
         * User cannot rate themselves
         */
        if (rateeEmail === raterEmail) {
            return res.status(400).json({ message: "You cannot rate yourself" });
        }

        // ========== CREATE/UPDATE RATING ==========

        /**
         * Upsert rating by application + rater
         * Allows updating existing rating
         */
        const rating = await RatingModel.upsert(db, {
            applicationId,
            propertyId: application.propertyId,
            raterEmail,
            rateeEmail,
            score: numericScore,
            review: String(review || "").trim(),
            roleContext
        });

        // ========== UPDATE USER AGGREGATE ==========

        /**
         * Recalculate all-time average rating
         * Update user profile with new stats
         */
        const userRating = await updateUserRatingAggregate(db, rateeEmail);

        return res.status(200).json({
            success: true,
            message: "Rating submitted successfully",
            rating,
            userRating
        });

    } catch (error) {

        console.error("POST /ratings error:", error);
        return res.status(500).json({ message: "Server error" });

    }

};


// ========== RATING ELIGIBILITY ==========

/**
 * Check if user can rate counterparty
 * 
 * GET /api/ratings/can-rate/:applicationId
 * 
 * Provides eligibility information before submitting rating
 * Indicates whether user can rate and shows existing rating if any
 * 
 * @param {string} req.params.applicationId - Application ID to check
 * 
 * @returns {200} Rating eligibility status
 * @returns {200.success} true
 * @returns {200.canRate} Whether user can submit new rating
 * @returns {200.alreadyRated} Whether user has already rated
 * @returns {200.counterpartyEmail} Email of person to be rated
 * @returns {200.applicationStatus} Current application status
 * @returns {200.existingRating} Existing rating if already submitted (or null)
 * 
 * @returns {400} Invalid or missing applicationId
 * @returns {401} Unauthenticated
 * @returns {403} User not participant in this application
 * @returns {404} Application not found
 * @returns {500} Server error
 * 
 * @auth Required (verifyToken)
 * 
 * Rating Eligibility Conditions:
 * - User must be participant (owner or seeker)
 * - Application must be completed or cancelled
 * - User cannot have already submitted rating
 */
export const getCanRateStatus = async (req, res) => {

    try {

        const db = req.db;
        const raterEmail = req.user.email;
        const { applicationId } = req.params;

        // ========== VALIDATE APPLICATION ID ==========

        /**
         * Ensure valid MongoDB ObjectId format
         */
        if (!applicationId || !ObjectId.isValid(applicationId)) {
            return res.status(400).json({ message: "Valid applicationId is required" });
        }

        // ========== FETCH APPLICATION ==========

        /**
         * Get application details for eligibility check
         */
        const application = await db.collection("applications").findOne({
            _id: new ObjectId(applicationId)
        });
        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        // ========== VERIFY PARTICIPANT STATUS ==========

        /**
         * Only participants can check rating eligibility
         */
        const isParticipant = [application?.owner?.email, application?.seeker?.email].includes(raterEmail);
        if (!isParticipant) {
            return res.status(403).json({ message: "You are not part of this deal" });
        }

        // ========== CHECK ELIGIBILITY ==========

        /**
         * Status must be completed or cancelled to rate
         */
        const statusAllowed = ALLOWED_APPLICATION_STATUSES.includes(application.status);

        /**
         * Get counterparty email
         */
        const counterpartyEmail = getRateeEmail(application, raterEmail);

        /**
         * Check if user has already submitted rating
         */
        const existingRating = await RatingModel.findByApplicationAndRater(db, applicationId, raterEmail);

        return res.status(200).json({
            success: true,
            canRate: statusAllowed,
            alreadyRated: Boolean(existingRating),
            counterpartyEmail,
            applicationStatus: application.status,
            existingRating: existingRating || null
        });

    } catch (error) {

        console.error("GET /ratings/can-rate/:applicationId error:", error);
        return res.status(500).json({ message: "Server error" });

    }

};


// ========== RATING RETRIEVAL ==========

/**
 * Get all ratings received by user
 * 
 * GET /api/ratings/received/:email
 * 
 * Retrieves paginated list of ratings submitted to user
 * Returns rating statistics and individual rating details
 * Public endpoint - no auth required but email must exist
 * 
 * @param {string} req.params.email - User email to get ratings for
 * @param {number} req.query.skip - Pagination offset (default 0)
 * @param {number} req.query.limit - Results per page 1-50 (default 10)
 * 
 * @returns {200} Ratings retrieved
 * @returns {200.success} true
 * @returns {200.total} Total number of ratings received
 * @returns {200.skip} Pagination offset used
 * @returns {200.limit} Page size used
 * @returns {200.ratings} Array of rating documents
 * 
 * @returns {400} Missing email parameter
 * @returns {500} Server error
 * 
 * @auth Not required - public endpoint
 * 
 * Each rating includes:
 * - raterEmail: Who submitted the rating
 * - score: 1-5 star rating
 * - review: Optional text review
 * - roleContext: Whether owner or seeker
 * - createdAt: Submission timestamp
 * 
 * Example: GET /api/ratings/received/user@example.com?skip=0&limit=10
 */
export const getReceivedRatings = async (req, res) => {

    try {

        const db = req.db;
        const { email } = req.params;

        // ========== PARSE PAGINATION ==========

        /**
         * Extract and validate pagination parameters
         * skip: pagination offset, limit: results per page
         */
        const skip = Math.max(0, Number(req.query.skip || 0));
        const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));

        // ========== VALIDATE EMAIL ==========

        /**
         * Email parameter is required to identify whose ratings to fetch
         */
        if (!email) {
            return res.status(400).json({ message: "email is required" });
        }

        // ========== FETCH RATINGS IN PARALLEL ==========

        /**
         * Get paginated ratings and total count simultaneously
         */
        const [ratings, total] = await Promise.all([
            RatingModel.findReceived(db, email, skip, limit),
            RatingModel.countReceived(db, email)
        ]);

        return res.status(200).json({
            success: true,
            total,
            skip,
            limit,
            ratings
        });

    } catch (error) {

        console.error("GET /ratings/received/:email error:", error);
        return res.status(500).json({ message: "Server error" });

    }

};
    try {
        const db = req.db;
        const raterEmail = req.user.email;
        const { applicationId, score, review = "" } = req.body;

        if (!applicationId || !ObjectId.isValid(applicationId)) {
            return res.status(400).json({ message: "Valid applicationId is required" });
        }

        const numericScore = Number(score);
        if (!Number.isFinite(numericScore) || numericScore < 1 || numericScore > 5) {
            return res.status(400).json({ message: "score must be between 1 and 5" });
        }

        const application = await db.collection("applications").findOne({ _id: new ObjectId(applicationId) });
        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        const isParticipant = [application?.owner?.email, application?.seeker?.email].includes(raterEmail);
        if (!isParticipant) {
            return res.status(403).json({ message: "You are not part of this deal" });
        }

        if (!ALLOWED_APPLICATION_STATUSES.includes(application.status)) {
            return res.status(400).json({
                message: `Rating is only allowed when application status is one of: ${ALLOWED_APPLICATION_STATUSES.join(", ")}`
            });
        }

        const rateeEmail = getRateeEmail(application, raterEmail);
        const roleContext = getRoleContext(application, raterEmail);

        if (!rateeEmail || !roleContext) {
            return res.status(400).json({ message: "Unable to resolve rating direction" });
        }

        if (rateeEmail === raterEmail) {
            return res.status(400).json({ message: "You cannot rate yourself" });
        }

        const rating = await RatingModel.upsert(db, {
            applicationId,
            propertyId: application.propertyId,
            raterEmail,
            rateeEmail,
            score: numericScore,
            review: String(review || "").trim(),
            roleContext
        });

        const userRating = await updateUserRatingAggregate(db, rateeEmail);

        return res.status(200).json({
            success: true,
            message: "Rating submitted successfully",
            rating,
            userRating
        });
    } catch (error) {
        console.error("POST /ratings error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const getCanRateStatus = async (req, res) => {
    try {
        const db = req.db;
        const raterEmail = req.user.email;
        const { applicationId } = req.params;

        if (!applicationId || !ObjectId.isValid(applicationId)) {
            return res.status(400).json({ message: "Valid applicationId is required" });
        }

        const application = await db.collection("applications").findOne({ _id: new ObjectId(applicationId) });
        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        const isParticipant = [application?.owner?.email, application?.seeker?.email].includes(raterEmail);
        if (!isParticipant) {
            return res.status(403).json({ message: "You are not part of this deal" });
        }

        const statusAllowed = ALLOWED_APPLICATION_STATUSES.includes(application.status);
        const counterpartyEmail = getRateeEmail(application, raterEmail);
        const existingRating = await RatingModel.findByApplicationAndRater(db, applicationId, raterEmail);

        return res.status(200).json({
            success: true,
            canRate: statusAllowed,
            alreadyRated: Boolean(existingRating),
            counterpartyEmail,
            applicationStatus: application.status,
            existingRating: existingRating || null
        });
    } catch (error) {
        console.error("GET /ratings/can-rate/:applicationId error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const getReceivedRatings = async (req, res) => {
    try {
        const db = req.db;
        const { email } = req.params;
        const skip = Math.max(0, Number(req.query.skip || 0));
        const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));

        if (!email) {
            return res.status(400).json({ message: "email is required" });
        }

        const [ratings, total] = await Promise.all([
            RatingModel.findReceived(db, email, skip, limit),
            RatingModel.countReceived(db, email)
        ]);

        return res.status(200).json({
            success: true,
            total,
            skip,
            limit,
            ratings
        });
    } catch (error) {
        console.error("GET /ratings/received/:email error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
