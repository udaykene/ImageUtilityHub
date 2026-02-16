const {
  convertImageFormat,
  uploadImage,
  scheduleAutoDeletion,
} = require("../utils/cloudinaryHelper");

/**
 * Convert image format endpoint
 */
const convert = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    const { outputFormat, quality } = req.body;

    if (!outputFormat) {
      return res.status(400).json({
        success: false,
        message: "Output format is required",
      });
    }

    console.log(`Converting image to ${outputFormat}`);

    // Convert the image format
    const converted = await convertImageFormat(req.file.buffer, outputFormat);

    // Upload to Cloudinary
    const uploadResult = await uploadImage(converted.buffer, {
      format: converted.format,
      quality: quality ? parseInt(quality) : "auto:best",
    });

    // Schedule auto-deletion
    const deleteAfterHours =
      parseInt(process.env.CLOUDINARY_AUTO_DELETE_HOURS) || 24;
    scheduleAutoDeletion(uploadResult.public_id, deleteAfterHours);

    res.json({
      success: true,
      message: "Image converted successfully",
      data: {
        filename: uploadResult.public_id,
        cloudinaryUrl: uploadResult.secure_url,
        format: converted.format,
        size: converted.size,
        width: uploadResult.width,
        height: uploadResult.height,
        expiresIn: `${deleteAfterHours} hours`,
      },
    });
  } catch (error) {
    console.error("Conversion error:", error);
    next(error);
  }
};

module.exports = { convert };
