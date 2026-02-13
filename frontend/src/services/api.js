import axios from "axios";

const API_BASE_URL =
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
    headers: { "Content-Type": "multipart/form-data" },
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
    headers: {
      "Content-Type": "multipart/form-data",
    },
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
    headers: {
      "Content-Type": "multipart/form-data",
    },
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
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
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
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

/**
 * Get download URL for a file
 */
export const getDownloadUrl = (filename) => {
  return `${API_BASE_URL}/download/${filename}`;
};

/**
 * Download file
 */
export const downloadFile = (filename) => {
  const url = getDownloadUrl(filename);

  // Create a temporary anchor element to trigger download
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default api;
