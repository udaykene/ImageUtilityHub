require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const imageRoutes = require("./src/routes/imageRoutes");
const errorHandler = require("./src/middlewares/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Image Utility Hub API is running" });
});

// API Routes
app.use("/api", imageRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(
    `☁️  Cloudinary configured for: ${process.env.CLOUDINARY_CLOUD_NAME}`
  );
  console.log(
    `🗑️  Auto-delete after: ${process.env.CLOUDINARY_AUTO_DELETE_HOURS} hours`
  );
});

// Heartbeat to keep process alive in case of event loop issues
setInterval(() => {
  if (process.env.NODE_ENV === "development") {
    // console.log("💓 Heartbeat - Server is alive");
  }
}, 30000);

// Process event listeners for debugging
process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT (Ctrl+C). Shutting down...");
  server.close(() => {
    console.log("👋 Server closed. Exit.");
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM. Shutting down...");
  server.close(() => {
    process.exit(0);
  });
});

process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("💥 Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

module.exports = app;
