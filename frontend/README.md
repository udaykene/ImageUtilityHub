# Image Utility Hub

A full-stack image formatting and optimization tool built with React and Express.js, using Sharp.js for high-performance image processing.

## Features

- 📤 **Upload Images**: Drag-and-drop or browse to upload images and PDFs
- 🔄 **Format Conversion**: Convert between JPEG, PNG, WebP, TIFF, GIF, AVIF
- 📏 **Resize & Crop**: Adjust dimensions with multiple fit options
- 🎨 **Image Effects**: Apply grayscale, blur, sharpen, rotation, flip
- 🗜️ **Compression**: Optimize file size with quality control
- ⬇️ **Download**: Get your processed images instantly
- 📊 **Metadata Display**: View detailed image information

## Tech Stack

**Frontend:**
- React 18
- Axios for API calls
- CSS3 for styling

**Backend:**
- Node.js & Express.js
- Multer for file uploads
- Sharp.js for image processing
- UUID for unique file names

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Start the backend server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Project Structure

```
IMAGEUTILITYHUB/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── uploadController.js
│   │   │   └── processController.js
│   │   ├── middlewares/
│   │   │   └── upload.js
│   │   ├── routes/
│   │   │   ├── uploadRoutes.js
│   │   │   └── processRoutes.js
│   │   └── utils/
│   │       └── imageProcessor.js
│   ├── uploads/          # Temporary uploaded files
│   ├── outputs/          # Processed files
│   ├── app.js
│   ├── package.json
│   └── README.md
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── ImageUploader.js
    │   │   ├── ImageUploader.css
    │   │   ├── ImageProcessor.js
    │   │   └── ImageProcessor.css
    │   ├── App.js
    │   ├── App.css
    │   ├── index.js
    │   └── index.css
    ├── package.json
    └── README.md
```

## API Endpoints

### Upload Image
```
POST /api/upload
Content-Type: multipart/form-data
Body: { image: File }
```

### Process Image
```
POST /api/process
Content-Type: application/json
Body: {
  filename: string,
  options: {
    format: string,
    width: number,
    height: number,
    quality: number,
    fit: string,
    rotate: number,
    flip: boolean,
    flop: boolean,
    grayscale: boolean,
    blur: number,
    sharpen: number
  }
}
```

### Download Processed Image
```
GET /api/process/download/:filename
```

### Get Image Metadata
```
GET /api/process/metadata/:filename
```

### Delete Uploaded File
```
DELETE /api/process/:filename
```

## Processing Options

| Option | Type | Description |
|--------|------|-------------|
| `format` | string | Output format (jpeg, png, webp, tiff, gif, avif) |
| `quality` | number | Quality setting (1-100) |
| `width` | number | Target width in pixels |
| `height` | number | Target height in pixels |
| `fit` | string | Resize mode (cover, contain, fill, inside, outside) |
| `rotate` | number | Rotation angle in degrees |
| `flip` | boolean | Flip vertically |
| `flop` | boolean | Flip horizontally |
| `grayscale` | boolean | Convert to grayscale |
| `blur` | number | Blur amount (0-10) |
| `sharpen` | number | Sharpen amount (0-5) |

## Usage Example

1. **Upload an Image**: Click or drag-and-drop your image file
2. **Configure Options**: Adjust format, size, quality, and effects
3. **Process**: Click "Process Image" to apply transformations
4. **Download**: Get your optimized image

## File Size Limits

- Maximum upload size: 10MB
- Supported formats: JPEG, PNG, GIF, WebP, BMP, TIFF, PDF

## Development

### Running Both Servers Simultaneously

You can use a tool like `concurrently` to run both servers:

```bash
npm install -g concurrently
```

Create a `package.json` in the root directory:

```json
{
  "scripts": {
    "dev": "concurrently \"cd backend && npm run dev\" \"cd frontend && npm start\""
  }
}
```

Then run:
```bash
npm run dev
```

## Production Deployment

### Backend
```bash
cd backend
npm install --production
npm start
```

### Frontend
```bash
cd frontend
npm run build
```

Serve the `build` folder using a static file server or integrate with your backend.

## Future Enhancements

- [ ] Batch processing multiple images
- [ ] More image filters and effects
- [ ] Save processing presets
- [ ] User authentication
- [ ] Cloud storage integration
- [ ] Image comparison view
- [ ] Watermark support
- [ ] PDF page extraction

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ using React, Express, and Sharp.js