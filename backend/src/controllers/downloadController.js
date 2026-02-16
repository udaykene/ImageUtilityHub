const cloudinary = require("../config/cloudinary");
const axios = require("axios");
const path = require("path");

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
    const baseName = path.parse(filename).name || "download";
    const contentType = response.headers["content-type"] || "";
    const contentTypeToExt = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
      "image/tiff": "tiff",
      "image/avif": "avif",
      "application/pdf": "pdf",
      "application/zip": "zip",
    };
    const fileExtension =
      path.parse(filename).ext.replace(".", "") ||
      contentTypeToExt[contentType] ||
      "bin";
    const downloadFilename = `${baseName}.${fileExtension}`;

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
