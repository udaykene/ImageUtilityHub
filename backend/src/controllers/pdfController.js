const {
  extractImagesFromPDF,
  createPDFFromImages,
} = require("../utils/pdfProcessor");
const {
  uploadImage,
  scheduleAutoDeletion,
} = require("../utils/cloudinaryHelper");
const archiver = require("archiver");
const cloudinary = require("../config/cloudinary");
const axios = require("axios");
const path = require("path");

const parseMarginToPoints = (marginInput) => {
  if (marginInput === undefined || marginInput === null) return 50;
  const value = String(marginInput).trim().toLowerCase();
  const presets = {
    none: 0,
    small: 36,
    medium: 50,
    large: 72,
  };

  if (Object.prototype.hasOwnProperty.call(presets, value)) {
    return presets[value];
  }

  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed >= 0) return parsed;
  return 50;
};

const normalizePageSize = (pageSizeInput) => {
  const value = String(pageSizeInput || "A4").trim().toLowerCase();
  const map = {
    a4: "A4",
    letter: "Letter",
    legal: "Legal",
    auto: "Auto",
  };
  return map[value] || "A4";
};

const normalizeOrientation = (orientationInput) => {
  const value = String(orientationInput || "portrait").trim().toLowerCase();
  return value === "landscape" ? "landscape" : "portrait";
};

const sanitizeFilename = (name = "", fallback = "image") => {
  const base = path.parse(String(name || "")).name || fallback;
  const ext = path.parse(String(name || "")).ext || "";
  return (
    `${base}${ext}`
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
      .replace(/\s+/g, "_")
      .substring(0, 180) || fallback
  );
};

/**
 * Extract images from PDF endpoint
 */
const extract = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No PDF file provided",
      });
    }

    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({
        success: false,
        message: "File must be a PDF",
      });
    }

    console.log("Extracting images from PDF...");

    // Extract embedded images from PDF
    const pdfData = await extractImagesFromPDF(req.file.buffer);
    const deleteAfterHours =
      parseInt(process.env.CLOUDINARY_AUTO_DELETE_HOURS, 10) || 24;

    const sourceBaseName = req.file.originalname
      ? req.file.originalname.replace(/\.pdf$/i, "")
      : "extracted-images";

    const uploadedImages = [];
    const concurrency = 4;
    let cursor = 0;

    const worker = async () => {
      while (cursor < pdfData.images.length) {
        const index = cursor++;
        const image = pdfData.images[index];
        const extension =
          image.mimeType === "image/jpeg"
            ? "jpg"
            : image.mimeType === "image/webp"
              ? "webp"
              : image.mimeType === "image/gif"
                ? "gif"
                : image.mimeType === "image/tiff"
                  ? "tiff"
                  : image.mimeType === "image/avif"
                    ? "avif"
                    : "png";

        const uploadResult = await uploadImage(image.buffer, {
          originalName: `${sourceBaseName}-image-${index + 1}.${extension}`,
          resource_type: "image",
          format: extension,
        });
        scheduleAutoDeletion(uploadResult.public_id, deleteAfterHours);

        uploadedImages[index] = {
          id: uploadResult.public_id,
          publicId: uploadResult.public_id,
          name: image.name,
          size: `${(image.sizeBytes / 1024).toFixed(2)} KB`,
          mimeType: image.mimeType,
          width: image.width || uploadResult.width || null,
          height: image.height || uploadResult.height || null,
          sourcePage: image.sourcePage || null,
          resourceType: uploadResult.resource_type || "image",
          format: uploadResult.format || extension,
          cloudinaryUrl: uploadResult.secure_url,
        };
      }
    };

    await Promise.all(
      Array.from({ length: Math.min(concurrency, pdfData.images.length || 1) }, () =>
        worker()
      )
    );

    res.json({
      success: true,
      message:
        uploadedImages.length > 0
          ? "PDF images extracted successfully"
          : "No embedded images found in this PDF",
      data: {
        pageCount: pdfData.pageCount,
        imageCount: uploadedImages.length,
        images: uploadedImages,
        expiresIn: `${deleteAfterHours} hours`,
        info: pdfData.info,
      },
    });
  } catch (error) {
    console.error("PDF extraction error:", error);
    next(error);
  }
};

/**
 * Download selected extracted images as ZIP
 */
const downloadExtractedSelection = async (req, res, next) => {
  try {
    const { images, zipName } = req.body || {};
    const selected = Array.isArray(images) ? images : [];

    if (!selected.length) {
      return res.status(400).json({
        success: false,
        message: "No images selected for ZIP download",
      });
    }

    const archiveName = sanitizeFilename(zipName || "extracted-images.zip");
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${archiveName.endsWith(".zip") ? archiveName : `${archiveName}.zip`}"`
    );

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.on("error", (err) => next(err));
    archive.pipe(res);

    for (let i = 0; i < selected.length; i++) {
      const item = selected[i] || {};
      const publicId = String(item.publicId || "").trim();
      if (!publicId) continue;

      const format = String(item.format || "png").replace(/^\./, "");
      const resourceType = String(item.resourceType || "image");
      const fallbackName = `image-${i + 1}.${format}`;
      const entryName = sanitizeFilename(item.name || fallbackName, fallbackName);

      const signedUrl = cloudinary.url(publicId, {
        resource_type: resourceType,
        type: "upload",
        format,
        secure: true,
        sign_url: true,
      });

      const fileResponse = await axios({
        method: "GET",
        url: signedUrl,
        responseType: "arraybuffer",
        timeout: 30000,
      });

      archive.append(Buffer.from(fileResponse.data), { name: entryName });
    }

    await archive.finalize();
  } catch (error) {
    console.error("Selected ZIP download error:", error);
    next(error);
  }
};

/**
 * Create PDF from images endpoint
 */
const imagesToPDF = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No images provided",
      });
    }

    const { pageSize = "A4", orientation = "portrait", margin = 50 } = req.body;

    console.log(`Creating PDF from ${req.files.length} images...`);

    // Get image buffers
    const imageBuffers = req.files.map((file) => file.buffer);

    // Create PDF
    const pdfBuffer = await createPDFFromImages(imageBuffers, {
      pageSize: normalizePageSize(pageSize),
      orientation: normalizeOrientation(orientation),
      margin: parseMarginToPoints(margin),
    });

    // Upload PDF to Cloudinary
    const uploadResult = await uploadImage(pdfBuffer, {
      originalName:
        req.files.length === 1
          ? req.files[0].originalname
          : "images-to-pdf.pdf",
      format: "pdf",
      resource_type: "raw",
    });

    // Schedule auto-deletion
    const deleteAfterHours =
      parseInt(process.env.CLOUDINARY_AUTO_DELETE_HOURS) || 24;
    scheduleAutoDeletion(uploadResult.public_id, deleteAfterHours);

    res.json({
      success: true,
      message: "PDF created successfully",
      data: {
        filename: uploadResult.public_id,
        cloudinaryUrl: uploadResult.secure_url,
        imageCount: req.files.length,
        pageSize,
        orientation,
        size: (pdfBuffer.length / 1024).toFixed(2) + " KB",
        expiresIn: `${deleteAfterHours} hours`,
      },
    });
  } catch (error) {
    console.error("PDF creation error:", error);
    next(error);
  }
};

module.exports = {
  extract,
  imagesToPDF,
  downloadExtractedSelection,
};
