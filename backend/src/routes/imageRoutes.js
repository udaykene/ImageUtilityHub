const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");

// Import controllers
const { compress } = require("../controllers/compressionController");
const { convert } = require("../controllers/conversionController");
const { resize } = require("../controllers/resizeController");
const {
  extract,
  imagesToPDF,
  downloadExtractedSelection,
} = require("../controllers/pdfController");
const { download } = require("../controllers/downloadController");

// Routes
router.post("/compress", upload.single("image"), compress);
router.post("/convert", upload.single("image"), convert);
router.post("/resize", upload.single("image"), resize);
router.post("/extract", upload.single("image"), extract);
router.post("/extract/download", downloadExtractedSelection);
router.post("/images-to-pdf", upload.array("images", 20), imagesToPDF);
router.get("/download", download);
router.get("/download/:filename", download);

module.exports = router;
