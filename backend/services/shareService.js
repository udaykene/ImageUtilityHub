const nodemailer = require("nodemailer");
const axios = require("axios");

/**
 * Send an image link via Email using Nodemailer
 */
const sendEmail = async ({ to, subject, message, imageUrl }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT == 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: subject || "Shared Image from ImageUtilityHub",
    html: `
      <p>${message || "Check out this image I shared with you!"}</p>
      <img src="${imageUrl}" style="max-width: 100%; height: auto;" />
      <p><a href="${imageUrl}">Click here to view original image</a></p>
    `,
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Send an image via WhatsApp Cloud API
 * Note: Requires WHATSAPP_TOKEN and WHATSAPP_PHONE_ID
 */
const sendWhatsApp = async ({ to, imageUrl, caption }) => {
  const url = `https://graph.facebook.com/${process.env.WHATSAPP_VERSION || "v17.0"}/${process.env.WHATSAPP_PHONE_ID}/messages`;

  const data = {
    messaging_product: "whatsapp",
    to: to,
    type: "image",
    image: {
      link: imageUrl,
      caption: caption || "Image shared via ImageUtilityHub",
    },
  };

  const config = {
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
  };

  return axios.post(url, data, config);
};

module.exports = {
  sendEmail,
  sendWhatsApp,
};
