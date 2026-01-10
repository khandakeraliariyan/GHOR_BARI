import { getDatabase } from "../config/db.js";

import { ObjectId } from "mongodb";

export const postProperty = async (req, res) => {

    try {

        const db = getDatabase();

        const data = req.body;

        const property = {

            title: data.title,
            listingType: data.listingType,        // rent | sale
            propertyType: data.propertyType,      // flat | building
            price: Number(data.price),             // sale price or rent per month
            unitCount: Number(data.unitCount),    // bedrooms OR floors
            bathrooms: Number(data.bathrooms),
            areaSqFt: Number(data.areaSqFt),

            // Address object now stores IDs + full address
            address: {
                division_id: data.address.division_id,
                district_id: data.address.district_id,
                upazila_id: data.address.upazila_id,
                street: data.address.street
            },

            // Array of image URLs from ImgBB
            images: data.images || [],

            overview: data.overview,
            amenities: data.amenities || [],

            location: {
                lat: Number(data.location.lat),
                lng: Number(data.location.lng)
            },

            owner: {
                uid: req.user.uid,
                name: req.user.name,
                email: req.user.email,
                photoURL: req.user.photoURL
            },

            isOwnerVerified: req.user.isVerified,
            status: "pending",
            createdAt: new Date()
        };

        // Insert directly into the "properties" collection

        const result = await db.collection("properties").insertOne(property);

        res.status(201).send({ success: true, id: result.insertedId });

    } catch (error) {

        console.error(error);

        res.status(500).send({ message: "Server error" });

    }

};

export const getMyProperties = async (req, res) => {

    try {

        const db = getDatabase();

        const email = req.query.email;

        const query = { "owner.email": email };

        // Sorting by newest first
        const result = await db.collection("properties")
            .find(query)
            .sort({ createdAt: -1 })
            .toArray();

        res.send(result);

    } catch (error) {

        console.error("GET /my-properties error:", error);

        res.status(500).send({ message: "Server error" });

    }

};

export const getPropertyById = async (req, res) => {

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

        console.error("GET /property/:id error:", error);

        res.status(500).send({ message: "Server error" });

    }

};

export const getActiveProperties = async (req, res) => {

    try {

        const db = getDatabase();

        const result = await db.collection("properties")
            .find({ status: "active" })       // only show active approved listings
            .sort({ createdAt: -1 })          // newest first
            .toArray();

        return res.json(result);

    } catch (error) {

        console.error("GET /properties error:", error);

        res.status(500).json({ message: "Server error" });

    }
    
};

