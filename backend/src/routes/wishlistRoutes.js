import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import { addToWishlist, getWishlist } from "../controllers/wishlistController.js";

const router = express.Router();

router.post("/", verifyToken, addToWishlist);

router.get("/", verifyToken, getWishlist);

export default router;
