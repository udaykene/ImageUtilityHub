const {
  resizeImage,
  uploadImage,
  scheduleAutoDeletion,
} = require("../utils/cloudinaryHelper");

/**
 * Resize image endpoint
 */
const resize = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    const {
      width,
      height,
      fit = "contain",
      maintainAspectRatio = "true",
      outputFormat,
      quality,
    } = req.body;

    if (!width && !height) {
      return res.status(400).json({
        success: false,
        message: "At least one dimension (width or height) is required",
      });
    }

    console.log(`Resizing image to ${width}x${height}, fit: ${fit}`);

    // Resize the image
    const resized = await resizeImage(req.file.buffer, {
      width,
      height,
      fit,
      maintainAspectRatio: maintainAspectRatio === "true",
    });

    // Upload to Cloudinary
    const uploadResult = await uploadImage(resized.buffer, {
      originalName: req.file.originalname,
      format: outputFormat || resized.format,
      quality: quality ? parseInt(quality) : "auto:best",
    });

    // Schedule auto-deletion
    const deleteAfterHours =
      parseInt(process.env.CLOUDINARY_AUTO_DELETE_HOURS) || 24;
    scheduleAutoDeletion(uploadResult.public_id, deleteAfterHours);

    res.json({
      success: true,
      message: "Image resized successfully",
      data: {
        filename: uploadResult.public_id,
        cloudinaryUrl: uploadResult.secure_url,
        width: resized.width,
        height: resized.height,
        size: resized.size,
        format: resized.format,
        expiresIn: `${deleteAfterHours} hours`,
      },
    });
  } catch (error) {
    console.error("Resize error:", error);
    next(error);
  }
};

module.exports = { resize };
