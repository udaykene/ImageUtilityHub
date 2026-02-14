const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const imageRoutes = require("./src/routes/imageRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from outputs directory
app.use("/outputs", express.static(path.join(__dirname, "outputs")));

// Routes
app.use("/api", imageRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Image Utility Hub API is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});

// Cleanup old files every hour
const cleanupInterval = setInterval(
  () => {
    const uploadsDir = path.join(__dirname, "uploads");
    const outputsDir = path.join(__dirname, "outputs");
    const maxAge = 60 * 60 * 1000; // 1 hour

    [uploadsDir, outputsDir].forEach((dir) => {
      if (fs.existsSync(dir)) {
        fs.readdir(dir, (err, files) => {
          if (err) return;

          files.forEach((file) => {
            const filePath = path.join(dir, file);
            fs.stat(filePath, (err, stats) => {
              if (err) return;

              if (Date.now() - stats.mtimeMs > maxAge) {
                fs.rm(filePath, { recursive: true, force: true }, (err) => {
                  if (err) console.error(`Error deleting ${filePath}:`, err);
                });
              }
            });
          });
        });
      }
    });
  },
  60 * 60 * 1000
); // Run every hour

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Uploads directory: ${path.join(__dirname, "uploads")}`);
  console.log(`📁 Outputs directory: ${path.join(__dirname, "outputs")}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  clearInterval(cleanupInterval);
  process.exit(0);
});
