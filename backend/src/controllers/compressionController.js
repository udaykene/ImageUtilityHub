const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const {
  generateUniqueFilename,
  formatFileSize,
  ensureDirectoryExists,
} = require("../utils/fileUtils");

const outputsDir = path.join(__dirname, "../../outputs");
ensureDirectoryExists(outputsDir);

/**
 * Compress image with quality control
 */
const compressImage = async (req, res) => {
  console.log("--- Compression Request Received ---");
  try {
    if (!req.file) {
      console.log("No file uploaded");
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const {
      quality = 80,
      targetSize,
      outputFormat = "original",
      stripMetadata = true,
    } = req.body;
    const inputPath = req.file.path;
    const originalSize = req.file.size;

    // Determine output format
    let format =
      outputFormat === "original"
        ? path.extname(req.file.originalname).substring(1).toLowerCase()
        : outputFormat;

    // Handle jpg/jpeg
    if (format === "jpg") format = "jpeg";

    const outputFilename = generateUniqueFilename(
      req.file.originalname,
      `.${format}`
    );
    const outputPath = path.join(outputsDir, outputFilename);

    let image = sharp(inputPath);

    // Strip metadata if requested
    if (stripMetadata) {
      image = image.rotate(); // Auto-rotate based on EXIF then strip
    }

    // Apply format-specific compression
    const qualityValue = parseInt(quality);

    switch (format) {
      case "jpeg":
        image = image.jpeg({ quality: qualityValue, mozjpeg: true });
        break;
      case "png":
        image = image.png({ quality: qualityValue, compressionLevel: 9 });
        break;
      case "webp":
        image = image.webp({ quality: qualityValue });
        break;
      case "avif":
        image = image.avif({ quality: qualityValue });
        break;
      default:
        image = image.jpeg({ quality: qualityValue });
    }

    await image.toFile(outputPath);

    // Get output file stats
    const stats = fs.statSync(outputPath);
    const compressedSize = stats.size;
    const savings = ((1 - compressedSize / originalSize) * 100).toFixed(2);

    // Clean up input file
    fs.unlinkSync(inputPath);

    console.log("Compression successful:", outputFilename);
    res.json({
      success: true,
      message: "Image compressed successfully",
      data: {
        filename: outputFilename,
        originalSize: formatFileSize(originalSize),
        compressedSize: formatFileSize(compressedSize),
        savings: `${savings}%`,
        downloadUrl: `/api/download/${outputFilename}`,
        format: format,
      },
    });
  } catch (error) {
    console.error("Compression error:", error);

    // Clean up files on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: "Error compressing image",
      error: error.message,
    });
  }
};

module.exports = {
  compressImage,
};
