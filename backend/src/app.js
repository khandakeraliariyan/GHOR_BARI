import express from "express";

import cors from "cors";

import dotenv from "dotenv";

import userRoutes from "./routes/users.js";

import propertyRoutes from "./routes/properties.js";

import adminRoutes from "./routes/admin.js";

dotenv.config();

const app = express();

// Middlewares

app.use(cors());

app.use(express.json());

// Test route

app.get("/", (req, res) => {

    res.send("🏠 GhorBari server is running");

});

// Routes

app.use("/", userRoutes);

app.use("/", propertyRoutes);

app.use("/", adminRoutes);

export default app;
