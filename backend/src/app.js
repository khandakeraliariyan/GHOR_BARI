import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";

import propertyRoutes from "./routes/property.routes.js";

import adminRoutes from "./routes/admin.routes.js";

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {

  res.send("🏠 GhorBari API running");

});

app.use("/auth", authRoutes);

app.use("/properties", propertyRoutes);

app.use("/admin", adminRoutes);

export default app;
