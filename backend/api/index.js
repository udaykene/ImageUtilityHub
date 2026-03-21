const app = require("../index");

// Disable Vercel's default body parser so multer can process the multipart form data
const config = {
  api: {
    bodyParser: false,
  },
};

module.exports = app;
module.exports.config = config;