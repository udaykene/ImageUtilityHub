const multer = require("multer");

// Use memory storage (no disk writes)
const storage = multer.memoryStorage();

// File filter - accept only images and PDFs
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/bmp",
    "image/tiff",
    "image/avif",
    "application/pdf",
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error(
      `Invalid file type: ${file.mimetype}. Only images and PDFs are allowed.`
    );
    error.status = 400;
    cb(error, false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

module.exports = upload;
