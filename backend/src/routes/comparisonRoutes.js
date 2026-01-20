import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import * as comparisonController from "../controllers/comparisonController.js";

const router = express.Router();

// Create a new comparison
router.post("/create-comparison", verifyToken, comparisonController.createComparison);

// Get a specific comparison with details
router.get("/comparison/:comparisonId", verifyToken, comparisonController.getComparison);

// Get comparison by public share link (no auth required)
router.get("/comparison/share/:shareLink", comparisonController.getComparisonByShareLink);

// Get all comparisons for logged-in user
router.get("/user-comparisons", verifyToken, comparisonController.getUserComparisons);

// Update comparison (title, isPublic, etc.)
router.put("/comparison/:comparisonId", verifyToken, comparisonController.updateComparison);

// Add property to comparison
router.post("/comparison/:comparisonId/add-property", verifyToken, comparisonController.addPropertyToComparison);

// Remove property from comparison
router.delete("/comparison/:comparisonId/property/:propertyId", verifyToken, comparisonController.removePropertyFromComparison);

// Share comparison (make it public)
router.post("/comparison/:comparisonId/share", verifyToken, comparisonController.shareComparison);

// Make comparison private
router.post("/comparison/:comparisonId/private", verifyToken, comparisonController.makeComparisonPrivate);

// Delete comparison
router.delete("/comparison/:comparisonId", verifyToken, comparisonController.deleteComparison);

export default router;
