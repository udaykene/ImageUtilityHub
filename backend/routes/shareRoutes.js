const express = require("express");
const router = express.Router();
const shareController = require("../controllers/shareController");

router.post("/email", shareController.shareToEmail);
router.post("/whatsapp", shareController.shareToWhatsApp);

module.exports = router;
