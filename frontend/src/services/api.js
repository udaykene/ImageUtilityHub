import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Compress image
 */
export const compressImage = async (file, options = {}) => {
  const formData = new FormData();
  formData.append("image", file);

  // Send target percentage (how much of original size to keep)
  // quality slider value represents compression level: 10 = compress to 10% of original
  if (options.quality) {
    formData.append("targetPercentage", options.quality);
  }

  if (options.outputFormat) {
    formData.append("outputFormat", options.outputFormat);
  }
  if (options.stripMetadata !== undefined) {
    formData.append("stripMetadata", options.stripMetadata);
  }

  const response = await api.post("/compress", formData, {
    // Let the browser set the multipart boundary automatically
  });
  return response.data;
};

/**
 * Convert image format
 */
export const convertImage = async (file, options = {}) => {
  const formData = new FormData();
  formData.append("image", file);

  if (options.outputFormat)
    formData.append("outputFormat", options.outputFormat);
  if (options.quality) formData.append("quality", options.quality);

  const response = await api.post("/convert", formData, {
    // Let the browser set the multipart boundary automatically
  });

  return response.data;
};

/**
 * Resize image
 */
export const resizeImage = async (file, options = {}) => {
  const formData = new FormData();
  formData.append("image", file);

  if (options.width) formData.append("width", options.width);
  if (options.height) formData.append("height", options.height);
  if (options.fit) formData.append("fit", options.fit);
  if (options.maintainAspectRatio !== undefined)
    formData.append("maintainAspectRatio", options.maintainAspectRatio);
  if (options.outputFormat)
    formData.append("outputFormat", options.outputFormat);
  if (options.quality) formData.append("quality", options.quality);

  const response = await api.post("/resize", formData, {
    // Let the browser set the multipart boundary automatically
  });

  return response.data;
};

/**
 * Extract images from PDF
 */
export const extractImagesFromPDF = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await api.post("/extract", formData, {
    // Let the browser set the multipart boundary automatically
  });

  return response.data;
};

/**
 * Download selected extracted images as ZIP
 */
export const downloadSelectedExtractedImages = async (
  images,
  zipName = "extracted-images.zip",
) => {
  const response = await api.post(
    "/extract/download",
    { images, zipName },
    { responseType: "blob" },
  );

  const objectUrl = window.URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = zipName;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(objectUrl);
};

/**
 * Create PDF from images
 */
export const createPDFFromImages = async (files, options = {}) => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("images", file);
  });

  if (options.pageSize) formData.append("pageSize", options.pageSize);
  if (options.orientation) formData.append("orientation", options.orientation);
  if (options.margin) formData.append("margin", options.margin);
  if (options.quality) formData.append("quality", options.quality);

  const response = await api.post("/images-to-pdf", formData, {
    // Let the browser set the multipart boundary automatically
  });

  return response.data;
};

/**
 * Get download URL for a file
 * Now works with both Cloudinary URLs and legacy filename format
 */
export const getDownloadUrl = (filenameOrUrl) => {
  // If it's already a full URL (Cloudinary), return it as is
  if (
    filenameOrUrl &&
    (filenameOrUrl.startsWith("http://") ||
      filenameOrUrl.startsWith("https://"))
  ) {
    if (filenameOrUrl.includes("res.cloudinary.com")) {
      return `${API_BASE_URL}/download?cloudinaryUrl=${encodeURIComponent(filenameOrUrl)}`;
    }
    return filenameOrUrl;
  }

  // Otherwise, use the legacy API download endpoint
  return `${API_BASE_URL}/download/${encodeURIComponent(filenameOrUrl)}`;
};

const getFilenameFromUrl = (url, fallback = `download-${Date.now()}`) => {
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname || "";
    const lastSegment = pathname.split("/").pop() || "";
    return lastSegment || fallback;
  } catch {
    return fallback;
  }
};

/**
 * Download file
 * Works with both Cloudinary URLs and API endpoints
 */
export const downloadFile = async (filenameOrUrl, options = {}) => {
  const url = getDownloadUrl(filenameOrUrl);
  const fallbackName =
    typeof filenameOrUrl === "string" &&
    (filenameOrUrl.startsWith("http://") ||
      filenameOrUrl.startsWith("https://"))
      ? getFilenameFromUrl(filenameOrUrl)
      : filenameOrUrl;
  const overrideName =
    typeof options.filename === "string" && options.filename.trim().length > 0
      ? options.filename.trim()
      : null;

  try {
    // Force a same-origin blob URL download so browsers don't navigate to Cloudinary.
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Download failed with status ${response.status}`);
    }

    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = overrideName || fallbackName || `download-${Date.now()}`;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(objectUrl);
  } catch (error) {
    console.error("Download failed:", error);
    throw error;
  }
};

export default api;
