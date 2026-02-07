# Image Utility Hub - Backend

Backend server for the Image Formatting Tool built with Express.js and Sharp.js.

## Features

- Image upload handling
- Image format conversion (JPEG, PNG, WebP, TIFF, GIF, etc.)
- Image resizing and cropping
- Image quality adjustment and compression
- Image transformations (rotate, flip, grayscale, blur, sharpen)
- Temporary file storage
- Download processed images

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### 1. Upload Image
**POST** `/api/upload`
- Content-Type: `multipart/form-data`
- Body: `image` (file)
- Returns: File info and metadata

**Example:**
```javascript
const formData = new FormData();
formData.append('image', fileInput.files[0]);

fetch('http://localhost:5000/api/upload', {
  method: 'POST',
  body: formData
})
.then(res => res.json())
.then(data => console.log(data));
```

### 2. Process Image
**POST** `/api/process`
- Content-Type: `application/json`
- Body:
```json
{
  "filename": "uploaded-filename.jpg",
  "options": {
    "format": "png",
    "width": 800,
    "height": 600,
    "quality": 90,
    "fit": "cover",
    "grayscale": false,
    "rotate": 0,
    "blur": 0,
    "sharpen": 0
  }
}
```
- Returns: Processed image info and download URL

**Example:**
```javascript
fetch('http://localhost:5000/api/process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    filename: 'abc-123.jpg',
    options: {
      format: 'webp',
      width: 1000,
      quality: 85
    }
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

### 3. Download Processed Image
**GET** `/api/process/download/:filename`
- Downloads the processed image file

**Example:**
```javascript
window.open('http://localhost:5000/api/process/download/processed-image.webp');
```

### 4. Get Image Metadata
**GET** `/api/process/metadata/:filename`
- Returns detailed metadata about uploaded image

### 5. Delete Uploaded File
**DELETE** `/api/process/:filename`
- Deletes an uploaded file from temporary storage

## Processing Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `format` | string | 'jpeg' | Output format (jpeg, png, webp, tiff, gif, avif) |
| `width` | number | - | Target width in pixels |
| `height` | number | - | Target height in pixels |
| `quality` | number | 80 | Quality (1-100) |
| `fit` | string | 'cover' | Resize fit mode (cover, contain, fill, inside, outside) |
| `rotate` | number | - | Rotation angle in degrees |
| `flip` | boolean | false | Flip vertically |
| `flop` | boolean | false | Flip horizontally |
| `grayscale` | boolean | false | Convert to grayscale |
| `blur` | number | - | Blur sigma (0.3 - 1000) |
| `sharpen` | number | - | Sharpen sigma (0.5 - 2.5) |
| `brightness` | number | - | Brightness multiplier (0.5 - 2.0) |
| `saturation` | number | - | Saturation multiplier (0.5 - 2.0) |

## File Structure

```
backend/
├── src/
│   ├── controllers/
│   │   ├── uploadController.js
│   │   └── processController.js
│   ├── middlewares/
│   │   └── upload.js
│   ├── routes/
│   │   ├── uploadRoutes.js
│   │   └── processRoutes.js
│   └── utils/
│       └── imageProcessor.js
├── uploads/          # Temporary uploaded files
├── outputs/          # Processed files
├── app.js           # Main server file
├── package.json
└── .env
```

## Dependencies

- **express**: Web framework
- **multer**: File upload handling
- **sharp**: High-performance image processing
- **cors**: Cross-origin resource sharing
- **uuid**: Generate unique filenames

## Notes

- Maximum file size: 10MB
- Supported formats: JPEG, PNG, GIF, WebP, BMP, TIFF, PDF
- Files are stored temporarily and can be configured to auto-delete
- Use appropriate cleanup mechanisms for production environments