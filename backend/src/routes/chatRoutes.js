const express = require("express");
const router = express.Router();

const { getMessages } = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");

// Get messages with specific user
router.get("/:userId", protect, getMessages);

module.exports = router;
