const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const friendRoutes = require("./routes/friendRoutes");
const graphRoutes = require("./routes/graphRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const messageRoutes = require("./routes/messageRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Graph Social Network API is running"));
app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/graph", graphRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/messages", messageRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

module.exports = app;
