require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { poolPromise } = require("./db");

const authRoutes = require("./routes/auth");
const formRoutes = require("./routes/formRoutes");
const userRoutes = require("./routes/userRoutes");
const { verifyToken } = require("./middleware/authMiddleware");

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Payload parsers
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// Authentication Routes (Public)
app.use("/api/auth", authRoutes);

// Protected Consultancy Forms Routes
app.use("/api/forms", formRoutes);

// Protected User Management Routes
app.use("/api/users", verifyToken, userRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err);
  res.status(500).json({ error: "Internal Server Error", message: err.message });
});

// Start Server
app.listen(PORT, async () => {
  console.log(`====================================================`);
  console.log(`🚀 Sakthi Auto Component API Server running on port ${PORT}`);
  console.log(`🌐 Base URL: http://localhost:${PORT}`);
  console.log(`📋 Forms API: http://localhost:${PORT}/api/forms`);
  console.log(`🔐 Auth API:  http://localhost:${PORT}/api/auth`);
  console.log(`====================================================`);
  // Trigger DB pool initialization
  await poolPromise;
});

module.exports = app;
