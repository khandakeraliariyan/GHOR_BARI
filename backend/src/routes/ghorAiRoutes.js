import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import * as ghorAiController from "../controllers/ghorAiController.js";

const router = express.Router();

router.post("/ghor-ai/chat", verifyToken, ghorAiController.chat);

export default router;
