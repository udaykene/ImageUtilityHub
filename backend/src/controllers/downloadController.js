const cloudinary = require("../config/cloudinary");
const axios = require("axios");
const path = require("path");

const parseCloudinaryDeliveryUrl = (cloudinaryUrl) => {
  try {
    const parsed = new URL(cloudinaryUrl);
    if (parsed.hostname !== "res.cloudinary.com") return null;

    const pathname = parsed.pathname || "";
    // Match pattern: /resourceType/upload/v123.../publicId.ext
    const match = pathname.match(
      /\/(image|video|raw)\/upload\/(?:[^/]+\/)*v(\d+)\/(.+)$/
    );

    if (!match) return null;

    const resourceType = match[1];
    const version = Number(match[2]);
    const publicIdWithExt = decodeURIComponent(match[3]);
    const ext = path.extname(publicIdWithExt).replace(".", "");

    // CRITICAL: For 'raw' resources, the extension is almost always part of the public_id itself
    // and Cloudinary needs the full string (including extension) to find it.
    const publicId =
      resourceType === "raw"
        ? publicIdWithExt
        : ext
          ? publicIdWithExt.slice(0, -(ext.length + 1))
          : publicIdWithExt;

    return {
      resourceType,
      version,
      publicId,
      publicIdWithExt,
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
      if (!parsed) {
        return res.status(400).json({
          success: false,
          message: "Invalid cloudinaryUrl for download",
        });
      }

      downloadName = parsed.basename || "download";

      // Use the original delivery URL first (most reliable across raw/image URL shapes).
      requestUrl = cloudinaryUrl;
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
      // Fallback for legacy behavior and any edge cases where direct delivery fails.
      if (cloudinaryUrl) {
        const parsed = parseCloudinaryDeliveryUrl(cloudinaryUrl);
        if (parsed) {
          const attempted = [];
          const candidateSignedUrls = [];

          candidateSignedUrls.push(
            cloudinary.url(parsed.publicId, {
              resource_type: parsed.resourceType,
              type: "upload",
              version: parsed.version,
              secure: true,
              sign_url: true,
              attachment: downloadName,
              // Only add format if it's NOT already in the publicId or if it's an image/video
              ...(parsed.ext && parsed.resourceType !== "raw"
                ? { format: parsed.ext }
                : {}),
            })
          );

          // Some raw uploads store public_id including extension; try that shape too.
          candidateSignedUrls.push(
            cloudinary.url(parsed.publicIdWithExt, {
              resource_type: parsed.resourceType,
              type: "upload",
              version: parsed.version,
              secure: true,
              sign_url: true,
              attachment: downloadName,
            })
          );

          // For extensionless raw assets from images-to-pdf flow, try explicit pdf format.
          if (!parsed.ext && parsed.resourceType === "raw") {
            candidateSignedUrls.push(
              cloudinary.url(parsed.publicId, {
                resource_type: parsed.resourceType,
                type: "upload",
                version: parsed.version,
                secure: true,
                sign_url: true,
                attachment: downloadName,
                format: "pdf",
              })
            );
          }

          for (const url of candidateSignedUrls) {
            if (!url) continue;
            try {
              response = await axios({
                method: "GET",
                url,
                responseType: "stream",
                timeout: 30000,
              });
              break;
            } catch (err) {
              attempted.push(url);
            }
          }

          if (!response && parsed.ext) {
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
          }

          if (!response && !parsed.ext && parsed.resourceType === "raw") {
            const expiresAt = Math.floor(Date.now() / 1000) + 5 * 60;
            const privatePdfUrl = cloudinary.utils.private_download_url(
              parsed.publicId,
              "pdf",
              {
                resource_type: "raw",
                type: "upload",
                attachment: downloadName,
                expires_at: expiresAt,
                secure: true,
              }
            );

            response = await axios({
              method: "GET",
              url: privatePdfUrl,
              responseType: "stream",
              timeout: 30000,
            });
          }

          if (!response) {
            const fallbackError = new Error(
              `All Cloudinary download URL attempts failed for ${parsed.publicId}`
            );
            fallbackError.attemptedUrls = attempted;
            throw fallbackError;
          }
        } else {
          throw signedUrlError;
        }
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
    res.setHeader(
      "Content-Type",
      response.headers["content-type"] || "application/octet-stream"
    );

    // Pipe the stream to response
    response.data.pipe(res);
  } catch (error) {
    console.error("Download error:", error.message);
    if (req?.query?.cloudinaryUrl) {
      console.error("Download source cloudinaryUrl:", req.query.cloudinaryUrl);
    }
    if (Array.isArray(error.attemptedUrls) && error.attemptedUrls.length) {
      console.error("Download attempted signed URLs:", error.attemptedUrls);
    }
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

/**
 * Share image proxy to hide Cloudinary Domain
 */
const shareImageProxy = async (req, res, next) => {
  try {
    const { encodedPath } = req.params;
    const { dl } = req.query;

    const decodedPath = Buffer.from(encodedPath, "base64url").toString("utf8");
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

    const attachmentPath = dl === "1" ? "fl_attachment/" : "";
    const fullUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${attachmentPath}${decodedPath}`;

    const response = await axios({
      method: "GET",
      url: fullUrl,
      responseType: "stream",
      timeout: 30000,
    });

    const baseName = path.basename(decodedPath) || "download";
    if (dl === "1") {
      res.setHeader("Content-Disposition", `attachment; filename="${baseName}"`);
    } else {
      res.setHeader("Content-Disposition", `inline; filename="${baseName}"`);
    }
    res.setHeader(
      "Content-Type",
      response.headers["content-type"] || "application/octet-stream"
    );

    response.data.pipe(res);
  } catch (error) {
    console.error("share proxy error:", error.message);
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ success: false, message: "File not found" });
    }
    next(error);
  }
};

module.exports = { download, shareImageProxy };
