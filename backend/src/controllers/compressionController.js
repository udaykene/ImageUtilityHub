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
      targetPercentage = 50, // Target size as percentage of original (50 = reduce to 50% of original)
      outputFormat = "original",
      stripMetadata = true,
    } = req.body;

    const inputPath = req.file.path;
    const originalSize = req.file.size;

    console.log("--- Compression Parameters ---");
    console.log("Target percentage:", targetPercentage);
    console.log("Original size:", originalSize, "bytes");
    console.log("Output format:", outputFormat);
    console.log("Strip metadata:", stripMetadata);

    // Determine output format
    let format =
      outputFormat === "original"
        ? path.extname(req.file.originalname).substring(1).toLowerCase()
        : outputFormat;

    // Handle jpg/jpeg
    if (format === "jpg") format = "jpeg";

    const outputFilename = generateUniqueFilename(
      outputsDir,
      req.file.originalname,
      `.${format}`
    );
    const outputPath = path.join(outputsDir, outputFilename);

    // Calculate target file size in bytes
    const targetSizeBytes = Math.floor((originalSize * targetPercentage) / 100);
    console.log("Target size:", targetSizeBytes, "bytes");

    // Binary search for the right quality level
    let minQuality = 1;
    let maxQuality = 100;
    let bestQuality = 80;
    let bestSize = 0;
    let attempts = 0;
    const maxAttempts = 10;
    const tolerance = 0.05; // 5% tolerance

    while (attempts < maxAttempts && minQuality <= maxQuality) {
      const currentQuality = Math.floor((minQuality + maxQuality) / 2);
      console.log(
        `\nAttempt ${attempts + 1}: Testing quality ${currentQuality}`
      );

      // Create temporary output path
      const tempPath = outputPath + `.temp${attempts}`;

      try {
        let image = sharp(inputPath);

        // Strip metadata if requested
        if (stripMetadata) {
          image = image.rotate();
        }

        // Apply format-specific compression
        switch (format) {
          case "jpeg":
            image = image.jpeg({ quality: currentQuality, mozjpeg: true });
            break;
          case "png":
            if (currentQuality < 100) {
              image = image.png({ quality: currentQuality, palette: true });
            } else {
              image = image.png({ compressionLevel: 9 });
            }
            break;
          case "webp":
            image = image.webp({ quality: currentQuality });
            break;
          case "avif":
            image = image.avif({ quality: currentQuality });
            break;
          default:
            image = image.jpeg({ quality: currentQuality });
        }

        await image.toFile(tempPath);

        // Check file size
        const stats = fs.statSync(tempPath);
        const currentSize = stats.size;
        const percentageOfOriginal = (currentSize / originalSize) * 100;

        console.log(
          `Result: ${currentSize} bytes (${percentageOfOriginal.toFixed(1)}% of original)`
        );

        // Check if we're within tolerance
        const difference = Math.abs(currentSize - targetSizeBytes);
        const toleranceBytes = targetSizeBytes * tolerance;

        if (difference <= toleranceBytes) {
          // Perfect! Use this one
          console.log("✓ Found optimal quality:", currentQuality);
          fs.renameSync(tempPath, outputPath);
          bestQuality = currentQuality;
          bestSize = currentSize;
          break;
        }

        // Update best result
        if (
          bestSize === 0 ||
          Math.abs(currentSize - targetSizeBytes) <
            Math.abs(bestSize - targetSizeBytes)
        ) {
          if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
          }
          fs.renameSync(tempPath, outputPath);
          bestQuality = currentQuality;
          bestSize = currentSize;
        } else {
          fs.unlinkSync(tempPath);
        }

        // Adjust search range
        if (currentSize > targetSizeBytes) {
          // File too large, need more compression (lower quality)
          maxQuality = currentQuality - 1;
        } else {
          // File too small, need less compression (higher quality)
          minQuality = currentQuality + 1;
        }
      } catch (err) {
        console.error("Error during compression attempt:", err);
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      }

      attempts++;
    }

    // Get final output file stats
    const stats = fs.statSync(outputPath);
    const compressedSize = stats.size;
    const savings = ((1 - compressedSize / originalSize) * 100).toFixed(2);

    // Clean up input file
    fs.unlinkSync(inputPath);

    console.log("\n=== Compression Complete ===");
    console.log("Final quality used:", bestQuality);
    console.log("Final size:", compressedSize, "bytes");
    console.log("Savings:", savings + "%");

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
        qualityUsed: bestQuality,
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
