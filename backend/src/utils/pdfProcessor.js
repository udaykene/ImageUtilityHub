const { PDFDocument } = require("pdf-lib");
const sharp = require("sharp");
const crypto = require("crypto");

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

const getImageObject = (page, imageId) =>
  new Promise((resolve) => {
    let settled = false;
    const done = (value) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    try {
      page.objs.get(imageId, (img) => done(img || null));
      setTimeout(() => done(null), 2000);
    } catch {
      done(null);
    }
  });

const toImageBuffer = async (imageLike) => {
  if (!imageLike) return null;

  if (Buffer.isBuffer(imageLike)) {
    const metadata = await sharp(imageLike).metadata();
    return {
      buffer: imageLike,
      mimeType: `image/${metadata.format || "png"}`,
      extension: metadata.format === "jpeg" ? "jpg" : metadata.format || "png",
      width: metadata.width || null,
      height: metadata.height || null,
    };
  }

  const width = imageLike.width || imageLike.w;
  const height = imageLike.height || imageLike.h;
  const raw = imageLike.data;

  if (raw && width && height) {
    const pixelCount = width * height;
    const channels = Math.max(1, Math.round(raw.length / pixelCount));

    if (![1, 2, 3, 4].includes(channels)) return null;

    let normalizedRaw;
    let normalizedChannels;

    if (channels === 2) {
      // Convert grayscale+alpha to RGBA for reliable encoding.
      normalizedRaw = Buffer.alloc(pixelCount * 4);
      for (let i = 0; i < pixelCount; i++) {
        const gray = raw[i * 2];
        const alpha = raw[i * 2 + 1];
        const idx = i * 4;
        normalizedRaw[idx] = gray;
        normalizedRaw[idx + 1] = gray;
        normalizedRaw[idx + 2] = gray;
        normalizedRaw[idx + 3] = alpha;
      }
      normalizedChannels = 4;
    } else {
      normalizedRaw = Buffer.from(raw);
      normalizedChannels = channels;
    }

    const encoded = await sharp(normalizedRaw, {
      raw: { width, height, channels: normalizedChannels },
    })
      .png()
      .toBuffer();

    return {
      buffer: encoded,
      mimeType: "image/png",
      extension: "png",
      width,
      height,
    };
  }

  if (typeof imageLike.src === "string" && imageLike.src.startsWith("data:")) {
    const [, mimeType, encodedPart] =
      imageLike.src.match(/^data:(.*?);base64,(.*)$/) || [];
    if (!mimeType || !encodedPart) return null;
    const data = Buffer.from(encodedPart, "base64");
    const metadata = await sharp(data).metadata();
    return {
      buffer: data,
      mimeType,
      extension: metadata.format === "jpeg" ? "jpg" : metadata.format || "png",
      width: metadata.width || null,
      height: metadata.height || null,
    };
  }

  return null;
};

/**
 * Extract embedded images from PDF (not rendered pages)
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

    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(buffer),
      disableWorker: true,
    });
    const pdf = await loadingTask.promise;
    const images = [];

    const seenHashes = new Set();
    const imageOps = new Set([
      pdfjs.OPS.paintImageXObject,
      pdfjs.OPS.paintJpegXObject,
      pdfjs.OPS.paintInlineImageXObject,
    ]);

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const operatorList = await page.getOperatorList();

      for (let i = 0; i < operatorList.fnArray.length; i++) {
        const fn = operatorList.fnArray[i];
        if (!imageOps.has(fn)) continue;

        const args = operatorList.argsArray[i] || [];
        let imageObject = null;

        if (fn === pdfjs.OPS.paintInlineImageXObject) {
          imageObject = args[0] || null;
        } else {
          const imageId = args[0];
          if (!imageId) continue;
          imageObject = await getImageObject(page, imageId);
        }

        const converted = await toImageBuffer(imageObject);
        if (!converted) continue;

        const hash = crypto
          .createHash("sha1")
          .update(converted.buffer)
          .digest("hex");
        if (seenHashes.has(hash)) continue;
        seenHashes.add(hash);

        const index = images.length + 1;
        images.push({
          name: `image-${index}.${converted.extension}`,
          mimeType: converted.mimeType,
          sizeBytes: converted.buffer.length,
          width: converted.width,
          height: converted.height,
          sourcePage: pageNum,
          buffer: converted.buffer,
        });
      }
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
