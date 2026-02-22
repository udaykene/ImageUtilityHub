const shareService = require("../services/shareService");

const shareToEmail = async (req, res) => {
  const { to, subject, message, imageUrl } = req.body;

  if (!to || !imageUrl) {
    return res
      .status(400)
      .json({ error: "Recipient email and Image URL are required" });
  }

  try {
    await shareService.sendEmail({ to, subject, message, imageUrl });
    res.status(200).json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Email sharing error:", error);
    res
      .status(500)
      .json({ error: "Failed to send email", details: error.message });
  }
};

const shareToWhatsApp = async (req, res) => {
  const { to, imageUrl, caption } = req.body;

  if (!to || !imageUrl) {
    return res
      .status(400)
      .json({ error: "Phone number and Image URL are required" });
  }

  try {
    const response = await shareService.sendWhatsApp({ to, imageUrl, caption });
    res
      .status(200)
      .json({
        success: true,
        message: "WhatsApp message sent",
        data: response.data,
      });
  } catch (error) {
    console.error("WhatsApp sharing error:", error);
    res
      .status(500)
      .json({
        error: "Failed to send WhatsApp message",
        details: error.response?.data || error.message,
      });
  }
};

module.exports = {
  shareToEmail,
  shareToWhatsApp,
};
