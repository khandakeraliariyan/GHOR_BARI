const User = require("../models/User");
const Property = require("../models/Property");

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Block or Unblock User
exports.toggleBlockUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.isBlocked = !user.isBlocked;
        await user.save();

        res.json({
            message: user.isBlocked
                ? "User blocked"
                : "User unblocked",
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all properties
exports.getAllPropertiesAdmin = async (req, res) => {
    try {
        const properties = await Property.find().populate(
            "owner",
            "name email"
        );
        res.json(properties);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Approve or Reject Property
exports.togglePropertyApproval = async (req, res) => {
    try {
        const property = await Property.findById(req.params.propertyId);

        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }

        property.isApproved = !property.isApproved;
        await property.save();

        res.json({
            message: property.isApproved
                ? "Property approved"
                : "Property unapproved",
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
