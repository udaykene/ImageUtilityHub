const {
  extractImagesFromPDF,
  createPDFFromImages,
} = require("../utils/pdfProcessor");
const {
  uploadImage,
  scheduleAutoDeletion,
} = require("../utils/cloudinaryHelper");

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

    // Extract images from PDF
    const pdfData = await extractImagesFromPDF(req.file.buffer);

    // Note: Full image extraction from PDF is complex
    // This returns PDF metadata for now
    // For production, you'd need a more robust solution

    res.json({
      success: true,
      message: "PDF processed successfully",
      data: {
        pageCount: pdfData.pageCount,
        info: pdfData.info,
        note: "Full image extraction requires additional PDF parsing libraries",
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

    const {
      pageSize = "A4",
      orientation = "portrait",
      margin = "50",
      quality = "90",
    } = req.body;

    console.log(`Creating PDF from ${req.files.length} images...`);

    // Get image buffers
    const imageBuffers = req.files.map((file) => file.buffer);

    // Create PDF
    const pdfBuffer = await createPDFFromImages(imageBuffers, {
      pageSize,
      orientation,
      margin: parseInt(margin),
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
