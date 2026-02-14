import { useState } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  Download,
  Settings,
  Info,
  MessageCircle,
  Mail,
  Cloud,
  ArrowLeftRight,
  Check,
} from "lucide-react";
import FileUpload from "@/components/FileUpload";
import { ToolShapeDecoration } from "@/components/Shapes";
import { compressImage, downloadFile, getDownloadUrl } from "@/services/api";
import { shareToWhatsApp, shareByEmail, shareToDrive } from "@/utils/share";

export default function Compress() {
  const [file, setFile] = useState(null);
  const [quality, setQuality] = useState(80);
  const [targetSize, setTargetSize] = useState("");
  const [outputFormat, setOutputFormat] = useState("original");
  const [stripMetadata, setStripMetadata] = useState(true);
  const [converting, setConverting] = useState(false);
  const [activePreset, setActivePreset] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const compressionPresets = [
    {
      id: "web",
      label: "Web Optimized",
      quality: 80,
      description: "Best for websites",
    },
    {
      id: "high",
      label: "High Quality",
      quality: 90,
      description: "Minimal loss",
    },
    {
      id: "max",
      label: "Maximum Compression",
      quality: 60,
      description: "Smallest size",
    },
  ];

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
  };

  const handlePresetClick = (preset) => {
    setQuality(preset.quality);
    setActivePreset(preset.id);
    setTargetSize("");
  };

  const handleTargetSizeChange = (e) => {
    setTargetSize(e.target.value);
    setActivePreset(null);
  };

  const handleCompress = async () => {
    if (!file) return;
    setConverting(true);
    setError(null);
    setResult(null);

    try {
      const response = await compressImage(file, {
        quality,
        targetSize,
        outputFormat,
        stripMetadata,
      });
      setResult(response);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to compress image");
    } finally {
      setConverting(false);
    }
  };

  const handleDownload = () => {
    if (result && (result.data?.filename || result.filename)) {
      downloadFile(result.data?.filename || result.filename);
    }
  };

  const getEstimatedSize = () => {
    if (!file) return 0;
    if (targetSize) return parseFloat(targetSize);
    return (file.size * (quality / 100)) / 1024;
  };

  const originalSizeKB = file ? (file.size / 1024).toFixed(2) : 0;
  const estimatedSizeKB = result
    ? parseFloat(result.data?.compressedSize || result.compressedSize)
    : parseFloat(getEstimatedSize().toFixed(2));
  const savingsPercent = result
    ? result.data?.savings || result.savings
    : file
      ? ((1 - estimatedSizeKB / originalSizeKB) * 100).toFixed(0)
      : 0;

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
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
              <Zap className="size-6" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black">
              Image Compression
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg max-w-2xl">
            Reduce file size by up to 90% without losing visible quality.
            Perfect for web speed optimization.
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* Left Column - Upload & Preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-8 flex flex-col gap-6"
          >
            <FileUpload
              accept="image/*"
              maxSize={20}
              onFileSelect={handleFileSelect}
              title="Drag & drop your image here"
              subtitle="Supports JPG, PNG, and WebP up to 20MB"
            />

            {error && (
              <div className="glass-card rounded-xl p-4 border-2 border-red-500/50 bg-red-500/10">
                <p className="text-red-500 font-medium">{error}</p>
              </div>
            )}

            {file && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    {result ? (
                      <>
                        <Check className="size-5 text-green-500" /> Compression
                        Result
                      </>
                    ) : (
                      <>
                        <Info className="size-5 text-primary" /> Image Preview
                      </>
                    )}
                  </h3>
                </div>

                <div className="glass-card rounded-xl overflow-hidden">
                  {!result ? (
                    <div className="relative aspect-video w-full bg-slate-100 dark:bg-slate-800">
                      <img
                        src={URL.createObjectURL(file)}
                        alt="Original"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 border-b border-white/5">
                        <div className="p-4 bg-black/20 flex justify-between items-center text-xs">
                          <span className="font-bold text-primary uppercase">
                            Before
                          </span>
                          <span className="text-slate-400">
                            {originalSizeKB} KB
                          </span>
                        </div>
                        <div className="p-4 bg-primary/10 flex justify-between items-center text-xs border-l border-white/5">
                          <span className="font-bold text-primary uppercase">
                            After
                          </span>
                          <span className="text-green-400 font-bold">
                            {estimatedSizeKB.toFixed(2)} KB (-{savingsPercent}%)
                          </span>
                        </div>
                      </div>
                      <div className="relative aspect-video w-full bg-slate-100 dark:bg-slate-800">
                        <div className="absolute inset-0">
                          <img
                            src={URL.createObjectURL(file)}
                            alt="Before"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div
                          className="absolute inset-0"
                          style={{ clipPath: "inset(0 0 0 50%)" }}
                        >
                          <img
                            src={getDownloadUrl(
                              result.data?.filename || result.filename,
                            )}
                            alt="After"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white shadow-lg z-10" />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Desktop Info Cards - snapped under preview */}
            <div className="hidden lg:grid grid-cols-3 gap-4 pt-2">
              <InfoCardsContent />
            </div>
          </motion.div>

          {/* Right Column - Settings */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-4"
          >
            <div className="glass-card rounded-xl p-6 sticky top-24 space-y-6">
              <div className="flex items-center gap-2">
                <Settings className="size-5 text-primary" />
                <h2 className="text-xl font-bold">Compression Settings</h2>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/5">
                <label className="text-sm font-medium text-slate-400">
                  Quick Presets
                </label>
                <select
                  value={activePreset || ""}
                  onChange={(e) => {
                    const preset = compressionPresets.find(
                      (p) => p.id === e.target.value,
                    );
                    if (preset) handlePresetClick(preset);
                  }}
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-white/10 text-white outline-none"
                >
                  <option value="">Select a preset...</option>
                  {compressionPresets.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.label} ({preset.quality}%)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/5">
                <label className="text-sm font-medium text-slate-400">
                  Target Size (KB)
                </label>
                <input
                  type="number"
                  value={targetSize}
                  onChange={handleTargetSizeChange}
                  placeholder="e.g., 500"
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-white/10 text-white outline-none"
                />
              </div>

              {!targetSize && (
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex justify-between items-center text-sm">
                    <label className="font-medium text-slate-400">
                      Compression Level
                    </label>
                    <span className="text-primary font-bold">{quality}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="95"
                    value={quality}
                    onChange={(e) => {
                      setQuality(parseInt(e.target.value));
                      setActivePreset(null);
                    }}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              )}

              <div className="pt-6 border-t border-white/5 space-y-3">
                <button
                  onClick={handleCompress}
                  disabled={!file || converting}
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold ${
                    file && !converting
                      ? "bg-primary text-white"
                      : "bg-slate-800 text-slate-500"
                  }`}
                >
                  {converting ? "Compressing..." : "Compress Now"}
                </button>
                <button
                  onClick={handleDownload}
                  disabled={!result}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold border border-white/10"
                >
                  <Download className="size-5" /> Download
                </button>

                {result && !converting && (
                  <div className="pt-4 border-t border-white/5 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          shareToWhatsApp(
                            result.data?.filename || result.filename,
                            "Check out my compressed image!",
                          )
                        }
                        className="flex flex-col items-center gap-2 p-3 rounded-xl bg-green-600 hover:bg-green-700 text-white transition-all shadow-lg shadow-green-600/20"
                      >
                        <MessageCircle className="size-5" />
                        <span className="text-xs font-bold">
                          WhatsApp / Share
                        </span>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          shareByEmail(
                            result.data?.filename || result.filename,
                            "My Compressed Image",
                          )
                        }
                        className="flex flex-col items-center gap-2 p-3 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-all shadow-lg shadow-red-600/20"
                      >
                        <Mail className="size-5" />
                        <span className="text-xs font-bold">Email</span>
                      </motion.button>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        shareToDrive(result.data?.filename || result.filename)
                      }
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-yellow-600 hover:bg-yellow-700 text-white transition-all shadow-lg shadow-yellow-600/20"
                    >
                      <Cloud className="size-5" />
                      <span className="text-sm font-bold">
                        Add to Google Drive
                      </span>
                    </motion.button>

                    <p className="text-[10px] text-center text-slate-500 italic">
                      Tip: On Desktop, images are copied to your clipboard
                      automatically. Just Paste (Ctrl+V) to share!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Mobile Info Cards - appears at bottom after Settings */}
          <div className="lg:hidden col-span-1 mt-4">
            <div className="grid grid-cols-1 gap-4">
              <InfoCardsContent />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCardsContent() {
  return (
    <>
      <div className="glass-card rounded-xl p-6 text-center">
        <Zap className="size-8 text-primary mx-auto mb-2" />
        <h4 className="font-bold">Lightning Fast</h4>
        <p className="text-xs text-slate-400 mt-1">Process in seconds</p>
      </div>
      <div className="glass-card rounded-xl p-6 text-center">
        <Settings className="size-8 text-primary mx-auto mb-2" />
        <h4 className="font-bold">Fine Control</h4>
        <p className="text-xs text-slate-400 mt-1">Adjust quality levels</p>
      </div>
      <div className="glass-card rounded-xl p-6 text-center">
        <Info className="size-8 text-primary mx-auto mb-2" />
        <h4 className="font-bold">No Quality Loss</h4>
        <p className="text-xs text-slate-400 mt-1">Visually identical</p>
      </div>
    </>
  );
}
