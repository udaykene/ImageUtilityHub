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
 * Convert image to different format
 */
const convertImage = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const { outputFormat, quality = 90 } = req.body;

    if (!outputFormat) {
      return res
        .status(400)
        .json({ success: false, message: "Output format is required" });
    }

    const inputPath = req.file.path;
    const originalSize = req.file.size;
    const originalFormat = path.extname(req.file.originalname).substring(1);

    // Normalize format
    let format = outputFormat.toLowerCase();
    if (format === "jpg") format = "jpeg";

    const outputFilename = generateUniqueFilename(
      outputsDir,
      req.file.originalname,
      `.${format}`
    );
    const outputPath = path.join(outputsDir, outputFilename);

    let image = sharp(inputPath);
    const qualityValue = parseInt(quality);

    // Apply format conversion
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
      case "tiff":
        image = image.tiff({ quality: qualityValue });
        break;
      case "gif":
        image = image.gif();
        break;
      default:
        return res.status(400).json({
          success: false,
          message: `Unsupported format: ${format}`,
        });
    }

    await image.toFile(outputPath);

    // Get output file stats
    const stats = fs.statSync(outputPath);
    const convertedSize = stats.size;

    // Clean up input file
    fs.unlinkSync(inputPath);

    res.json({
      success: true,
      message: "Image converted successfully",
      data: {
        filename: outputFilename,
        originalFormat: originalFormat,
        newFormat: format,
        originalSize: formatFileSize(originalSize),
        convertedSize: formatFileSize(convertedSize),
        downloadUrl: `/api/download/${outputFilename}`,
      },
    });
  } catch (error) {
    console.error("Conversion error:", error);

    // Clean up files on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: "Error converting image",
      error: error.message,
    });
  }
};

module.exports = {
  convertImage,
};
