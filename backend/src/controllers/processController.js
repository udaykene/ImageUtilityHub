const { processImage, deleteFile, getImageMetadata } = require('../utils/imageProcessor');
const path = require('path');
const fs = require('fs');

/**
 * Process uploaded image with specified options
 */
const processImageFile = async (req, res) => {
  try {
    const { filename } = req.body;
    const options = req.body.options || {};

    if (!filename) {
      return res.status(400).json({
        success: false,
        error: 'Filename is required'
      });
    }

    const inputPath = path.join(__dirname, '../../uploads', filename);

    // Check if file exists
    if (!fs.existsSync(inputPath)) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    // Process the image
    const result = await processImage(inputPath, options);

    // Optionally delete the original uploaded file
    // deleteFile(inputPath);

    res.status(200).json({
      success: true,
      message: 'Image processed successfully',
      result: {
        outputFilename: result.outputFilename,
        downloadUrl: `/api/process/download/${result.outputFilename}`,
        metadata: result.metadata
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Download processed image
 */
const downloadFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../../outputs', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    // Set headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    // Delete file after download (optional)
    fileStream.on('end', () => {
      // Uncomment to delete after download
      // setTimeout(() => deleteFile(filePath), 1000);
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get metadata of uploaded image
 */
const getMetadata = async (req, res) => {
  try {
    const { filename } = req.params;
    const inputPath = path.join(__dirname, '../../uploads', filename);

    if (!fs.existsSync(inputPath)) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    const metadata = await getImageMetadata(inputPath);

    res.status(200).json(metadata);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Delete uploaded file
 */
const deleteUploadedFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const inputPath = path.join(__dirname, '../../uploads', filename);

    const deleted = deleteFile(inputPath);

    if (deleted) {
      res.status(200).json({
        success: true,
        message: 'File deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  processImageFile,
  downloadFile,
  getMetadata,
  deleteUploadedFile
};