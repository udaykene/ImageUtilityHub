const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const { uploadFile } = require('../controllers/uploadController');

// Upload single file
router.post('/', upload.single('image'), uploadFile);

module.exports = router;