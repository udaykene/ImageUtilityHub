const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const { PDFDocument } = require("pdf-lib");
const pdfParse = require("pdf-parse");
const {
  generateUniqueFilename,
  formatFileSize,
  ensureDirectoryExists,
} = require("../utils/fileUtils");

const outputsDir = path.join(__dirname, "../../outputs");
ensureDirectoryExists(outputsDir);

/**
 * Extract images from PDF
 */
const extractImagesFromPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No PDF file uploaded" });
    }

    if (req.file.mimetype !== "application/pdf") {
      return res
        .status(400)
        .json({ success: false, message: "File must be a PDF" });
    }

    const inputPath = req.file.path;
    const dataBuffer = fs.readFileSync(inputPath);

    // Parse PDF
    const pdfData = await pdfParse(dataBuffer);
    const pdfDoc = await PDFDocument.load(dataBuffer);

    const pages = pdfDoc.getPages();
    const extractedImages = [];

    // Note: pdf-parse doesn't directly extract images, we need a different approach
    // For now, we'll use a placeholder response
    // In production, you might want to use pdf2pic or similar library

    // Clean up input file
    fs.unlinkSync(inputPath);

    res.json({
      success: true,
      message: "PDF processed (image extraction requires additional setup)",
      data: {
        pageCount: pages.length,
        extractedImages: extractedImages,
        note: "Full image extraction requires pdf2pic or similar library",
      },
    });
  } catch (error) {
    console.error("PDF extraction error:", error);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: "Error extracting images from PDF",
      error: error.message,
    });
  }
};

/**
 * Create PDF from multiple images
 */
const createPDFFromImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No images uploaded" });
    }

    const {
      pageSize = "a4",
      orientation = "portrait",
      margin = "none",
      quality = 90,
    } = req.body;

    // Page size dimensions in points (1 point = 1/72 inch)
    const pageSizes = {
      a4: { width: 595, height: 842 },
      letter: { width: 612, height: 792 },
      legal: { width: 612, height: 1008 },
    };

    const size = pageSizes[pageSize] || pageSizes.a4;
    const pageWidth = orientation === "landscape" ? size.height : size.width;
    const pageHeight = orientation === "landscape" ? size.width : size.height;

    // Margin values in points
    const margins = {
      none: 0,
      small: 36, // 0.5 inch
      medium: 72, // 1 inch
      large: 108, // 1.5 inches
    };

    const marginValue = margins[margin] || 0;
    const contentWidth = pageWidth - 2 * marginValue;
    const contentHeight = pageHeight - 2 * marginValue;

    // Create PDF
    const pdfDoc = await PDFDocument.create();

    for (const file of req.files) {
      try {
        // Read and process image
        const imageBuffer = fs.readFileSync(file.path);
        const metadata = await sharp(imageBuffer).metadata();

        // Determine image type and embed
        let image;
        const ext = path.extname(file.originalname).toLowerCase();

        if (ext === ".png" || metadata.format === "png") {
          image = await pdfDoc.embedPng(imageBuffer);
        } else {
          // Convert to JPEG if not PNG or JPEG
          const jpegBuffer = await sharp(imageBuffer)
            .jpeg({ quality: parseInt(quality) })
            .toBuffer();
          image = await pdfDoc.embedJpg(jpegBuffer);
        }

        // Add page
        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        // Calculate scaling to fit within content area
        const imgWidth = image.width;
        const imgHeight = image.height;
        const scale = Math.min(
          contentWidth / imgWidth,
          contentHeight / imgHeight
        );

        const scaledWidth = imgWidth * scale;
        const scaledHeight = imgHeight * scale;

        // Center image on page
        const x = marginValue + (contentWidth - scaledWidth) / 2;
        const y = marginValue + (contentHeight - scaledHeight) / 2;

        page.drawImage(image, {
          x: x,
          y: y,
          width: scaledWidth,
          height: scaledHeight,
        });

        // Clean up uploaded file
        fs.unlinkSync(file.path);
      } catch (error) {
        console.error(`Error processing image ${file.originalname}:`, error);
        // Continue with other images
      }
    }

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    const outputFilename = generateUniqueFilename("output.pdf", ".pdf");
    const outputPath = path.join(outputsDir, outputFilename);

    fs.writeFileSync(outputPath, pdfBytes);

    const stats = fs.statSync(outputPath);

    res.json({
      success: true,
      message: "PDF created successfully",
      data: {
        filename: outputFilename,
        pageCount: req.files.length,
        fileSize: formatFileSize(stats.size),
        downloadUrl: `/api/download/${outputFilename}`,
        settings: {
          pageSize,
          orientation,
          margin,
        },
      },
    });
  } catch (error) {
    console.error("PDF creation error:", error);

    // Clean up uploaded files on error
    if (req.files) {
      req.files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating PDF",
      error: error.message,
    });
  }
};

module.exports = {
  extractImagesFromPDF,
  createPDFFromImages,
};
