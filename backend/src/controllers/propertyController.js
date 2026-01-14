import { getDatabase } from "../config/db.js";

import { ObjectId } from "mongodb";

export const postProperty = async (req, res) => {

    try {

        const db = getDatabase();

        const data = req.body;

        const propertyType = data.propertyType; // flat | building

        // Base property object
        const property = {

            title: data.title,
            listingType: data.listingType,        // rent | sale
            propertyType: propertyType,           // flat | building
            price: Number(data.price),             // sale price or rent per month
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

        // Dynamic fields based on property type
        if (propertyType === "building") {
            // For building: floorCount and totalUnits
            property.floorCount = Number(data.floorCount);
            property.totalUnits = Number(data.totalUnits);
        } else if (propertyType === "flat") {
            // For flat: roomCount and bathrooms
            property.roomCount = Number(data.roomCount);
            property.bathrooms = Number(data.bathrooms);
        }

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

export const updateProperty = async (req, res) => {

    try {

        const db = getDatabase();

        const id = req.params.id;

        if (!ObjectId.isValid(id)) {

            return res.status(400).send({ message: "Invalid ID format" });

        }

        const data = req.body;

        // Get the existing property to check propertyType
        const existingProperty = await db.collection("properties").findOne({ _id: new ObjectId(id) });
        
        if (!existingProperty) {
            return res.status(404).send({ message: "Property not found" });
        }

        const propertyType = existingProperty.propertyType; // flat | building

        // Only allow updating specific fields
        const updateData = {

            price: Number(data.price),
            areaSqFt: Number(data.areaSqFt),
            images: data.images || [],
            overview: data.overview,
            amenities: data.amenities || [],
            location: {
                lat: Number(data.location.lat),
                lng: Number(data.location.lng)
            },
            updatedAt: new Date()

        };

        // Dynamic fields based on property type
        if (propertyType === "building") {
            // For building: floorCount and totalUnits
            updateData.floorCount = Number(data.floorCount);
            updateData.totalUnits = Number(data.totalUnits);
        } else if (propertyType === "flat") {
            // For flat: roomCount and bathrooms
            updateData.roomCount = Number(data.roomCount);
            updateData.bathrooms = Number(data.bathrooms);
        }

        const result = await db.collection("properties").updateOne(
            { _id: new ObjectId(id), "owner.email": req.user.email },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {

            return res.status(404).send({ message: "Property not found or you don't have permission" });

        }

        res.send({ success: true, message: "Property updated successfully" });

    } catch (error) {

        console.error("UPDATE /property/:id error:", error);

        res.status(500).send({ message: "Server error" });

    }

};

export const deleteProperty = async (req, res) => {

    try {

        const db = getDatabase();

        const id = req.params.id;

        if (!ObjectId.isValid(id)) {

            return res.status(400).send({ message: "Invalid ID format" });

        }

        const result = await db.collection("properties").deleteOne(
            { _id: new ObjectId(id), "owner.email": req.user.email }
        );

        if (result.deletedCount === 0) {

            return res.status(404).send({ message: "Property not found or you don't have permission" });

        }

        res.send({ success: true, message: "Property deleted successfully" });

    } catch (error) {

        console.error("DELETE /property/:id error:", error);

        res.status(500).send({ message: "Server error" });

    }

};

