const express = require("express");
const router = express.Router();

const {
    createProperty,
    getAllProperties,
    getPropertyById,
    updateProperty,
    deleteProperty,
} = require("../controllers/propertyController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// Public routes
router.get("/", getAllProperties);
router.get("/:id", getPropertyById);

// Owner routes
router.post(
    "/",
    protect,
    authorizeRoles("owner"),
    createProperty
);

router.put(
    "/:id",
    protect,
    authorizeRoles("owner"),
    updateProperty
);

router.delete(
    "/:id",
    protect,
    authorizeRoles("owner"),
    deleteProperty
);

module.exports = router;
