const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

/**
 * Generate a unique filename with extension (Windows-style numbering, no spaces)
 */
const generateUniqueFilename = (dirPath, originalName, newExtension = null) => {
  const ext = newExtension || path.extname(originalName);
  const nameWithoutExt = path.parse(originalName).name;

  let finalName = `${nameWithoutExt}${ext}`;
  let counter = 1;

  while (fs.existsSync(path.join(dirPath, finalName))) {
    finalName = `${nameWithoutExt}(${counter})${ext}`;
    counter++;
  }

  return finalName;
};

/**
 * Format file size in human-readable format
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

/**
 * Delete a file if it exists
 */
const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) reject(err);
        else resolve();
      });
    } else {
      resolve();
    }
  });
};

/**
 * Ensure directory exists
 */
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * Get file stats
 */
const getFileStats = async (filePath) => {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (err) reject(err);
      else resolve(stats);
    });
  });
};

/**
 * Clean up old files in a directory
 */
const cleanupOldFiles = async (dirPath, maxAgeMs = 60 * 60 * 1000) => {
  if (!fs.existsSync(dirPath)) return;

  const files = fs.readdirSync(dirPath);
  const now = Date.now();

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    try {
      const stats = await getFileStats(filePath);
      if (now - stats.mtimeMs > maxAgeMs) {
        await deleteFile(filePath);
        console.log(`Cleaned up old file: ${file}`);
      }
    } catch (err) {
      console.error(`Error cleaning up ${file}:`, err);
    }
  }
};

module.exports = {
  generateUniqueFilename,
  formatFileSize,
  deleteFile,
  ensureDirectoryExists,
  getFileStats,
  cleanupOldFiles,
};
