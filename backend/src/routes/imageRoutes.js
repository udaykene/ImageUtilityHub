const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

const { uploadSingle, uploadMultiple } = require("../middlewares/upload");
const { compressImage } = require("../controllers/compressionController");
const { convertImage } = require("../controllers/conversionController");
const { resizeImage } = require("../controllers/resizeController");
const {
  extractImagesFromPDF,
  createPDFFromImages,
} = require("../controllers/pdfController");

/**
 * Image Compression
 * POST /api/compress
 */
router.post("/compress", uploadSingle, compressImage);

/**
 * Image Conversion
 * POST /api/convert
 */
router.post("/convert", uploadSingle, convertImage);

/**
 * Image Resize
 * POST /api/resize
 */
router.post("/resize", uploadSingle, resizeImage);

/**
 * Extract images from PDF
 * POST /api/extract
 */
router.post("/extract", uploadSingle, extractImagesFromPDF);

/**
 * Create PDF from images
 * POST /api/images-to-pdf
 */
router.post("/images-to-pdf", uploadMultiple, createPDFFromImages);

/**
 * Download processed file
 * GET /api/download/:filename
 */
router.get("/download/:filename", (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, "../../outputs", filename);
    console.log("Download request for:", filename);
    console.log("Full file path:", filePath);

    if (!fs.existsSync(filePath)) {
      console.log("File NOT found at:", filePath);
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    res.download(filePath, filename, (err) => {
      if (err) {
        console.error("Download error:", err);
        res.status(500).json({
          success: false,
          message: "Error downloading file",
        });
      }
    });
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({
      success: false,
      message: "Error downloading file",
      error: error.message,
    });
  }
});

module.exports = router;
