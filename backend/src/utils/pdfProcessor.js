const { PDFDocument } = require("pdf-lib");
const sharp = require("sharp");
const { createCanvas } = require("@napi-rs/canvas");

const normalizePageSize = (pageSize = "A4") => {
  const value = String(pageSize).trim().toLowerCase();
  const map = {
    a4: "A4",
    letter: "Letter",
    legal: "Legal",
    auto: "Auto",
  };
  return map[value] || "A4";
};

const normalizeOrientation = (orientation = "portrait") => {
  const value = String(orientation).trim().toLowerCase();
  return value === "landscape" ? "landscape" : "portrait";
};

/**
 * Extract images from PDF
 */
const extractImagesFromPDF = async (buffer) => {
  try {
    const pdfDoc = await PDFDocument.load(buffer);
    const info = {
      title: pdfDoc.getTitle() || null,
      author: pdfDoc.getAuthor() || null,
      subject: pdfDoc.getSubject() || null,
      keywords: pdfDoc.getKeywords() || null,
      creator: pdfDoc.getCreator() || null,
      producer: pdfDoc.getProducer() || null,
      creationDate: pdfDoc.getCreationDate() || null,
      modificationDate: pdfDoc.getModificationDate() || null,
    };

    // Render each PDF page to PNG so extraction returns usable image files.
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(buffer),
      disableWorker: true,
    });
    const pdf = await loadingTask.promise;
    const images = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = createCanvas(
        Math.max(1, Math.ceil(viewport.width)),
        Math.max(1, Math.ceil(viewport.height))
      );
      const context = canvas.getContext("2d");
      await page.render({ canvasContext: context, viewport }).promise;

      const imageBuffer = canvas.toBuffer("image/png");
      images.push({
        name: `page-${pageNum}.png`,
        mimeType: "image/png",
        sizeBytes: imageBuffer.length,
        buffer: imageBuffer,
      });
    }

    return {
      pageCount: pdf.numPages,
      imageCount: images.length,
      images,
      info,
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
    const pageSize = normalizePageSize(options.pageSize || "A4");
    const orientation = normalizeOrientation(options.orientation || "portrait");
    const parsedMargin = Number(options.margin);
    const margin = Number.isFinite(parsedMargin) && parsedMargin >= 0 ? parsedMargin : 50;

    // Page size dimensions in points (1 point = 1/72 inch)
    const pageSizes = {
      A4: orientation === "portrait" ? [595, 842] : [842, 595],
      Letter: orientation === "portrait" ? [612, 792] : [792, 612],
      Legal: orientation === "portrait" ? [612, 1008] : [1008, 612],
    };

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();

    for (const imageBuffer of imageBuffers) {
      // Get image metadata
      const metadata = await sharp(imageBuffer).metadata();
      const sourceWidth = metadata.width || 1;
      const sourceHeight = metadata.height || 1;

      // Embed image in PDF
      let image;
      if (metadata.format === "png") {
        image = await pdfDoc.embedPng(imageBuffer);
      } else {
        // Convert to JPEG if not PNG
        const jpegBuffer = await sharp(imageBuffer).jpeg().toBuffer();
        image = await pdfDoc.embedJpg(jpegBuffer);
      }

      let pageWidth;
      let pageHeight;
      if (pageSize === "Auto") {
        pageWidth = sourceWidth + margin * 2;
        pageHeight = sourceHeight + margin * 2;
      } else {
        [pageWidth, pageHeight] = pageSizes[pageSize] || pageSizes["A4"];
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
