import { getDatabase } from "../config/database.js";

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

        const { status } = req.body; // "active" or "deleted"

        const result = await db.collection("properties").updateOne(
            { _id: new ObjectId(id) },
            { $set: { status: status } }
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

