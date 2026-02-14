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
import { shareToWhatsApp, shareByEmail, shareToDrive } from "@/utils/share";
import { extractImagesFromPDF, downloadFile } from "@/services/api";

export default function Extract() {
  const [file, setFile] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState(0);
  const [selectedImages, setSelectedImages] = useState([]);

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
    } catch (error) {
      console.error("Extraction failed:", error);
      alert("Failed to extract images. Please try again with a different PDF.");
    } finally {
      setExtracting(false);
    }
  };

  const toggleImageSelection = (name) => {
    setSelectedImages((prev) =>
      prev.includes(name)
        ? prev.filter((img) => img !== name)
        : [...prev, name],
    );
  };

  const selectAll = () => {
    if (result?.images) {
      setSelectedImages(result.images.map((img) => img.name));
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
            Extract all embedded images from PDF documents in their original
            resolution and quality.
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
                        className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 font-bold transition-all text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleExtract}
                        className="flex-[2] py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
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
                  Successfully extracted <b>{result.imageCount}</b> images from
                  your PDF.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button
                  onClick={reset}
                  className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 font-bold transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <RefreshCcw className="size-4" />
                  New Project
                </button>
                <button
                  onClick={() => downloadFile(result.filename)}
                  className="px-8 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="size-5" />
                  Download ZIP
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
                      onClick={() => toggleImageSelection(img.name)}
                      className={`group relative glass-card rounded-2xl p-3 cursor-pointer transition-all border-2 ${
                        selectedImages.includes(img.name)
                          ? "border-primary bg-primary/5"
                          : "border-transparent hover:border-white/10"
                      }`}
                    >
                      <div className="aspect-square rounded-xl bg-slate-100 dark:bg-white/5 mb-3 flex items-center justify-center overflow-hidden">
                        <FileImage className="size-10 text-slate-300 group-hover:scale-110 transition-transform" />
                      </div>
                      <p className="text-[10px] font-black truncate">
                        {img.name}
                      </p>
                      <p className="text-[10px] text-slate-400">{img.size}</p>

                      {selectedImages.includes(img.name) && (
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
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <MessageCircle className="size-5 text-primary" />
                    Share ZIP Package
                  </h3>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() =>
                          shareToWhatsApp(
                            result.filename,
                            "PDF Images",
                            "application/zip",
                          )
                        }
                        className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-green-600/10 hover:bg-green-600/20 text-green-600 transition-all border border-green-600/10"
                      >
                        <MessageCircle className="size-6" />
                        <span className="text-[10px] font-black uppercase">
                          WhatsApp
                        </span>
                      </button>
                      <button
                        onClick={() =>
                          shareByEmail(
                            result.filename,
                            "Extracted PDF Images",
                            "application/zip",
                          )
                        }
                        className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-red-600/10 hover:bg-red-600/20 text-red-600 transition-all border border-red-600/10"
                      >
                        <Mail className="size-6" />
                        <span className="text-[10px] font-black uppercase">
                          Email
                        </span>
                      </button>
                    </div>

                    <button
                      onClick={() =>
                        shareToDrive(result.filename, "application/zip")
                      }
                      className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-600 transition-all border border-yellow-500/10"
                    >
                      <Cloud className="size-5" />
                      <span className="text-xs font-black uppercase tracking-wider">
                        Save to Google Drive
                      </span>
                    </button>

                    <div className="pt-4 mt-4 border-t border-white/5">
                      <p className="text-[10px] text-slate-500 italic text-center leading-relaxed">
                        Tip: You can also drag the ZIP file directly into your
                        apps after downloading it.
                      </p>
                    </div>
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
                Secure Image Extraction: Only embedded image streams are
                extracted. Original resolution preserved.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
