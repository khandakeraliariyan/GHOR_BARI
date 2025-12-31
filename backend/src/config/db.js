import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGO_URI);

let db;

export const connectDB = async () => {

    await client.connect();

    db = client.db("ghorbari");

    console.log("✅ MongoDB connected");

};

export const getDB = () => db;
