const express = require('express');
const router = express.Router();
const {
  processImageFile,
  downloadFile,
  getMetadata,
  deleteUploadedFile
} = require('../controllers/processController');

// Process image
router.post('/', processImageFile);

// Download processed file
router.get('/download/:filename', downloadFile);

// Get metadata
router.get('/metadata/:filename', getMetadata);

// Delete uploaded file
router.delete('/:filename', deleteUploadedFile);

module.exports = router;