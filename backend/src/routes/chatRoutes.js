import express from "express";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// connect socket messages here if needed
router.get("/history/:email", verifyToken, (req, res) => {

    res.send([]); // placeholder
    
});

export default router;
