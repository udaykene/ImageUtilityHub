const cloudinary = require("../config/cloudinary");
const sharp = require("sharp");
const path = require("path");

const sanitizePublicId = (filename = "") => {
  const baseName = path.parse(filename).name || "file";
  return baseName
    .trim()
    .replace(/[^\w.-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .substring(0, 120);
};

/**
 * Upload image to Cloudinary with transformations
 */
const uploadImage = async (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const { originalName, ...otherOptions } = options;
    const safePublicId = sanitizePublicId(originalName);

    const uploadOptions = {
      folder: "image-utility-hub",
      resource_type: "auto",
      use_filename: true,
      unique_filename: false,
      overwrite: true,
      public_id: safePublicId,
      filename_override: safePublicId,
      ...otherOptions,
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(buffer);
  });
};

/**
 * Delete image from Cloudinary
 */
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
};

/**
 * Schedule auto-deletion after specified hours
 */
const scheduleAutoDeletion = (publicId, hours = 24) => {
  const deleteAfterMs = hours * 60 * 60 * 1000;

  setTimeout(async () => {
    try {
      await deleteImage(publicId);
      console.log(`✅ Auto-deleted image: ${publicId}`);
    } catch (error) {
      console.error(`❌ Failed to auto-delete image: ${publicId}`, error);
    }
  }, deleteAfterMs);

  console.log(`⏰ Scheduled deletion for ${publicId} in ${hours} hours`);
};

/**
 * Generate shareable URL from Cloudinary public ID
 */
const generateShareableUrl = (publicId, transformation = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    ...transformation,
  });
};

/**
 * Compress image with quality control
 */
// const compressImage = async (buffer, quality = 80, targetSize = null) => {
//   try {
//     const metadata = await sharp(buffer).metadata();
//     const originalSize = buffer.length;

//     let compressedBuffer;
//     let actualQuality = quality;

//     if (targetSize) {
//       // Target size based compression
//       const targetBytes = targetSize * 1024;
//       let currentQuality = 90;

//       while (currentQuality > 10) {
//         compressedBuffer = await sharp(buffer)
//           .jpeg({ quality: currentQuality, mozjpeg: true })
//           .toBuffer();

//         if (compressedBuffer.length <= targetBytes || currentQuality <= 10) {
//           actualQuality = currentQuality;
//           break;
//         }
//         currentQuality -= 5;
//       }
//     } else {
//       // Quality percentage based compression
//       compressedBuffer = await sharp(buffer)
//         .jpeg({ quality: actualQuality, mozjpeg: true })
//         .toBuffer();
//     }

//     const compressedSize = compressedBuffer.length;
//     const savings = ((1 - compressedSize / originalSize) * 100).toFixed(2);

//     return {
//       buffer: compressedBuffer,
//       originalSize: (originalSize / 1024).toFixed(2),
//       compressedSize: (compressedSize / 1024).toFixed(2),
//       savings: parseFloat(savings),
//       quality: actualQuality,
//       format: metadata.format,
//     };
//   } catch (error) {
//     console.error("Error compressing image:", error);
//     throw error;
//   }
// };
const compressImage = async (
  buffer,
  initialQuality = 80,
  targetSizeKB = null
) => {
  const originalSize = buffer.length;
  const targetBytes = targetSizeKB ? targetSizeKB * 1024 : null;
  const tolerance = 3 * 1024; // ±3KB
  const maxQualityIterations = 12;
  const maxResizeIterations = 4;

  const metadata = await sharp(buffer).metadata();
  let width = metadata.width;

  const formatsToTry = ["webp", "avif"];

  const compress = async (format, quality, resizeWidth = null) => {
    let pipeline = sharp(buffer).rotate();

    if (resizeWidth) {
      pipeline = pipeline.resize(resizeWidth, null, {
        withoutEnlargement: true,
      });
    }

    if (format === "webp") {
      pipeline = pipeline.webp({ quality, effort: 6 });
    } else if (format === "avif") {
      pipeline = pipeline.avif({ quality, effort: 5 });
    }

    return await pipeline.toBuffer();
  };

  if (!targetBytes) {
    const output = await compress("webp", initialQuality);
    return buildResponse(output, "webp", initialQuality, "simple-compress");
  }

  let bestResult = null;

  for (const format of formatsToTry) {
    let minQ = 5;
    let maxQ = 95;
    let quality = initialQuality;
    let bestBuffer = null;

    // 🔥 Quality Binary Search
    for (let i = 0; i < maxQualityIterations; i++) {
      const testBuffer = await compress(format, quality);
      const size = testBuffer.length;

      bestBuffer = testBuffer;

      if (Math.abs(size - targetBytes) <= tolerance) {
        return buildResponse(testBuffer, format, quality, "quality-match");
      }

      if (size > targetBytes) {
        maxQ = quality - 1;
      } else {
        minQ = quality + 1;
      }

      if (minQ > maxQ) break;

      quality = Math.floor((minQ + maxQ) / 2);
    }

    // 🚨 Controlled Resize Fallback
    let resizeCount = 0;
    let resizedWidth = width;

    while (
      bestBuffer.length > targetBytes &&
      resizeCount < maxResizeIterations &&
      resizedWidth > 600
    ) {
      resizedWidth = Math.floor(resizedWidth * 0.9);

      const resizedBuffer = await compress(
        format,
        initialQuality,
        resizedWidth
      );

      bestBuffer = resizedBuffer;
      resizeCount++;

      if (bestBuffer.length <= targetBytes + tolerance) {
        return buildResponse(
          bestBuffer,
          format,
          initialQuality,
          "resize-match"
        );
      }
    }

    if (!bestResult || bestBuffer.length < bestResult.buffer.length) {
      bestResult = {
        buffer: bestBuffer,
        format,
        quality: initialQuality,
        stage: "minimum-achievable",
      };
    }
  }

  return buildResponse(
    bestResult.buffer,
    bestResult.format,
    bestResult.quality,
    bestResult.stage
  );

  function buildResponse(outputBuffer, format, quality, stage) {
    return {
      buffer: outputBuffer,
      originalSize,
      compressedSize: outputBuffer.length,
      savings: (
        ((originalSize - outputBuffer.length) / originalSize) *
        100
      ).toFixed(2),
      quality,
      format,
      stage, // tells frontend what happened
      matchedTarget:
        targetBytes && Math.abs(outputBuffer.length - targetBytes) <= tolerance,
    };
  }
};

/**
 * Convert image format
 */
const convertImageFormat = async (buffer, targetFormat) => {
  try {
    const formatMap = {
      jpg: "jpeg",
      jpeg: "jpeg",
      png: "png",
      webp: "webp",
      gif: "gif",
      tiff: "tiff",
      avif: "avif",
      bmp: "bmp",
    };

    const format = formatMap[targetFormat.toLowerCase()] || "jpeg";
    const convertedBuffer = await sharp(buffer).toFormat(format).toBuffer();

    return {
      buffer: convertedBuffer,
      format: format,
      size: (convertedBuffer.length / 1024).toFixed(2),
    };
  } catch (error) {
    console.error("Error converting image format:", error);
    throw error;
  }
};

/**
 * Resize image
 */
const resizeImage = async (buffer, options = {}) => {
  try {
    const {
      width,
      height,
      fit = "cover",
      maintainAspectRatio = true,
    } = options;

    let sharpInstance = sharp(buffer);

    const resizeOptions = {
      width: width ? parseInt(width) : undefined,
      height: height ? parseInt(height) : undefined,
      fit: fit, // cover, contain, fill, inside, outside
      withoutEnlargement: maintainAspectRatio,
    };

    const resizedBuffer = await sharpInstance.resize(resizeOptions).toBuffer();

    const metadata = await sharp(resizedBuffer).metadata();

    return {
      buffer: resizedBuffer,
      width: metadata.width,
      height: metadata.height,
      size: (resizedBuffer.length / 1024).toFixed(2),
      format: metadata.format,
    };
  } catch (error) {
    console.error("Error resizing image:", error);
    throw error;
  }
};

module.exports = {
  uploadImage,
  deleteImage,
  scheduleAutoDeletion,
  generateShareableUrl,
  compressImage,
  convertImageFormat,
  resizeImage,
};
