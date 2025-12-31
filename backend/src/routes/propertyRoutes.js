import express from "express";

import verifyToken from "../middleware/verifyToken.js";

import verifyOwner from "../middleware/verifyOwner.js";

import {
    createProperty,
    getMyProperties,
    getActiveProperties,
    getPropertyById,
    compareProperties,
} from "../controllers/propertyController.js";

const router = express.Router();

router.post("/", verifyToken, createProperty);

router.get("/mine", verifyToken, verifyOwner, getMyProperties);

router.get("/active", verifyToken, getActiveProperties);

router.post("/compare", verifyToken, compareProperties);

router.get("/:id", verifyToken, getPropertyById);

export default router;
