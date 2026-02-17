const {
  extractImagesFromPDF,
  createPDFFromImages,
} = require("../utils/pdfProcessor");
const {
  uploadImage,
  scheduleAutoDeletion,
} = require("../utils/cloudinaryHelper");
const archiver = require("archiver");

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

const createZipFromFiles = async (files) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    const zip = archiver("zip", { zlib: { level: 9 } });

    zip.on("warning", (err) => {
      if (err.code === "ENOENT") return;
      reject(err);
    });
    zip.on("error", reject);
    zip.on("data", (chunk) => chunks.push(chunk));
    zip.on("end", () => resolve(Buffer.concat(chunks)));

    for (const file of files) {
      zip.append(file.buffer, { name: file.name });
    }
    zip.finalize();
  });

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

    // Extract rendered page images from PDF
    const pdfData = await extractImagesFromPDF(req.file.buffer);
    const zipBuffer = await createZipFromFiles(pdfData.images);

    const sourceBaseName = req.file.originalname
      ? req.file.originalname.replace(/\.pdf$/i, "")
      : "extracted-images";
    const zipUpload = await uploadImage(zipBuffer, {
      originalName: `${sourceBaseName}-images.zip`,
      format: "zip",
      resource_type: "raw",
    });

    const deleteAfterHours =
      parseInt(process.env.CLOUDINARY_AUTO_DELETE_HOURS, 10) || 24;
    scheduleAutoDeletion(zipUpload.public_id, deleteAfterHours);

    res.json({
      success: true,
      message: "PDF images extracted successfully",
      data: {
        pageCount: pdfData.pageCount,
        imageCount: pdfData.imageCount,
        images: pdfData.images.map((img) => ({
          name: img.name,
          size: `${(img.sizeBytes / 1024).toFixed(2)} KB`,
          mimeType: img.mimeType,
          url: null,
        })),
        filename: zipUpload.public_id,
        cloudinaryUrl: zipUpload.secure_url,
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
};
