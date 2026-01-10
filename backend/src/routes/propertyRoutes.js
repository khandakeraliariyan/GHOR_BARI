import express from "express";

import { verifyToken } from "../middleware/verifyToken.js";

import { verifyOwner } from "../middleware/verifyOwner.js";

import * as propertyController from "../controllers/propertyController.js";


const router = express.Router();


// Create property
router.post("/post-property", verifyToken, propertyController.postProperty);

// Get all property data of a user
router.get("/my-properties", verifyToken, verifyOwner, propertyController.getMyProperties);

// Get single property by ID
router.get("/property/:id", verifyToken, propertyController.getPropertyById);

// Get all ACTIVE property listings
router.get("/active-properties", verifyToken, propertyController.getActiveProperties);

export default router;
