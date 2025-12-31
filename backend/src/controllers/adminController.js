import { getDB } from "../config/db.js";
import { ObjectId } from "mongodb";

export const pendingNIDs = async (req, res) => {

    const db = getDB();

    const users = await db
        .collection("users")
        .find({ nidImages: { $exists: true, $ne: [] }, nidVerified: false })
        .toArray();

    res.send(users);

};

export const verifyUser = async (req, res) => {

    const db = getDB();

    const { status } = req.body;

    await db.collection("users").updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { nidVerified: status, nidVerifiedAt: new Date() } }
    );

    res.send({ success: true });

};

export const pendingProperties = async (req, res) => {

    const db = getDB();

    const data = await db
        .collection("properties")
        .find({ status: "pending" })
        .toArray();

    res.send(data);

};

export const updatePropertyStatus = async (req, res) => {

    const db = getDB();

    await db.collection("properties").updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { status: req.body.status } }
    );

    res.send({ success: true });

};
