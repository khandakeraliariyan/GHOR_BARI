import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import { WishlistModel } from "../models/Wishlist.js";
import { RatingModel } from "../models/Rating.js";
import { EmailJobModel } from "../models/EmailJob.js";


// Load environment variables
dotenv.config();


// Initialize MongoDB client
const client = new MongoClient(process.env.MONGO_URI);

let db;


/**
 * Connect to MongoDB database
 * Set up indexes for collections
 */
export async function connectDatabase() {

    try {

        // Connect to MongoDB server
        await client.connect();

        // Get database reference
        db = client.db("GhorBari");

        console.log("✅ MongoDB connected");


        // Set up Wishlist indexes
        try {
            await WishlistModel.ensureIndexes(db);
            console.log("📑 Wishlist indexes ensured");
        } catch (err) {
            console.error("Failed to ensure wishlist indexes", err);
        }


        // Set up Rating indexes
        try {
            await RatingModel.ensureIndexes(db);
            console.log("📑 Rating indexes ensured");
        } catch (err) {
            console.error("Failed to ensure rating indexes", err);
        }


        // Set up Email Job indexes
        try {
            await EmailJobModel.ensureIndexes(db);
            console.log("📑 Email job indexes ensured");
        } catch (err) {
            console.error("Failed to ensure email job indexes", err);
        }

        return db;

    } catch (error) {

        console.error("❌ MongoDB connection failed:", error.message);
        throw error;

    }

}


/**
 * Get the database instance
 * @returns {Object} MongoDB database instance
 */
export function getDatabase() {

    return db;

}
