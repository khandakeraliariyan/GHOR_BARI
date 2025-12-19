const express = require("express");
const router = express.Router();

const {
    toggleWishlist,
    getWishlist,
} = require("../controllers/wishlistController");

const { protect } = require("../middleware/authMiddleware");

// Toggle wishlist
router.post("/:propertyId", protect, toggleWishlist);

// Get wishlist
router.get("/", protect, getWishlist);

module.exports = router;
