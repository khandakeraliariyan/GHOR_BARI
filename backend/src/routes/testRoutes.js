const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

router.get("/protected", protect, (req, res) => {
    res.json({
        message: "You accessed a protected route",
        user: req.user,
    });
});

router.get(
    "/owner-only",
    protect,
    authorizeRoles("owner"),
    (req, res) => {
        res.json({ message: "Owner access granted" });
    }
);

router.get(
    "/admin-only",
    protect,
    authorizeRoles("admin"),
    (req, res) => {
        res.json({ message: "Admin access granted" });
    }
);

module.exports = router;
