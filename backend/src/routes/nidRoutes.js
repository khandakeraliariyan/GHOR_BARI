import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import { submitNID } from "../controllers/nidController.js";

const router = express.Router();

router.post("/submit", verifyToken, submitNID);

export default router;
