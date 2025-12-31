import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import { addReview, getReviews } from "../controllers/reviewController.js";

const router = express.Router();

router.post("/", verifyToken, addReview);

router.get("/:email", getReviews);

export default router;
