const { PDFDocument } = require("pdf-lib");
const pdfParse = require("pdf-parse");
const sharp = require("sharp");

/**
 * Extract images from PDF
 */
const extractImagesFromPDF = async (buffer) => {
  try {
    const pdfDoc = await PDFDocument.load(buffer);
    const pages = pdfDoc.getPages();
    const images = [];

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];

      // This is a simplified extraction
      // For production, you might need a more robust PDF parsing library
      console.log(`Processing page ${i + 1} of ${pages.length}`);
    }

    // Use pdf-parse to extract raw data
    const data = await pdfParse(buffer);

    return {
      pageCount: pages.length,
      text: data.text,
      info: data.info,
      metadata: data.metadata,
    };
  } catch (error) {
    console.error("Error extracting images from PDF:", error);
    throw new Error("Failed to extract images from PDF");
  }
};

/**
 * Create PDF from images
 */
const createPDFFromImages = async (imageBuffers, options = {}) => {
  try {
    const { pageSize = "A4", orientation = "portrait", margin = 50 } = options;

    // Page size dimensions in points (1 point = 1/72 inch)
    const pageSizes = {
      A4: orientation === "portrait" ? [595, 842] : [842, 595],
      Letter: orientation === "portrait" ? [612, 792] : [792, 612],
      Legal: orientation === "portrait" ? [612, 1008] : [1008, 612],
    };

    const [pageWidth, pageHeight] = pageSizes[pageSize] || pageSizes["A4"];

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();

    for (const imageBuffer of imageBuffers) {
      // Get image metadata
      const metadata = await sharp(imageBuffer).metadata();

      // Embed image in PDF
      let image;
      if (metadata.format === "png") {
        image = await pdfDoc.embedPng(imageBuffer);
      } else {
        // Convert to JPEG if not PNG
        const jpegBuffer = await sharp(imageBuffer).jpeg().toBuffer();
        image = await pdfDoc.embedJpg(jpegBuffer);
      }

      // Calculate dimensions to fit within page with margins
      const availableWidth = pageWidth - margin * 2;
      const availableHeight = pageHeight - margin * 2;

      const imageAspectRatio = image.width / image.height;
      const availableAspectRatio = availableWidth / availableHeight;

      let scaledWidth, scaledHeight;

      if (imageAspectRatio > availableAspectRatio) {
        // Image is wider - fit to width
        scaledWidth = availableWidth;
        scaledHeight = availableWidth / imageAspectRatio;
      } else {
        // Image is taller - fit to height
        scaledHeight = availableHeight;
        scaledWidth = availableHeight * imageAspectRatio;
      }

      // Add a new page
      const page = pdfDoc.addPage([pageWidth, pageHeight]);

      // Center the image
      const x = (pageWidth - scaledWidth) / 2;
      const y = (pageHeight - scaledHeight) / 2;

      // Draw the image
      page.drawImage(image, {
        x: x,
        y: y,
        width: scaledWidth,
        height: scaledHeight,
      });
    }

    // Serialize the PDF to bytes
    const pdfBytes = await pdfDoc.save();

    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error("Error creating PDF from images:", error);
    throw new Error("Failed to create PDF from images");
  }
};

module.exports = {
  extractImagesFromPDF,
  createPDFFromImages,
};
