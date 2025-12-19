const Property = require("../models/Property");

// CREATE PROPERTY (Owner only & Verified)
exports.createProperty = async (req, res) => {
    try {
        if (!req.user.isVerified) {
            return res
                .status(403)
                .json({ message: "NID verification required" });
        }

        const property = await Property.create({
            ...req.body,
            owner: req.user._id,
        });

        res.status(201).json({
            message: "Property listed successfully",
            property,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET ALL PROPERTIES (Public)
exports.getAllProperties = async (req, res) => {
    try {
        const properties = await Property.find().populate(
            "owner",
            "name rating"
        );
        res.json(properties);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET SINGLE PROPERTY
exports.getPropertyById = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id).populate(
            "owner",
            "name rating"
        );

        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }

        res.json(property);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE PROPERTY (Owner only)
exports.updateProperty = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }

        if (property.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        Object.assign(property, req.body);
        await property.save();

        res.json({
            message: "Property updated successfully",
            property,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE PROPERTY (Owner only)
exports.deleteProperty = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }

        if (property.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        await property.deleteOne();

        res.json({ message: "Property deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
