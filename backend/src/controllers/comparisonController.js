import { ComparisonModel } from "../models/Comparison.js";
import { ObjectId } from "mongodb";

export const createComparison = async (req, res) => {
    try {
        const db = req.db;
        const { propertyIds, title, isPublic } = req.body;
        const userEmail = req.user.email;

        if (!propertyIds || propertyIds.length === 0) {
            return res.status(400).json({ message: "At least one property is required" });
        }

        if (propertyIds.length > 10) {
            return res.status(400).json({ message: "Cannot compare more than 10 properties" });
        }

        // Verify all properties exist
        const properties = await db.collection("properties")
            .find({ _id: { $in: propertyIds.map(id => new ObjectId(id)) } })
            .toArray();

        if (properties.length !== propertyIds.length) {
            return res.status(404).json({ message: "One or more properties not found" });
        }

        const comparisonId = await ComparisonModel.create(db, {
            userId: req.user.uid,
            userEmail,
            title: title || "My Property Comparison",
            propertyIds,
            isPublic: isPublic || false
        });

        const comparison = await ComparisonModel.findById(db, comparisonId);

        return res.status(201).json({
            message: "Comparison created successfully",
            comparison
        });

    } catch (error) {
        console.error("POST /create-comparison error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getComparison = async (req, res) => {
    try {
        const db = req.db;
        const { comparisonId } = req.params;

        const comparison = await ComparisonModel.getComparisonWithPropertiesAndOwners(db, comparisonId);

        if (!comparison) {
            return res.status(404).json({ message: "Comparison not found" });
        }

        // Check if user has access
        if (!comparison.isPublic && comparison.userEmail !== req.user?.email) {
            return res.status(403).json({ message: "Unauthorized access" });
        }

        return res.status(200).json({
            message: "Comparison retrieved",
            comparison
        });

    } catch (error) {
        console.error("GET /comparison/:comparisonId error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getComparisonByShareLink = async (req, res) => {
    try {
        const db = req.db;
        const { shareLink } = req.params;

        const comparison = await ComparisonModel.findByShareLink(db, shareLink);

        if (!comparison) {
            return res.status(404).json({ message: "Comparison not found or has expired" });
        }

        // Get full comparison with properties and owners
        const fullComparison = await ComparisonModel.getComparisonWithPropertiesAndOwners(
            db,
            comparison._id.toString()
        );

        return res.status(200).json({
            message: "Comparison retrieved",
            comparison: fullComparison
        });

    } catch (error) {
        console.error("GET /comparison/share/:shareLink error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getUserComparisons = async (req, res) => {
    try {
        const db = req.db;
        const userEmail = req.user.email;

        const comparisons = await ComparisonModel.findByUserId(db, userEmail);

        return res.status(200).json({
            message: "User comparisons retrieved",
            comparisons
        });

    } catch (error) {
        console.error("GET /user-comparisons error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const updateComparison = async (req, res) => {
    try {
        const db = req.db;
        const { comparisonId } = req.params;
        const { title, isPublic, propertyIds } = req.body;
        const userEmail = req.user.email;

        // Verify ownership
        const comparison = await ComparisonModel.findById(db, comparisonId);
        if (!comparison) {
            return res.status(404).json({ message: "Comparison not found" });
        }

        if (comparison.userEmail !== userEmail) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // Validate property count if updating
        if (propertyIds && propertyIds.length > 10) {
            return res.status(400).json({ message: "Cannot compare more than 10 properties" });
        }

        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (isPublic !== undefined) updateData.isPublic = isPublic;
        if (propertyIds !== undefined) updateData.propertyIds = propertyIds;

        await ComparisonModel.update(db, comparisonId, updateData);

        const updatedComparison = await ComparisonModel.findById(db, comparisonId);

        return res.status(200).json({
            message: "Comparison updated",
            comparison: updatedComparison
        });

    } catch (error) {
        console.error("PUT /comparison/:comparisonId error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const addPropertyToComparison = async (req, res) => {
    try {
        const db = req.db;
        const { comparisonId } = req.params;
        const { propertyId } = req.body;
        const userEmail = req.user.email;

        if (!propertyId) {
            return res.status(400).json({ message: "Property ID is required" });
        }

        // Verify ownership
        const comparison = await ComparisonModel.findById(db, comparisonId);
        if (!comparison) {
            return res.status(404).json({ message: "Comparison not found" });
        }

        if (comparison.userEmail !== userEmail) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // Check property count
        if (comparison.propertyIds.length >= 10) {
            return res.status(400).json({ message: "Cannot add more than 10 properties to comparison" });
        }

        // Check if property already exists
        if (comparison.propertyIds.some(id => id.toString() === propertyId)) {
            return res.status(400).json({ message: "Property already in comparison" });
        }

        // Verify property exists
        const property = await db.collection("properties").findOne({
            _id: new ObjectId(propertyId)
        });

        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }

        await ComparisonModel.addProperty(db, comparisonId, propertyId);

        const updatedComparison = await ComparisonModel.findById(db, comparisonId);

        return res.status(200).json({
            message: "Property added to comparison",
            comparison: updatedComparison
        });

    } catch (error) {
        console.error("POST /comparison/:comparisonId/add-property error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const removePropertyFromComparison = async (req, res) => {
    try {
        const db = req.db;
        const { comparisonId, propertyId } = req.params;
        const userEmail = req.user.email;

        // Verify ownership
        const comparison = await ComparisonModel.findById(db, comparisonId);
        if (!comparison) {
            return res.status(404).json({ message: "Comparison not found" });
        }

        if (comparison.userEmail !== userEmail) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await ComparisonModel.removeProperty(db, comparisonId, propertyId);

        const updatedComparison = await ComparisonModel.findById(db, comparisonId);

        return res.status(200).json({
            message: "Property removed from comparison",
            comparison: updatedComparison
        });

    } catch (error) {
        console.error("DELETE /comparison/:comparisonId/property/:propertyId error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const deleteComparison = async (req, res) => {
    try {
        const db = req.db;
        const { comparisonId } = req.params;
        const userEmail = req.user.email;

        // Verify ownership
        const comparison = await ComparisonModel.findById(db, comparisonId);
        if (!comparison) {
            return res.status(404).json({ message: "Comparison not found" });
        }

        if (comparison.userEmail !== userEmail) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await ComparisonModel.delete(db, comparisonId);

        return res.status(200).json({
            message: "Comparison deleted"
        });

    } catch (error) {
        console.error("DELETE /comparison/:comparisonId error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const shareComparison = async (req, res) => {
    try {
        const db = req.db;
        const { comparisonId } = req.params;
        const userEmail = req.user.email;

        // Verify ownership
        const comparison = await ComparisonModel.findById(db, comparisonId);
        if (!comparison) {
            return res.status(404).json({ message: "Comparison not found" });
        }

        if (comparison.userEmail !== userEmail) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // Make it public
        await ComparisonModel.update(db, comparisonId, { isPublic: true });

        const updatedComparison = await ComparisonModel.findById(db, comparisonId);

        return res.status(200).json({
            message: "Comparison is now public",
            comparison: updatedComparison,
            shareLink: `/comparison/share/${updatedComparison.shareLink}`
        });

    } catch (error) {
        console.error("POST /comparison/:comparisonId/share error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const makeComparisonPrivate = async (req, res) => {
    try {
        const db = req.db;
        const { comparisonId } = req.params;
        const userEmail = req.user.email;

        // Verify ownership
        const comparison = await ComparisonModel.findById(db, comparisonId);
        if (!comparison) {
            return res.status(404).json({ message: "Comparison not found" });
        }

        if (comparison.userEmail !== userEmail) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // Make it private
        await ComparisonModel.update(db, comparisonId, { isPublic: false });

        const updatedComparison = await ComparisonModel.findById(db, comparisonId);

        return res.status(200).json({
            message: "Comparison is now private",
            comparison: updatedComparison
        });

    } catch (error) {
        console.error("POST /comparison/:comparisonId/private error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
