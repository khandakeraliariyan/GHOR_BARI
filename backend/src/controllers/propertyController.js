import { getDB } from "../config/db.js";
import { ObjectId } from "mongodb";
import { compareProperties } from "../controllers/propertyController.js";

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

export const compareProperties = async (req, res) => {

    try {

        const db = getDB();

        const { ids } = req.body; // array of property IDs

        if (!Array.isArray(ids) || ids.length < 2) {

            return res.status(400).send({

                message: "At least two property IDs are required for comparison",

            });
        }

        const objectIds = ids
            .filter(id => ObjectId.isValid(id))
            .map(id => new ObjectId(id));

        const properties = await db
            .collection("properties")
            .find({ _id: { $in: objectIds }, status: "active" })
            .project({
                title: 1,
                price: 1,
                areaSqFt: 1,
                unitCount: 1,
                bathrooms: 1,
                amenities: 1,
                propertyType: 1,
                listingType: 1,
                location: 1,
                isOwnerVerified: 1,
                owner: { name: 1 },
            })
            .toArray();

        res.send(properties);

    } catch (error) {

        console.error("COMPARE ERROR:", error);

        res.status(500).send({ message: "Server error" });

    }

};