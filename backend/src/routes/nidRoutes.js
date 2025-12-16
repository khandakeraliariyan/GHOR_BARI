const express = require("express");
const router = express.Router();

const {
  submitNID,
  getPendingNIDs,
  updateNIDStatus,
} = require("../controllers/nidController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// User submits NID
router.post("/submit", protect, submitNID);

// Admin views pending NIDs
router.get(
  "/pending",
  protect,
  authorizeRoles("admin"),
  getPendingNIDs
);

// Admin approves/rejects NID
router.put(
  "/update",
  protect,
  authorizeRoles("admin"),
  updateNIDStatus
);

module.exports = router;
