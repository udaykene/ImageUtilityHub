import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileImage,
  Download,
  CheckSquare,
  Package,
  MessageCircle,
  Mail,
  Cloud,
  RefreshCcw,
  FileCheck,
} from "lucide-react";
import FileUpload from "@/components/FileUpload";
import ShareButton from "@/components/ShareButton";
import {
  extractImagesFromPDF,
  downloadFile,
  downloadSelectedExtractedImages,
} from "@/services/api";

export default function Extract() {
  const [file, setFile] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState(0);
  const [selectedImages, setSelectedImages] = useState([]);
  const selectedImageObjects = (result?.images || []).filter((img) =>
    selectedImages.includes(img.publicId),
  );
  
  const primaryFile = selectedImageObjects[0] || result?.images?.[0];
  const primaryShareUrl = primaryFile?.cloudinaryUrl;
  const primaryFilename = primaryFile?.name || "extracted-image";
  const primaryMimeType = primaryFile?.format ? `image/${primaryFile.format}` : "image/png";
  
  const isPageFallback = result?.fallbackUsed;

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setResult(null);
    setProgress(0);
    setSelectedImages([]);
  };

  const handleExtract = async () => {
    if (!file) return;
    setExtracting(true);
    setProgress(40);

    try {
      const data = await extractImagesFromPDF(file);
      setProgress(100);
      setResult(data.data);
      setSelectedImages((data.data?.images || []).map((img) => img.publicId));
    } catch (error) {
      console.error("Extraction failed:", error);
      alert("Failed to extract images. Please try again with a different PDF.");
    } finally {
      setExtracting(false);
    }
  };

  const toggleImageSelection = (publicId) => {
    setSelectedImages((prev) =>
      prev.includes(publicId)
        ? prev.filter((img) => img !== publicId)
        : [...prev, publicId],
    );
  };

  const selectAll = () => {
    if (result?.images) {
      setSelectedImages(result.images.map((img) => img.publicId));
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setProgress(0);
    setSelectedImages([]);
  };

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/20">
              <FileImage className="size-6" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black">
              PDF Image Extraction
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg max-w-2xl">
            Extract embedded images from PDF files and download only the files
            you choose.
          </p>
        </motion.div>

        {!result ? (
          <>
            {/* Upload Area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <FileUpload
                accept="application/pdf"
                maxSize={50}
                onFileSelect={handleFileSelect}
                title="Drag & drop PDF here"
                subtitle="Maximum file size: 50MB"
                className={file ? "opacity-50 pointer-events-none" : ""}
              />
            </motion.div>

            {/* Preparation/Progress Stage */}
            <AnimatePresence>
              {file && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="glass-card rounded-2xl p-6 mb-8 border-primary/20"
                >
                  <div className="flex gap-6 justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        {extracting ? (
                          <RefreshCcw className="size-5 animate-spin" />
                        ) : (
                          <FileCheck className="size-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {extracting ? "Extracting..." : "Ready to extract"}
                        </p>
                        <p className="text-xs text-slate-400 truncate max-w-[200px]">
                          {file.name}
                        </p>
                      </div>
                    </div>
                    <p className="text-primary font-black">{progress}%</p>
                  </div>

                  <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden mb-6">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-full bg-primary"
                    />
                  </div>

                  {!extracting && (
                    <div className="flex gap-3">
                      <button
                        onClick={reset}
                        className="btn-secondary flex-1 py-3"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleExtract}
                        className="btn-primary flex-[2] py-3 shadow-lg shadow-primary/30"
                      >
                        <Package className="size-5" />
                        Start Extraction
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            {/* Success Summary */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 border-green-500/20">
              <div className="size-16 sm:size-20 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500">
                <FileImage className="size-8 sm:size-10" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-xl sm:text-2xl font-black mb-1">
                  Extraction Complete!
                </h2>
                <p className="text-slate-500">
                  Successfully extracted <b>{result.imageCount}</b>{" "}
                  {isPageFallback ? "page images" : "embedded images"} from
                  your PDF.
                </p>
                {result?.notice && (
                  <p className="text-amber-400 text-sm mt-2">{result.notice}</p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button
                  onClick={reset}
                  className="btn-secondary px-6 py-3 border-white/10 hover:bg-purple-600 hover:border-purple-600 dark:hover:bg-purple-600 text-white flex items-center justify-center gap-2 shadow-lg shadow-purple-500/10"
                >
                  <RefreshCcw className="size-4" />
                  New Project
                </button>
                <button
                  onClick={async () => {
                    if (!result?.images?.length) return;
                    const selected = result.images.filter((img) =>
                      selectedImages.includes(img.publicId),
                    );
                    if (!selected.length) {
                      alert("Please select at least one image to download.");
                      return;
                    }

                    try {
                      await downloadSelectedExtractedImages(
                        selected.map((img) => ({
                          publicId: img.publicId,
                          resourceType: img.resourceType,
                          format: img.format,
                          name: img.name,
                        })),
                        `${file?.name?.replace(/\.pdf$/i, "") || "extracted-images"}-selected.zip`,
                      );
                    } catch (error) {
                      console.error("ZIP download failed:", error);
                      alert(
                        "Failed to download ZIP. Please try again in a moment."
                      );
                    }
                  }}
                  className="btn-primary px-8 py-3 shadow-lg shadow-primary/30"
                >
                  <Download className="size-5" />
                  Download Selected ZIP
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Image Grid */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="font-bold text-lg">Extracted Files</h3>
                  <button
                    onClick={selectAll}
                    className="text-primary text-sm font-bold hover:underline"
                  >
                    Select All
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {result.images.map((img, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ y: -4 }}
                      onClick={() => toggleImageSelection(img.publicId)}
                      className={`group relative glass-card rounded-2xl p-3 cursor-pointer transition-all border-2 ${
                        selectedImages.includes(img.publicId)
                          ? "border-primary bg-primary/5"
                          : "border-transparent hover:border-white/10"
                      }`}
                    >
                      <div className="aspect-square rounded-xl bg-slate-100 dark:bg-white/5 mb-3 flex items-center justify-center overflow-hidden">
                        {img.cloudinaryUrl ? (
                          <img
                            src={img.cloudinaryUrl}
                            alt={img.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <FileImage className="size-10 text-slate-300 group-hover:scale-110 transition-transform" />
                        )}
                      </div>
                      <p className="text-[10px] font-black truncate">
                        {img.name}
                      </p>
                      <p className="text-[10px] text-slate-400">{img.size}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadFile(img.cloudinaryUrl).catch((error) => {
                            console.error("Single image download failed:", error);
                            alert("Failed to download image. Please try again.");
                          });
                        }}
                        className="mt-2 w-full text-[10px] py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-bold transition"
                      >
                        Download
                      </button>

                      {selectedImages.includes(img.publicId) && (
                        <div className="absolute top-2 right-2 p-1 bg-primary rounded-full text-white shadow-md">
                          <CheckSquare className="size-3" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Sidebar Actions */}
              <div className="space-y-6">
                <div className="glass-card rounded-3xl p-6 sticky top-24">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <MessageCircle className="size-5 text-primary" />
                    Share Selected Image
                  </h3>

                  <div className="flex justify-center pt-4">
                    <ShareButton 
                      cloudinaryUrl={primaryShareUrl}
                      filename={primaryFilename}
                      mimeType={primaryMimeType}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Info Footer */}
        {!result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
              <FileImage className="size-4" />
              <p>
                Secure extraction: embedded PDF images are extracted and can be
                downloaded individually or as a selected ZIP.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
