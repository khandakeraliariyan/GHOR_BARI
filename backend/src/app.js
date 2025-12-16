const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const nidRoutes = require("./routes/nidRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/nid", nidRoutes);

app.get("/", (req, res) => {
  res.send("GhorBari Backend Running 🚀");
});

module.exports = app;
