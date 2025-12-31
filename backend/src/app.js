import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";

import propertyRoutes from "./routes/property.routes.js";

import adminRoutes from "./routes/admin.routes.js";

import nidRoutes from "./routes/nidRoutes.js";

import reviewRoutes from "./routes/reviewRoutes.js";

import wishlistRoutes from "./routes/wishlistRoutes.js";

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {

  res.send("🏠 GhorBari API running");

});

app.use("/auth", authRoutes);

app.use("/properties", propertyRoutes);

app.use("/admin", adminRoutes);

app.use("/nid", nidRoutes);

app.use("/reviews", reviewRoutes);

app.use("/wishlist", wishlistRoutes);

export default app;
