const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

/**
 * Process image with various options
 * @param {string} inputPath - Path to input image
 * @param {object} options - Processing options
 * @returns {object} - Result with output path and metadata
 */
const processImage = async (inputPath, options = {}) => {
  try {
    const {
      format = 'jpeg', // Output format: jpeg, png, webp, tiff, gif, etc.
      width,           // Target width
      height,          // Target height
      quality = 80,    // Quality (1-100)
      fit = 'cover',   // How to fit: cover, contain, fill, inside, outside
      background = { r: 255, g: 255, b: 255, alpha: 1 }, // Background color
      rotate,          // Rotation angle
      flip,            // Flip vertically
      flop,            // Flip horizontally
      grayscale,       // Convert to grayscale
      blur,            // Blur amount
      sharpen,         // Sharpen amount
      brightness,      // Brightness adjustment (-1 to 1)
      saturation       // Saturation adjustment
    } = options;

    // Generate unique output filename
    const outputFilename = `${uuidv4()}.${format}`;
    const outputPath = path.join(__dirname, '../../outputs', outputFilename);

    // Start Sharp pipeline
    let image = sharp(inputPath);

    // Get metadata
    const metadata = await image.metadata();

    // Apply resize if width or height specified
    if (width || height) {
      image = image.resize({
        width: width ? parseInt(width) : null,
        height: height ? parseInt(height) : null,
        fit: fit,
        background: background
      });
    }

    // Apply rotation
    if (rotate) {
      image = image.rotate(parseInt(rotate));
    }

    // Apply flip
    if (flip) {
      image = image.flip();
    }

    // Apply flop
    if (flop) {
      image = image.flop();
    }

    // Apply grayscale
    if (grayscale) {
      image = image.grayscale();
    }

    // Apply blur
    if (blur) {
      image = image.blur(parseFloat(blur));
    }

    // Apply sharpen
    if (sharpen) {
      image = image.sharpen(parseFloat(sharpen));
    }

    // Apply modulate (brightness, saturation)
    if (brightness || saturation) {
      image = image.modulate({
        brightness: brightness ? parseFloat(brightness) : undefined,
        saturation: saturation ? parseFloat(saturation) : undefined
      });
    }

    // Apply format-specific options
    const formatOptions = {
      jpeg: { quality: parseInt(quality) },
      png: { quality: parseInt(quality), compressionLevel: 9 },
      webp: { quality: parseInt(quality) },
      tiff: { quality: parseInt(quality) },
      gif: {},
      avif: { quality: parseInt(quality) }
    };

    // Convert to specified format
    image = image.toFormat(format, formatOptions[format] || {});

    // Save the processed image
    await image.toFile(outputPath);

    // Get output file stats
    const stats = fs.statSync(outputPath);

    return {
      success: true,
      outputPath: outputPath,
      outputFilename: outputFilename,
      metadata: {
        originalFormat: metadata.format,
        originalWidth: metadata.width,
        originalHeight: metadata.height,
        originalSize: fs.statSync(inputPath).size,
        newFormat: format,
        newSize: stats.size,
        compressionRatio: ((1 - stats.size / fs.statSync(inputPath).size) * 100).toFixed(2) + '%'
      }
    };
  } catch (error) {
    throw new Error(`Image processing failed: ${error.message}`);
  }
};

/**
 * Get image metadata without processing
 * @param {string} inputPath - Path to input image
 * @returns {object} - Image metadata
 */
const getImageMetadata = async (inputPath) => {
  try {
    const metadata = await sharp(inputPath).metadata();
    const stats = fs.statSync(inputPath);
    
    return {
      success: true,
      metadata: {
        format: metadata.format,
        width: metadata.width,
        height: metadata.height,
        space: metadata.space,
        channels: metadata.channels,
        depth: metadata.depth,
        density: metadata.density,
        hasAlpha: metadata.hasAlpha,
        orientation: metadata.orientation,
        fileSize: stats.size,
        fileSizeReadable: formatBytes(stats.size)
      }
    };
  } catch (error) {
    throw new Error(`Failed to get metadata: ${error.message}`);
  }
};

/**
 * Format bytes to readable string
 * @param {number} bytes - Bytes
 * @param {number} decimals - Decimal places
 * @returns {string} - Formatted string
 */
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Delete temporary files
 * @param {string} filePath - Path to file
 */
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Failed to delete file: ${error.message}`);
    return false;
  }
};

/**
 * Clean up old files in a directory
 * @param {string} directory - Directory path
 * @param {number} maxAge - Maximum age in milliseconds
 */
const cleanupOldFiles = (directory, maxAge = 3600000) => { // Default 1 hour
  try {
    const files = fs.readdirSync(directory);
    const now = Date.now();
    
    files.forEach(file => {
      const filePath = path.join(directory, file);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtimeMs > maxAge) {
        fs.unlinkSync(filePath);
        console.log(`Cleaned up old file: ${file}`);
      }
    });
  } catch (error) {
    console.error(`Cleanup failed: ${error.message}`);
  }
};

module.exports = {
  processImage,
  getImageMetadata,
  deleteFile,
  cleanupOldFiles,
  formatBytes
};