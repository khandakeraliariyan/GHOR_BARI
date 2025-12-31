import express from "express";
import { registerUser } from "../controllers/authController.js";

const router = express.Router();

// register user after firebase login

router.post("/register", registerUser);

export default router;
