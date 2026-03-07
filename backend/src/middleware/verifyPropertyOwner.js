import { getDatabase } from "../config/db.js";
import { ObjectId } from "mongodb";


/**
 * Middleware to verify property ownership
 * Validates property ID and ownership before allowing modifications
 */
export const verifyPropertyOwner = async (req, res, next) => {

    try {

        const db = getDatabase();
        const id = req.params.id;


        // Validate MongoDB ObjectId format
        if (!ObjectId.isValid(id)) {
            return res.status(400).send({ message: "Invalid ID format" });
        }


        // Find property by ID
        const property = await db.collection("properties").findOne({
            _id: new ObjectId(id)
        });


        // Check if property exists
        if (!property) {
            return res.status(404).send({ message: "Property not found" });
        }


        // Verify ownership
        if (property.owner.email !== req.user.email) {
            return res.status(403).send({
                message: "Forbidden: You don't own this property"
            });
        }


        // Attach property to request
        req.property = property;
        next();

    } catch (error) {

        console.error("verifyPropertyOwner error:", error);
        res.status(500).send({ message: "Server error" });

    }

};
















