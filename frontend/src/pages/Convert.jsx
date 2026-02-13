import { useState } from "react";
import { motion } from "framer-motion";
import {
  RefreshCw,
  Download,
  Sparkles,
  MessageCircle,
  Mail,
  Cloud,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import FileUpload from "@/components/FileUpload";
import { convertImage, downloadFile } from "@/services/api";

const formats = [
  {
    value: "jpg",
    label: "JPG",
    description: "Standard format for photographs with good compression",
  },
  {
    value: "png",
    label: "PNG",
    description: "Lossless compression with transparency support",
  },
  {
    value: "webp",
    label: "WebP",
    description: "Modern format with superior compression",
  },
  {
    value: "avif",
    label: "AVIF",
    description: "Next-generation format with excellent compression",
  },
];


export default function Convert() {
  // Email share handler
  const handleEmailShare = () => {
    try {
      const subject = "Check out my converted image!";
      const body =
        "I wanted to share this converted image with you.\n\nCreated with FormatFlow.";
      const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      // Create and click a temporary link
      const a = document.createElement("a");
      a.href = mailtoLink;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      // Fallback: Show alert
      alert(
        "Please open your email client and compose a new email to share your file.\n\nSubject: Check out my converted image!",
      );
    }
  };

  const [file, setFile] = useState(null);
  const [targetFormat, setTargetFormat] = useState("webp");
  const [converting, setConverting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setResult(null);
    setError(null);
  };

  const handleConvert = async () => {
    if (!file) return;
    setConverting(true);
    setError(null);
    setResult(null);

    try {
      const response = await convertImage(file, {
        outputFormat: targetFormat,
      });
      setResult(response);
    } catch (err) {
      console.error("Conversion error:", err);
      setError(err.response?.data?.message || "Failed to convert image");
    } finally {
      setConverting(false);
    }
  };

  const handleDownload = () => {
    const filename = result?.data?.filename || result?.filename;
    if (filename) {
      downloadFile(filename);
    }
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
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
              <RefreshCw className="size-6" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black">
              Format Conversion
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg max-w-2xl">
            Convert between PNG, JPG, WebP, and AVIF formats with high fidelity
            and batch support.
          </p>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-8 space-y-6"
          >
            <FileUpload
              accept="image/*"
              maxSize={20}
              onFileSelect={handleFileSelect}
              title="Drag & drop your image"
              subtitle="Supports all major image formats up to 20MB"
            />

            {/* Preview */}
            {file && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-6"
              >
                <h3 className="font-bold text-lg mb-4">Preview</h3>
                <div className="aspect-video w-full bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Right Column - Settings */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-4"
          >
            <div className="glass-card rounded-xl p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="size-5 text-primary" />
                <h2 className="text-xl font-bold">Settings</h2>
              </div>

              <div className="space-y-6">
                {/* Output Format Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                    Output Format
                  </label>
                  <select
                    value={targetFormat}
                    onChange={(e) => setTargetFormat(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-2 focus:ring-primary outline-none transition-all text-sm font-medium cursor-pointer"
                  >
                    {formats.map((format) => (
                      <option key={format.value} value={format.value}>
                        {format.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {formats.find((f) => f.value === targetFormat)?.description}
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Status Messages */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm"
                    >
                      <AlertCircle className="size-5 shrink-0" />
                      <p>{error}</p>
                    </motion.div>
                  )}

                  {result && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex flex-col gap-2"
                    >
                      <div className="flex items-center gap-3 text-green-400 text-sm font-bold">
                        <CheckCircle2 className="size-5 shrink-0" />
                        <p>Conversion Successful!</p>
                      </div>
                      <div className="space-y-1 pl-8">
                        <p className="text-xs text-slate-400">
                          New Size:{" "}
                          <span className="text-green-400 font-bold">
                            {result.data?.compressedSize ||
                              result.compressedSize}
                          </span>
                        </p>
                        <p className="text-xs text-slate-400">
                          Format:{" "}
                          <span className="text-green-400 uppercase font-bold">
                            {targetFormat}
                          </span>
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Actions */}
                  <div className="space-y-3 pt-4">
                    <motion.button
                      whileHover={{ scale: file ? 1.02 : 1 }}
                      whileTap={{ scale: file ? 0.98 : 1 }}
                      onClick={handleConvert}
                      disabled={!file || converting}
                      className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all ${
                        file && !converting
                          ? "bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                          : "bg-slate-800 text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      {converting ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          >
                            <RefreshCw className="size-5" />
                          </motion.div>
                          Converting...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="size-5" />
                          Convert Now
                        </>
                      )}
                    </motion.button>

                    <motion.button
                      whileHover={{
                        scale: result || (file && !converting) ? 1.02 : 1,
                      }}
                      whileTap={{
                        scale: result || (file && !converting) ? 0.98 : 1,
                      }}
                      onClick={handleDownload}
                      disabled={!result || converting}
                      className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold border transition-all ${
                        result && !converting
                          ? "border-white/10 hover:bg-purple-600 hover:border-purple-600 text-white shadow-lg shadow-purple-500/20"
                          : "border-white/5 text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      <Download className="size-5" />
                      Download
                    </motion.button>
                  </div>

                  {/* Share Buttons */}
                  {file && !converting && (
                    <div className="pt-4 border-t border-white/5">
                      <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">
                        Share Result
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            window.open(
                              "https://wa.me/?text=Check out my file!",
                              "_blank",
                            )
                          }
                          className="flex flex-col items-center gap-2 p-3 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
                        >
                          <MessageCircle className="size-5" />
                          <span className="text-xs font-medium">WhatsApp</span>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleEmailShare}
                          className="flex flex-col items-center gap-2 p-3 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                        >
                          <Mail className="size-5" />
                          <span className="text-xs font-medium">Email</span>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            window.open(
                              "https://drive.google.com/drive/my-drive",
                              "_blank",
                            )
                          }
                          className="flex flex-col items-center gap-2 p-3 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white transition-colors"
                        >
                          <Cloud className="size-5" />
                          <span className="text-xs font-medium">Drive</span>
                        </motion.button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Info Box */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20"
            >
              <p className="text-sm text-blue-200 flex items-start gap-2">
                <Sparkles className="size-4 mt-0.5 flex-shrink-0" />
                <span>
                  WebP and AVIF formats offer better compression while
                  maintaining quality
                </span>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
