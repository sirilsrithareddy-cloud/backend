const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const projectRoutes = require("./routes/projectRoutes");
const authRoutes = require("./routes/authRoutes");

dotenv.config();

const app = express();

// Core middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes
app.use("/api/projects", projectRoutes);
app.use("/api/auth", authRoutes);

// Mongo connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mern_projects";

console.log("🔗 Attempting to connect to MongoDB...");
console.log("📍 URI:", MONGO_URI.replace(/\/\/.*@/, "//***:***@")); // Hide credentials in logs

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB:", err.message);
    console.log("💡 Make sure your MongoDB Atlas IP is whitelisted");
    console.log("💡 Or check your MONGO_URI environment variable");
    process.exit(1);
  });
