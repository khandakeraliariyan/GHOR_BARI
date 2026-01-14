import { getDatabase } from "../config/db.js";

import { ObjectId } from "mongodb";

export const getPendingVerifications = async (req, res) => {

    try {

        const db = getDatabase();

        const users = await db.collection("users")
            .find({ nidImages: { $exists: true, $ne: [] }, nidVerified: false })
            .sort({ nidSubmittedAt: -1 })
            .toArray();

        res.send(users);

    } catch (error) {

        res.status(500).send({ message: "Server error" });

    }

};

export const verifyUser = async (req, res) => {
    
    try {
    
        const db = getDatabase();
    
        const id = req.params.id;
    
        const { status } = req.body; // boolean
    
        const result = await db.collection("users").updateOne(
            { _id: new ObjectId(id) },
            { $set: { nidVerified: status, nidVerifiedAt: status ? new Date() : null } }
        );
    
        res.send(result);
    
    } catch (error) {
    
        res.status(500).send({ message: "Server error" });
    
    }

};

export const getPendingProperties = async (req, res) => {

    try {

        const db = getDatabase();

        const properties = await db.collection("properties")
            .find({ status: "pending" })
            .sort({ createdAt: -1 })
            .toArray();

        res.send(properties);
    
    } catch (error) {
    
        res.status(500).send({ message: "Server error" });
    
    }

};

export const updatePropertyStatus = async (req, res) => {

    try {

        const db = getDatabase();

        const id = req.params.id;

        const { status } = req.body; // status can be: "active", "rejected", "rented", "sold", "deal-in-progress", "deal-cancelled"

        // Get the current property to check its status
        const property = await db.collection("properties").findOne({ _id: new ObjectId(id) });
        
        if (!property) {
            return res.status(404).send({ message: "Property not found" });
        }

        // If status is "deal-cancelled", restore previous status from the property document
        if (status === "deal-cancelled") {
            const statusToRestore = property.previousStatus || property.status;
            const result = await db.collection("properties").updateOne(
                { _id: new ObjectId(id) },
                { 
                    $set: { 
                        status: statusToRestore,
                        previousStatus: null // Clear previous status after restoration
                    } 
                }
            );
            return res.send(result);
        }

        // Business logic validations
        // Can't mark as rented if listingType is sale
        if (status === "rented" && property.listingType === "sale") {
            return res.status(400).send({ message: "Cannot mark a property for sale as rented" });
        }
        
        // Can't mark as sold if listingType is rent
        if (status === "sold" && property.listingType === "rent") {
            return res.status(400).send({ message: "Cannot mark a property for rent as sold" });
        }
        
        // Can't mark as rented if already rented or sold
        if (status === "rented" && ["rented", "sold"].includes(property.status)) {
            return res.status(400).send({ message: "Property is already marked as rented or sold" });
        }
        
        // Can't mark as sold if already rented or sold
        if (status === "sold" && ["rented", "sold"].includes(property.status)) {
            return res.status(400).send({ message: "Property is already marked as rented or sold" });
        }
        
        // Can't mark deal-in-progress if already rented or sold
        if (status === "deal-in-progress" && ["rented", "sold"].includes(property.status)) {
            return res.status(400).send({ message: "Cannot mark rented or sold property as deal in progress" });
        }
        
        // Can't mark deal-in-progress if property is rejected (must be approved first)
        if (status === "deal-in-progress" && property.status === "rejected") {
            return res.status(400).send({ message: "Cannot mark rejected property as deal in progress. Please approve it first." });
        }

        // For other status changes
        let updateData = { status: status };
        
        // Store previous status if changing from active or pending to deal-in-progress
        if ((property.status === "active" || property.status === "pending") && status === "deal-in-progress") {
            updateData.previousStatus = property.status;
        }

        const result = await db.collection("properties").updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        res.send(result);
    
    } catch (error) {
    
        res.status(500).send({ message: "Server error" });
    
    }

};

export const deleteProperty = async (req, res) => {

    try {

        const db = getDatabase();

        const id = req.params.id;

        const result = await db.collection("properties").deleteOne({
            _id: new ObjectId(id)
        });

        res.send(result);

    } catch (error) {
        
        res.status(500).send({ message: "Server error" });
    
    }

};

export const getStats = async (req, res) => {

    try {
    
        const db = getDatabase();
    
        const pendingVer = await db.collection("users").countDocuments({ nidImages: { $exists: true, $ne: [] }, nidVerified: false });
    
        const pendingList = await db.collection("properties").countDocuments({ status: "pending" });
    
        const activeList = await db.collection("properties").countDocuments({ status: "active" });
    
        const rentedCount = await db.collection("properties").countDocuments({ status: "rented" });
    
        const soldCount = await db.collection("properties").countDocuments({ status: "sold" });

        res.send({
            pendingVer,
            pendingList,
            activeList,
            rentedCount,
            soldCount
        });
    
    } catch (error) {
    
        res.status(500).send({ message: "Server error" });
    
    }

};

export const getAdminPropertyById = async (req, res) => {

    try {

        const db = getDatabase();

        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
            return res.status(400).send({ message: "Invalid ID format" });
        }

        const result = await db.collection("properties").findOne({ _id: new ObjectId(id) });

        if (!result) return res.status(404).send({ message: "Property not found" });

        res.send(result);

    } catch (error) {

        res.status(500).send({ message: "Server error" });

    }

};

// Get all users
export const getAllUsers = async (req, res) => {

    try {

        const db = getDatabase();

        const users = await db.collection("users")
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        // Get property count for each user
        const usersWithPropertyCount = await Promise.all(
            users.map(async (user) => {
                const propertyCount = await db.collection("properties")
                    .countDocuments({ "owner.email": user.email });
                return { ...user, totalProperties: propertyCount };
            })
        );

        res.send(usersWithPropertyCount);

    } catch (error) {

        res.status(500).send({ message: "Server error" });

    }

};

// Get all properties
export const getAllProperties = async (req, res) => {

    try {

        const db = getDatabase();

        const properties = await db.collection("properties")
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        res.send(properties);

    } catch (error) {

        res.status(500).send({ message: "Server error" });

    }

};

// Delete user
export const deleteUser = async (req, res) => {

    try {

        const db = getDatabase();

        const id = req.params.id;

        const result = await db.collection("users").deleteOne({
            _id: new ObjectId(id)
        });

        res.send(result);

    } catch (error) {
        
        res.status(500).send({ message: "Server error" });
    
    }

};

