import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import * as aiController from "../controllers/aiController.js";

const router = express.Router();

// Send message to Gemini AI
router.post("/api/ai/send-message", verifyToken, aiController.sendMessageToAI);

export default router;
