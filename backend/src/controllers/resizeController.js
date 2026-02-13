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
 * Resize image with various options
 */
const resizeImage = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const {
      width,
      height,
      fit = "cover",
      maintainAspectRatio = true,
      outputFormat = "original",
      quality = 90,
    } = req.body;

    if (!width && !height) {
      return res.status(400).json({
        success: false,
        message: "At least width or height is required",
      });
    }

    const inputPath = req.file.path;
    const originalSize = req.file.size;

    // Get original dimensions
    const metadata = await sharp(inputPath).metadata();
    const originalWidth = metadata.width;
    const originalHeight = metadata.height;

    // Determine output format
    let format =
      outputFormat === "original"
        ? path.extname(req.file.originalname).substring(1).toLowerCase()
        : outputFormat;

    if (format === "jpg") format = "jpeg";

    const outputFilename = generateUniqueFilename(
      outputsDir,
      req.file.originalname,
      `.${format}`
    );
    const outputPath = path.join(outputsDir, outputFilename);

    // Parse dimensions
    const targetWidth = width ? parseInt(width) : null;
    const targetHeight = height ? parseInt(height) : null;

    let image = sharp(inputPath);

    // Resize options
    const resizeOptions = {
      width: targetWidth,
      height: targetHeight,
      fit: fit, // cover, contain, fill, inside, outside
      withoutEnlargement: false,
    };

    if (!maintainAspectRatio) {
      resizeOptions.fit = "fill";
    }

    image = image.resize(resizeOptions);

    // Apply format
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

    // Get output file stats and dimensions
    const outputMetadata = await sharp(outputPath).metadata();
    const stats = fs.statSync(outputPath);
    const resizedSize = stats.size;

    // Clean up input file
    fs.unlinkSync(inputPath);

    res.json({
      success: true,
      message: "Image resized successfully",
      data: {
        filename: outputFilename,
        originalDimensions: `${originalWidth}x${originalHeight}`,
        newDimensions: `${outputMetadata.width}x${outputMetadata.height}`,
        originalSize: formatFileSize(originalSize),
        resizedSize: formatFileSize(resizedSize),
        downloadUrl: `/api/download/${outputFilename}`,
        format: format,
      },
    });
  } catch (error) {
    console.error("Resize error:", error);

    // Clean up files on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: "Error resizing image",
      error: error.message,
    });
  }
};

module.exports = {
  resizeImage,
};
