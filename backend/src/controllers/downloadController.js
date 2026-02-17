const cloudinary = require("../config/cloudinary");
const axios = require("axios");
const path = require("path");

const parseCloudinaryDeliveryUrl = (cloudinaryUrl) => {
  try {
    const parsed = new URL(cloudinaryUrl);
    if (parsed.hostname !== "res.cloudinary.com") return null;

    const pathname = parsed.pathname || "";
    const match = pathname.match(
      /\/(image|video|raw)\/upload\/(?:[^/]+\/)*v(\d+)\/(.+)$/
    );

    if (!match) return null;

    const resourceType = match[1];
    const version = Number(match[2]);
    const publicIdWithExt = decodeURIComponent(match[3]);
    const ext = path.extname(publicIdWithExt).replace(".", "");
    const publicId = ext
      ? publicIdWithExt.slice(0, -(ext.length + 1))
      : publicIdWithExt;

    return {
      resourceType,
      version,
      publicId,
      ext,
      basename: path.basename(publicIdWithExt),
    };
  } catch {
    return null;
  }
};

/**
 * Download file from Cloudinary
 */
const download = async (req, res, next) => {
  try {
    const { filename } = req.params;
    const { cloudinaryUrl } = req.query;

    let requestUrl;
    let downloadName = "download";

    if (cloudinaryUrl) {
      const parsed = parseCloudinaryDeliveryUrl(cloudinaryUrl);
      if (!parsed || !parsed.ext) {
        return res.status(400).json({
          success: false,
          message: "Invalid cloudinaryUrl for download",
        });
      }

      downloadName = parsed.basename || "download";

      // Preferred path for restricted raw/pdf/zip delivery: signed asset URL.
      requestUrl = cloudinary.url(parsed.publicId, {
        resource_type: parsed.resourceType,
        type: "upload",
        format: parsed.ext,
        version: parsed.version,
        secure: true,
        sign_url: true,
        attachment: downloadName,
      });
    } else if (filename) {
      // Legacy route support: /download/:filename
      const extFromFilename = path.extname(filename).replace(".", "");
      if (extFromFilename) {
        const publicId = filename.slice(0, -(extFromFilename.length + 1));
        const expiresAt = Math.floor(Date.now() / 1000) + 5 * 60;
        requestUrl = cloudinary.utils.private_download_url(
          publicId,
          extFromFilename,
          {
            resource_type: "auto",
            type: "upload",
            attachment: true,
            expires_at: expiresAt,
            secure: true,
          }
        );
      } else {
        requestUrl = cloudinary.url(filename, {
          secure: true,
          resource_type: "auto",
        });
      }
      downloadName = path.basename(filename) || "download";
    }

    if (!requestUrl) {
      return res.status(400).json({
        success: false,
        message: "Filename or cloudinaryUrl is required",
      });
    }

    // Fetch the file from Cloudinary
    let response;
    try {
      response = await axios({
        method: "GET",
        url: requestUrl,
        responseType: "stream",
        timeout: 30000,
      });
    } catch (signedUrlError) {
      // Fallback for legacy behavior and any edge cases where signed delivery fails.
      if (cloudinaryUrl) {
        const parsed = parseCloudinaryDeliveryUrl(cloudinaryUrl);
        const expiresAt = Math.floor(Date.now() / 1000) + 5 * 60;
        const privateDownloadUrl = cloudinary.utils.private_download_url(
          parsed.publicId,
          parsed.ext,
          {
            resource_type: parsed.resourceType,
            type: "upload",
            attachment: downloadName,
            expires_at: expiresAt,
            secure: true,
          }
        );

        response = await axios({
          method: "GET",
          url: privateDownloadUrl,
          responseType: "stream",
          timeout: 30000,
        });
      } else {
        throw signedUrlError;
      }
    }

    // Set headers for download
    const baseName = path.parse(downloadName).name || "download";
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
      path.parse(downloadName).ext.replace(".", "") ||
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
    console.error("Download error:", error.message);
    if (error.response) {
      console.error("Download error status:", error.response.status);
      console.error("Download error data:", error.response.data);
    }

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
