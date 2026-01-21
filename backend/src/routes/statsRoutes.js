import express from "express";
import * as statsController from "../controllers/statsController.js";

const router = express.Router();

// Public stats API - no authentication required
router.get("/public/stats", statsController.getPublicStats);

export default router;

