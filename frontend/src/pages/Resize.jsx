import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Maximize2,
  Download,
  Link2,
  Link2Off,
  MessageCircle,
  Mail,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Info,
  ChevronRight,
} from "lucide-react";
import FileUpload from "@/components/FileUpload";
import { resizeImage, downloadFile, getDownloadUrl } from "@/services/api";

export default function Resize() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [originalDimensions, setOriginalDimensions] = useState(null);
  const [resizing, setResizing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activePreset, setActivePreset] = useState(null);

  const [resizeMode, setResizeMode] = useState("pixels"); // "pixels" or "percentage"
  const [percentage, setPercentage] = useState("100");

  // Handle preview URL cleanup to prevent memory leaks
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      setOriginalDimensions(null);
      setWidth("");
      setHeight("");
      setResult(null);
      setError(null);
      setActivePreset(null);
      setPercentage("100");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    const img = new Image();
    img.onload = () => {
      setOriginalDimensions({ width: img.width, height: img.height });
      setWidth(img.width.toString());
      setHeight(img.height.toString());
    };
    img.src = objectUrl;

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  const handleResize = async () => {
    if (resizing || !file) return;

    let targetWidth, targetHeight;

    setError(null);

    // ---- PIXELS MODE ----
    if (resizeMode === "pixels") {
      const w = parseInt(width);
      const h = parseInt(height);

      if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
        setError("Width and height must be positive numbers");
        return;
      }

      if (w > 10000 || h > 10000) {
        setError("Dimensions cannot exceed 10,000 pixels");
        return;
      }

      targetWidth = w;
      targetHeight = h;
    }

    // ---- PERCENTAGE MODE ----
    if (resizeMode === "percentage") {
      if (!originalDimensions) return;

      const percentValue = parseInt(percentage);

      if (isNaN(percentValue) || percentValue <= 0 || percentValue > 500) {
        setError("Invalid percentage value (1–500 allowed)");
        return;
      }

      const ratio = percentValue / 100;
      targetWidth = Math.round(originalDimensions.width * ratio);
      targetHeight = Math.round(originalDimensions.height * ratio);

      if (targetWidth > 10000 || targetHeight > 10000) {
        setError("Resulting dimensions exceed 10,000 pixels");
        return;
      }
    }

    setResizing(true);
    setResult(null);

    try {
      const response = await resizeImage(file, {
        width: targetWidth,
        height: targetHeight,
        maintainAspectRatio: lockAspectRatio,
      });

      setResult(response.data || response);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resize image");
    } finally {
      setResizing(false);
    }
  };

  const handleDownload = () => {
    const filename = result?.filename;
    if (filename) {
      downloadFile(filename);
    }
  };

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Page Header */}
        <Header />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* Left Column - Upload & Preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-7 space-y-6"
          >
            <FileUpload
              accept="image/*"
              maxSize={20}
              onFileSelect={setFile}
              title="Upload your image"
              subtitle="Supports JPG, PNG, WEBP, and TIFF up to 20MB"
            />

            {originalDimensions && file && (
              <ImageStats
                dimensions={originalDimensions}
                fileSize={(file.size / (1024 * 1024)).toFixed(2)}
              />
            )}

            {previewUrl && (
              <PreviewPanel originalUrl={previewUrl} result={result} />
            )}
          </motion.div>

          {/* Right Column - Configuration */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-5"
          >
            <div className="glass-card rounded-xl p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <Maximize2 className="size-5 text-primary" />
                <h2 className="text-xl font-bold">Configuration</h2>
              </div>

              <div className="space-y-6">
                {/* Mode Toggle */}
                <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
                  <button
                    onClick={() => setResizeMode("pixels")}
                    className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
                      resizeMode === "pixels"
                        ? "bg-white dark:bg-slate-800 shadow-sm text-primary"
                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    }`}
                  >
                    Pixels
                  </button>
                  <button
                    onClick={() => setResizeMode("percentage")}
                    className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
                      resizeMode === "percentage"
                        ? "bg-white dark:bg-slate-800 shadow-sm text-primary"
                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    }`}
                  >
                    Percentage
                  </button>
                </div>

                {resizeMode === "pixels" ? (
                  <ResizeInputs
                    width={width}
                    height={height}
                    setWidth={setWidth}
                    setHeight={setHeight}
                    lockAspectRatio={lockAspectRatio}
                    setLockAspectRatio={setLockAspectRatio}
                    originalDimensions={originalDimensions}
                    setActivePreset={setActivePreset}
                  />
                ) : (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-semibold">
                          Scale Percentage
                        </label>
                        <span className="text-primary font-bold">
                          {percentage}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="200"
                        value={percentage}
                        onChange={(e) => setPercentage(e.target.value)}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 mt-2 uppercase font-bold tracking-wider">
                        <span>1%</span>
                        <span>100% (Original)</span>
                        <span>200%</span>
                      </div>
                    </div>
                  </div>
                )}

                <PresetGrid
                  activePreset={activePreset}
                  setActivePreset={setActivePreset}
                  setLockAspectRatio={setLockAspectRatio}
                  setWidth={setWidth}
                  setHeight={setHeight}
                />
                <ActionPanel
                  file={file}
                  width={width}
                  height={height}
                  resizing={resizing}
                  error={error}
                  result={result}
                  resizeMode={resizeMode}
                  percentage={percentage}
                  onResize={handleResize}
                  onDownload={handleDownload}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 sm:mb-12"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white">
          <Maximize2 className="size-6" />
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black">
          Image Resizer
        </h1>
      </div>
      <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg max-w-2xl">
        Set perfect dimensions with pixel precision and smart aspect ratio lock
        for any platform.
      </p>
    </motion.div>
  );
}

function ImageStats({ dimensions, fileSize }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-6"
    >
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        <Info className="size-5 text-primary" />
        Image Statistics
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-400 mb-1">Original Resolution</p>
          <p className="text-xl font-bold">
            {dimensions.width} × {dimensions.height} px
          </p>
        </div>
        <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-400 mb-1">File Size</p>
          <p className="text-xl font-bold">{fileSize} MB</p>
        </div>
      </div>
    </motion.div>
  );
}

function PreviewPanel({ originalUrl, result }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-6"
    >
      <h3 className="font-bold text-lg mb-4">Preview</h3>
      {!result ? (
        <div className="aspect-video w-full bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden relative">
          <img
            src={originalUrl}
            alt="Original Preview"
            className="w-full h-full object-contain"
          />
          <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-xs font-bold text-white border border-white/10">
            Original
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Before
            </p>
            <div className="aspect-square w-full bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden relative border border-white/5">
              <img
                src={originalUrl}
                alt="Before"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-bold text-primary uppercase tracking-wider">
              After (Resized)
            </p>
            <div className="aspect-square w-full bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden relative border border-primary/20 bg-primary/5">
              <img
                src={getDownloadUrl(result.filename)}
                alt="After"
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-primary/20 p-4 rounded-full backdrop-blur-sm"
                >
                  <CheckCircle2 className="size-12 text-primary" />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function ResizeInputs({
  width,
  height,
  setWidth,
  setHeight,
  lockAspectRatio,
  setLockAspectRatio,
  originalDimensions,
  setActivePreset,
}) {
  const handleWidthChange = (newWidth) => {
    setWidth(newWidth);
    setActivePreset(null);

    if (lockAspectRatio && originalDimensions) {
      const parsed = parseInt(newWidth);

      if (!isNaN(parsed)) {
        const ratio = originalDimensions.height / originalDimensions.width;
        setHeight(Math.round(parsed * ratio).toString());
      }
    }
  };

  const handleHeightChange = (newHeight) => {
    setHeight(newHeight);
    setActivePreset(null);

    if (lockAspectRatio && originalDimensions) {
      const parsed = parseInt(newHeight);

      if (!isNaN(parsed)) {
        const ratio = originalDimensions.width / originalDimensions.height;
        setWidth(Math.round(parsed * ratio).toString());
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-semibold mb-2">Width (px)</label>
          <input
            type="number"
            value={width}
            onChange={(e) => handleWidthChange(e.target.value)}
            placeholder="1920"
            className="w-full px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setLockAspectRatio(!lockAspectRatio)}
          className={`p-3 rounded-full transition-colors ${
            lockAspectRatio
              ? "bg-primary/20 text-primary"
              : "bg-slate-200 dark:bg-slate-800 text-slate-400"
          }`}
          title={
            lockAspectRatio ? "Aspect ratio locked" : "Aspect ratio unlocked"
          }
        >
          {lockAspectRatio ? (
            <Link2 className="size-5" />
          ) : (
            <Link2Off className="size-5" />
          )}
        </motion.button>

        <div className="flex-1">
          <label className="block text-sm font-semibold mb-2">
            Height (px)
          </label>
          <input
            type="number"
            value={height}
            onChange={(e) => handleHeightChange(e.target.value)}
            placeholder="1080"
            className="w-full px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          />
        </div>
      </div>

      <label className="flex items-center gap-3 px-1 py-2 cursor-pointer group">
        <input
          type="checkbox"
          checked={lockAspectRatio}
          onChange={(e) => setLockAspectRatio(e.target.checked)}
          className="w-5 h-5 rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary"
        />
        <span className="text-sm group-hover:text-primary transition-colors">
          Lock Aspect Ratio
        </span>
      </label>
    </div>
  );
}

function PresetGrid({
  activePreset,
  setActivePreset,
  setLockAspectRatio,
  setWidth,
  setHeight,
}) {
  const presets = [
    { label: "Instagram", size: "1080×1080" },
    { label: "YouTube", size: "1920×1080" },
    { label: "Twitter", size: "1200×675" },
    { label: "Facebook", size: "1200×630" },
  ];

  const handlePresetClick = (preset) => {
    const [w, h] = preset.size.split("×").map((s) => s.trim());
    setLockAspectRatio(false);
    setWidth(w);
    setHeight(h);
    setActivePreset(preset.label);
  };

  return (
    <div className="pt-4 border-t border-white/5">
      <p className="text-xs font-bold text-slate-400 mb-3 tracking-widest uppercase">
        Quick Presets
      </p>
      <div className="grid grid-cols-2 gap-2">
        {presets.map((preset) => (
          <button
            key={preset.label}
            onClick={() => handlePresetClick(preset)}
            className={`p-3 rounded-lg border transition-all text-left group ${
              activePreset === preset.label
                ? "bg-primary/10 border-primary text-primary"
                : "bg-white/5 hover:bg-white/10 border-white/5 hover:border-primary/50"
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <p className="text-xs font-bold">{preset.label}</p>
              <ChevronRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-[10px] text-slate-400">{preset.size}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function ActionPanel({
  file,
  width,
  height,
  resizing,
  error,
  result,
  resizeMode,
  percentage,
  onResize,
  onDownload,
}) {
  return (
    <div className="space-y-4 pt-4 border-t border-white/5">
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm overflow-hidden"
          >
            <AlertCircle className="size-5 shrink-0" />
            <p>{error}</p>
          </motion.div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex flex-col gap-2 overflow-hidden"
          >
            <div className="flex items-center gap-3 text-green-400 text-sm font-bold">
              <CheckCircle2 className="size-5 shrink-0" />
              <p>Resizing Successful!</p>
            </div>
            <div className="space-y-1 pl-8 text-xs text-slate-400">
              <p>
                New Dimensions:{" "}
                <span className="text-green-400 font-bold">
                  {result.newDimensions}
                </span>
              </p>
              <p>
                New Size:{" "}
                <span className="text-green-400 font-bold">
                  {result.resizedSize}
                </span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        <motion.button
          whileHover={{
            scale: file && width && height && !resizing ? 1.02 : 1,
          }}
          whileTap={{ scale: file && width && height && !resizing ? 0.98 : 1 }}
          onClick={onResize}
          disabled={
            !file ||
            resizing ||
            (resizeMode === "pixels" && (!width || !height)) ||
            (resizeMode === "percentage" && !percentage)
          }
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all ${
            file && width && height && !resizing
              ? "bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
              : "bg-slate-800 text-slate-500 cursor-not-allowed"
          }`}
        >
          {resizing ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Maximize2 className="size-5" />
              </motion.div>
              Resizing...
            </>
          ) : (
            <>
              <Maximize2 className="size-5" />
              Resize Image
            </>
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: result && !resizing ? 1.02 : 1 }}
          whileTap={{ scale: result && !resizing ? 0.98 : 1 }}
          onClick={onDownload}
          disabled={!result || resizing}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold border transition-all ${
            result && !resizing
              ? "border-white/10 hover:bg-purple-600 hover:border-purple-600 text-white"
              : "border-white/5 text-slate-500 cursor-not-allowed"
          }`}
        >
          <Download className="size-5" />
          Download
        </motion.button>
      </div>
      {result && !resizing && <ShareActions />}
    </div>
  );
}

function ShareActions() {
  return (
    <div className="pt-4 border-t border-white/5">
      <p className="text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-widest">
        Share Result
      </p>
      <div className="grid grid-cols-3 gap-2">
        <ShareButton
          color="bg-green-600"
          icon={MessageCircle}
          label="WhatsApp"
          onClick={() =>
            window.open("https://wa.me/?text=Check out my image!", "_blank")
          }
        />
        <ShareButton
          color="bg-red-600"
          icon={Mail}
          label="Email"
          onClick={() =>
            (window.location.href = "mailto:?subject=Resized Image")
          }
        />
        <ShareButton
          color="bg-yellow-600"
          icon={Cloud}
          label="Drive"
          onClick={() =>
            window.open("https://drive.google.com/drive/my-drive", "_blank")
          }
        />
      </div>
    </div>
  );
}

function ShareButton({ color, icon: Icon, label, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-3 rounded-lg ${color} text-white transition-colors`}
    >
      <Icon className="size-5" />
      <span className="text-[10px] font-bold uppercase">{label}</span>
    </motion.button>
  );
}
