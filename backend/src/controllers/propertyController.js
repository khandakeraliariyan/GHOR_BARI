import { getDB } from "../config/db.js";
import { ObjectId } from "mongodb";

export const createProperty = async (req, res) => {

    const db = getDB();

    const data = req.body;

    const property = {

        ...data,
        owner: {
            uid: req.user.uid,
            email: req.user.email,
            name: req.user.name,
            photoURL: req.user.photoURL,
        },

        isOwnerVerified: req.user.isVerified,
        status: "pending",
        createdAt: new Date(),

    };

    const result = await db.collection("properties").insertOne(property);

    res.status(201).send({ id: result.insertedId });

};

export const getMyProperties = async (req, res) => {

    const db = getDB();

    const result = await db
        .collection("properties")
        .find({ "owner.email": req.query.email })
        .sort({ createdAt: -1 })
        .toArray();

    res.send(result);

};

export const getActiveProperties = async (req, res) => {

    const db = getDB();

    const result = await db
        .collection("properties")
        .find({ status: "active" })
        .sort({ createdAt: -1 })
        .toArray();

    res.send(result);

};

export const getPropertyById = async (req, res) => {

    const db = getDB();

    if (!ObjectId.isValid(req.params.id)) {

        return res.status(400).send({ message: "Invalid ID" });

    }

    const property = await db
        .collection("properties")
        .findOne({ _id: new ObjectId(req.params.id) });

    if (!property) return res.status(404).send({ message: "Not found" });

    res.send(property);

};
