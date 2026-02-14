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
} from "lucide-react";
import FileUpload from "@/components/FileUpload";
import { shareToWhatsApp, shareByEmail, shareToDrive } from "@/utils/share";

// Mock extracted images
const mockImages = [
  { id: 1, name: "IMAGE_001.JPG", size: "1.2 MB", dimensions: "1920 x 1080" },
  { id: 2, name: "IMAGE_002.PNG", size: "3.5 MB", dimensions: "2400 x 2400" },
  { id: 3, name: "IMAGE_003.JPG", size: "0.8 MB", dimensions: "1280 x 720" },
  { id: 4, name: "IMAGE_004.JPG", size: "5.2 MB", dimensions: "4000 x 3000" },
];

export default function Extract() {
  const [file, setFile] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedImages, setSelectedImages] = useState([]);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setExtracted(false);
    setProgress(0);
  };

  const handleExtract = () => {
    if (!file) return;
    setExtracting(true);
    setProgress(0);

    // Simulate extraction progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setExtracting(false);
          setExtracted(true);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const toggleImageSelection = (id) => {
    setSelectedImages((prev) =>
      prev.includes(id) ? prev.filter((img) => img !== id) : [...prev, id],
    );
  };

  const selectAll = () => {
    setSelectedImages(mockImages.map((img) => img.id));
  };

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white">
              <FileImage className="size-6" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black">
              PDF Image Extraction
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg max-w-2xl">
            Extract all embedded images from PDF documents in their original
            resolution and quality.
          </p>
        </motion.div>

        {/* Upload Section */}
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
          />
        </motion.div>

        {/* Progress Bar */}
        <AnimatePresence>
          {file && !extracted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card rounded-2xl p-6 mb-8"
            >
              <div className="flex gap-6 justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  {extracting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <FileImage className="size-6 text-primary" />
                    </motion.div>
                  ) : (
                    <FileImage className="size-6 text-primary" />
                  )}
                  <p className="font-medium">
                    {extracting ? "Extracting images..." : "Ready to extract"}
                  </p>
                </div>
                <p className="text-primary text-sm font-bold">{progress}%</p>
              </div>

              <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden mb-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full rounded-full bg-primary"
                />
              </div>

              <div className="flex justify-between items-center text-sm">
                <p className="text-slate-500 dark:text-slate-400">
                  Processing '{file.name}'
                </p>
                {extracting && (
                  <p className="text-slate-400 text-xs italic">
                    {Math.floor((progress / 100) * mockImages.length)} of{" "}
                    {mockImages.length} images found
                  </p>
                )}
              </div>

              {!extracting && !extracted && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleExtract}
                  className="mt-6 w-full btn-primary justify-center py-4"
                >
                  <FileImage className="size-5" />
                  Start Extraction
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Section */}
        <AnimatePresence>
          {extracted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Header with Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-2xl font-bold">Extracted Images</h3>
                  <p className="text-slate-400 text-sm">
                    Found {mockImages.length} images
                  </p>
                </div>

                <div className="flex gap-3 w-full sm:w-auto">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={selectAll}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-sm font-medium"
                  >
                    <CheckSquare className="size-4" />
                    Select All
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20"
                  >
                    <Package className="size-4" />
                    Download ZIP
                  </motion.button>

                  <div className="flex flex-col gap-3 mt-4 sm:mt-0 min-w-[200px]">
                    <div className="grid grid-cols-2 gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          shareToWhatsApp(
                            "extracted_images.zip",
                            "Extracted Images ZIP",
                            "application/zip",
                          )
                        }
                        className="flex flex-col items-center gap-1.5 p-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-all shadow-lg shadow-green-600/20"
                      >
                        <MessageCircle className="size-4" />
                        <span className="text-[10px] font-bold">Share</span>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          shareByEmail(
                            "extracted_images.zip",
                            "Extracted Images ZIP",
                            "application/zip",
                          )
                        }
                        className="flex flex-col items-center gap-1.5 p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all shadow-lg shadow-red-600/20"
                      >
                        <Mail className="size-4" />
                        <span className="text-[10px] font-bold">Email</span>
                      </motion.button>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        shareToDrive("extracted_images.zip", "application/zip")
                      }
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white transition-all shadow-lg shadow-yellow-600/20"
                    >
                      <Cloud className="size-4" />
                      <span className="text-[10px] font-bold">
                        Add to Google Drive
                      </span>
                    </motion.button>

                    <p className="text-[10px] text-center text-slate-500 italic mt-2">
                      Tip: On Desktop, you can drag your extracted ZIP directly
                      into WhatsApp or Drive without a separate download step!
                    </p>
                  </div>
                </div>
              </div>

              {/* Image Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {mockImages.map((image, index) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`glass-card rounded-xl overflow-hidden cursor-pointer transition-all ${
                      selectedImages.includes(image.id)
                        ? "ring-2 ring-primary"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => toggleImageSelection(image.id)}
                  >
                    {/* Image Preview */}
                    <div className="aspect-square bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                      <FileImage className="size-16 text-slate-400" />
                    </div>

                    {/* Info */}
                    <div className="p-3 flex justify-between items-center">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-primary truncate">
                          {image.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {image.dimensions} • {image.size}
                        </p>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="ml-2 p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-primary hover:text-white transition-colors"
                      >
                        <Download className="size-4" />
                      </motion.button>
                    </div>

                    {/* Selection Indicator */}
                    {selectedImages.includes(image.id) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 left-2 size-6 bg-primary rounded-full flex items-center justify-center text-white"
                      >
                        <CheckSquare className="size-4" />
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-slate-400 text-sm mb-4">
            <FileImage className="size-4" />
            <p>
              Privacy First: All processing happens in your browser. Files never
              leave your device.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
