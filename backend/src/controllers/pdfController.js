const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const { PDFDocument, PDFName, PDFRawStream } = require("pdf-lib");
const pdfParse = require("pdf-parse");
const {
  generateUniqueFilename,
  formatFileSize,
  ensureDirectoryExists,
} = require("../utils/fileUtils");

const outputsDir = path.join(__dirname, "../../outputs");
ensureDirectoryExists(outputsDir);

const archiver = require("archiver");

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

    const inputPath = req.file.path;
    const dataBuffer = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(dataBuffer);
    const pages = pdfDoc.getPages();

    // Create a truly unique extraction directory
    const extractionId = `extract_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const tempExtractDir = path.join(outputsDir, extractionId);
    ensureDirectoryExists(tempExtractDir);

    const extractedFiles = [];
    let imageCount = 0;

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const resources = page.node.get(PDFName.of("Resources"));
      if (!resources) continue;

      const xObjects = resources.get(PDFName.of("XObject"));
      if (!xObjects || !xObjects.dict) continue;

      for (const [name, ref] of xObjects.entries()) {
        const object = pdfDoc.context.lookup(ref);
        if (
          object instanceof PDFRawStream &&
          object.dict.get(PDFName.of("Subtype")) === PDFName.of("Image")
        ) {
          try {
            // 1. Decode the stream content if it's encoded (e.g. FlateDecode)
            let decodedBuffer;
            try {
              // PDFRawStream.decode() handles most filters including FlateDecode
              decodedBuffer = object.decode();
            } catch (decodeError) {
              console.warn(
                `Could not decode stream on page ${i + 1}:`,
                decodeError.message
              );
              decodedBuffer = object.contents; // Fallback to raw contents
            }

            if (!decodedBuffer || decodedBuffer.length === 0) continue;

            // 2. Determine the best way to process with sharp
            const filter = object.dict.get(PDFName.of("Filter"));
            const isJpg =
              filter === PDFName.of("DCTDecode") ||
              (Array.isArray(filter) &&
                filter.some((f) => String(f) === "/DCTDecode"));

            const extension = isJpg ? ".jpg" : ".png";
            const imgFilename = `page_${i + 1}_img_${++imageCount}${extension}`;
            const imgPath = path.join(tempExtractDir, imgFilename);

            let processedBuffer;
            try {
              // Try to let sharp handle the decoded buffer
              // For FlateDecode images, we might need to specify raw metadata if it's not a full PNG
              // but many PDFs embed full JPEGs as DCTDecode which sharp handles perfectly.
              processedBuffer = await sharp(decodedBuffer)
                .toFormat(isJpg ? "jpeg" : "png")
                .toBuffer();
            } catch (sharpError) {
              console.warn(
                `Sharp processing failed for ${imgFilename}, using raw decoded buffer:`,
                sharpError.message
              );
              processedBuffer = decodedBuffer;
            }

            fs.writeFileSync(imgPath, processedBuffer);
            extractedFiles.push({
              name: imgFilename,
              size: formatFileSize(processedBuffer.length),
            });
          } catch (itemError) {
            console.error(`Error processing image in PDF:`, itemError);
          }
        }
      }
    }

    if (extractedFiles.length === 0) {
      if (fs.existsSync(tempExtractDir))
        fs.rmSync(tempExtractDir, { recursive: true, force: true });
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      return res.status(404).json({
        success: false,
        message:
          "No images found in the uploaded PDF. Ensure the PDF contains actual image objects.",
      });
    }

    // Create ZIP
    const zipFilename = `extracted_images_${Date.now()}.zip`;
    const zipPath = path.join(outputsDir, zipFilename);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    // Wrap finishing logic in a promise
    const finishArchive = new Promise((resolve, reject) => {
      output.on("close", resolve);
      archive.on("error", reject);
    });

    archive.pipe(output);
    const dirFiles = fs.readdirSync(tempExtractDir);
    dirFiles.forEach((file) => {
      archive.file(path.join(tempExtractDir, file), { name: file });
    });
    await archive.finalize();
    await finishArchive;

    // Cleanup input file only (keep extraction dir for previews)
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);

    res.json({
      success: true,
      message: `Extracted ${imageCount} images successfully`,
      data: {
        filename: zipFilename,
        imageCount: imageCount,
        images: extractedFiles.map((f) => ({
          ...f,
          url: `/outputs/${extractionId}/${f.name}`,
        })),
        downloadUrl: `/api/download/${zipFilename}`,
      },
    });
  } catch (error) {
    console.error("PDF extraction error:", error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({
      success: false,
      message: "Error extracting images",
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
    const outputFilename = generateUniqueFilename(
      outputsDir,
      "output.pdf",
      ".pdf"
    );
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
