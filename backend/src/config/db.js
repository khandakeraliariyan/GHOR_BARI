import { MongoClient } from "mongodb";

import dotenv from "dotenv";

dotenv.config();

const client = new MongoClient(process.env.MONGO_URI);

let db;

export async function connectDatabase() {

    try {

        await client.connect();

        db = client.db("GhorBari");

        console.log("✅ MongoDB connected");

        return db;

    } catch (error) {

        console.error("❌ MongoDB connection failed:", error.message);

        throw error;

    }

}

export function getDatabase() {

    return db;
    
}

