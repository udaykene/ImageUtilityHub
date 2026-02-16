const cloudinary = require("../config/cloudinary");
const axios = require("axios");

/**
 * Download file from Cloudinary
 */
const download = async (req, res, next) => {
  try {
    const { filename } = req.params;

    if (!filename) {
      return res.status(400).json({
        success: false,
        message: "Filename is required",
      });
    }

    // Generate Cloudinary URL
    const cloudinaryUrl = cloudinary.url(filename, {
      secure: true,
      resource_type: "auto",
    });

    // Fetch the file from Cloudinary
    const response = await axios({
      method: "GET",
      url: cloudinaryUrl,
      responseType: "stream",
    });

    // Set headers for download
    const fileExtension = filename.split(".").pop() || "jpg";
    const downloadFilename = `processed-${Date.now()}.${fileExtension}`;

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${downloadFilename}"`
    );
    res.setHeader("Content-Type", response.headers["content-type"]);

    // Pipe the stream to response
    response.data.pipe(res);
  } catch (error) {
    console.error("Download error:", error);

    if (error.response && error.response.status === 404) {
      return res.status(404).json({
        success: false,
        message: "File not found or has been deleted",
      });
    }

    next(error);
  }
};

module.exports = { download };
