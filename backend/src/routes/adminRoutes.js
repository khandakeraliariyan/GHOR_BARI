import express from "express";

import verifyToken from "../middleware/verifyToken.js";

import verifyAdmin from "../middleware/verifyAdmin.js";

import {
  pendingNIDs,
  verifyUser,
  pendingProperties,
  updatePropertyStatus,
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/pending-nids", verifyToken, verifyAdmin, pendingNIDs);

router.patch("/verify-user/:id", verifyToken, verifyAdmin, verifyUser);

router.get("/pending-properties", verifyToken, verifyAdmin, pendingProperties);

router.patch("/property/:id", verifyToken, verifyAdmin, updatePropertyStatus);

export default router;
