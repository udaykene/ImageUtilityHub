const {
  compressImage,
  uploadImage,
  scheduleAutoDeletion,
} = require("../utils/cloudinaryHelper");

/**
 * Compress image endpoint
 */
const compress = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    const { targetPercentage, targetSize, outputFormat, stripMetadata } =
      req.body;

    // targetPercentage is the quality slider value (10-95)
    const quality = parseInt(targetPercentage) || 80;
    const targetSizeKB = targetSize ? parseFloat(targetSize) : null;

    console.log(
      `Compressing image - Quality: ${quality}%, Target size: ${targetSizeKB || "auto"} KB`
    );

    // Compress the image
    const compressed = await compressImage(
      req.file.buffer,
      quality,
      targetSizeKB
    );

    // Upload to Cloudinary
    const uploadResult = await uploadImage(compressed.buffer, {
      format:
        outputFormat && outputFormat !== "original"
          ? outputFormat
          : compressed.format,
      quality: "auto:best",
    });

    // Schedule auto-deletion (24 hours from .env)
    const deleteAfterHours =
      parseInt(process.env.CLOUDINARY_AUTO_DELETE_HOURS) || 24;
    scheduleAutoDeletion(uploadResult.public_id, deleteAfterHours);

    res.json({
      success: true,
      message: "Image compressed successfully",
      data: {
        filename: uploadResult.public_id,
        cloudinaryUrl: uploadResult.secure_url,
        originalSize: compressed.originalSize,
        compressedSize: compressed.compressedSize,
        savings: compressed.savings,
        quality: compressed.quality,
        format: compressed.format,
        width: uploadResult.width,
        height: uploadResult.height,
        expiresIn: `${deleteAfterHours} hours`,
      },
    });
  } catch (error) {
    console.error("Compression error:", error);
    next(error);
  }
};

module.exports = { compress };
