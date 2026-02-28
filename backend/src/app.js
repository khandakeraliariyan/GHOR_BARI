import express from "express";

import cors from "cors";

import dotenv from "dotenv";

import userRoutes from "./routes/userRoutes.js";

import propertyRoutes from "./routes/propertyRoutes.js";

import adminRoutes from "./routes/adminRoutes.js";

import applicationRoutes from "./routes/applicationRoutes.js";

import chatRoutes from "./routes/chatRoutes.js";

import comparisonRoutes from "./routes/comparisonRoutes.js";

import statsRoutes from "./routes/statsRoutes.js";

import aiRoutes from "./routes/aiRoutes.js";

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

app.use("/", applicationRoutes);

app.use("/", chatRoutes);

app.use("/", comparisonRoutes);

app.use("/", statsRoutes);

app.use("/", aiRoutes);

export default app;
