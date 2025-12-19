const express = require("express");
const router = express.Router();

const {
    addReview,
    getUserReviews,
} = require("../controllers/reviewController");

const { protect } = require("../middleware/authMiddleware");

// Add review
router.post("/", protect, addReview);

// Get reviews of a user
router.get("/:userId", getUserReviews);

module.exports = router;
