const express = require("express");
const router = express.Router();

const {
    getAllUsers,
    toggleBlockUser,
    getAllPropertiesAdmin,
    togglePropertyApproval,
} = require("../controllers/adminController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// User management
router.get("/users", protect, authorizeRoles("admin"), getAllUsers);
router.put(
    "/users/:userId/block",
    protect,
    authorizeRoles("admin"),
    toggleBlockUser
);

// Property moderation
router.get(
    "/properties",
    protect,
    authorizeRoles("admin"),
    getAllPropertiesAdmin
);

router.put(
    "/properties/:propertyId/approve",
    protect,
    authorizeRoles("admin"),
    togglePropertyApproval
);

module.exports = router;
