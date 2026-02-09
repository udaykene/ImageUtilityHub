import { useState } from 'react';
import { motion } from 'framer-motion';
import { Maximize2, Download, Link2, Link2Off, MessageCircle, Mail, Cloud } from 'lucide-react';
import FileUpload from '@/components/FileUpload';

export default function Resize() {
  const [file, setFile] = useState(null);
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [originalDimensions, setOriginalDimensions] = useState(null);
  const [resizing, setResizing] = useState(false);

  const handleFileSelect = (selectedFile) => {
    if (selectedFile) {
      const img = new Image();
      img.onload = () => {
        setOriginalDimensions({ width: img.width, height: img.height });
        setWidth(img.width.toString());
        setHeight(img.height.toString());
      };
      img.src = URL.createObjectURL(selectedFile);
    }
    setFile(selectedFile);
  };

  const handleWidthChange = (newWidth) => {
    setWidth(newWidth);
    if (lockAspectRatio && originalDimensions && newWidth) {
      const ratio = originalDimensions.height / originalDimensions.width;
      setHeight(Math.round(parseInt(newWidth) * ratio).toString());
    }
  };

  const handleHeightChange = (newHeight) => {
    setHeight(newHeight);
    if (lockAspectRatio && originalDimensions && newHeight) {
      const ratio = originalDimensions.width / originalDimensions.height;
      setWidth(Math.round(parseInt(newHeight) * ratio).toString());
    }
  };

  const handleResize = () => {
    if (!file) return;
    setResizing(true);
    
    setTimeout(() => {
      setResizing(false);
    }, 2000);
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
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white">
              <Maximize2 className="size-6" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black">Image Resizer</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg max-w-2xl">
            Set perfect dimensions with pixel precision and smart aspect ratio lock for any platform.
          </p>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-7 space-y-6"
          >
            <FileUpload
              accept="image/*"
              maxSize={20}
              onFileSelect={handleFileSelect}
              title="Upload your image"
              subtitle="Supports JPG, PNG, WEBP, and TIFF up to 20MB"
            />

            {/* Current Stats */}
            {originalDimensions && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-xl p-6"
              >
                <h3 className="font-bold text-lg mb-4">Image Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <p className="text-xs text-slate-400 mb-1">Original Resolution</p>
                    <p className="text-xl font-bold">
                      {originalDimensions.width} × {originalDimensions.height} px
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <p className="text-xs text-slate-400 mb-1">File Size</p>
                    <p className="text-xl font-bold">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

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
                {/* Dimension Inputs */}
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
                          ? 'bg-primary/20 text-primary'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                      }`}
                      title={lockAspectRatio ? 'Aspect ratio locked' : 'Aspect ratio unlocked'}
                    >
                      {lockAspectRatio ? (
                        <Link2 className="size-5" />
                      ) : (
                        <Link2Off className="size-5" />
                      )}
                    </motion.button>

                    <div className="flex-1">
                      <label className="block text-sm font-semibold mb-2">Height (px)</label>
                      <input
                        type="number"
                        value={height}
                        onChange={(e) => handleHeightChange(e.target.value)}
                        placeholder="1080"
                        className="w-full px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-3 px-1 py-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={lockAspectRatio}
                      onChange={(e) => setLockAspectRatio(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-primary focus:ring-primary"
                    />
                    <span className="text-sm">Lock Aspect Ratio</span>
                  </label>
                </div>

                {/* Quick Presets */}
                <div className="pt-4 border-t border-white/5">
                  <p className="text-sm font-bold text-slate-400 mb-3">QUICK PRESETS</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Instagram', size: '1080×1080' },
                      { label: 'YouTube', size: '1920×1080' },
                      { label: 'Twitter', size: '1200×675' },
                      { label: 'Facebook', size: '1200×630' },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        className="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary/50 transition-all text-left"
                      >
                        <p className="text-xs font-bold">{preset.label}</p>
                        <p className="text-[10px] text-slate-400">{preset.size}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-6">
                  <motion.button
                    whileHover={{ scale: file ? 1.02 : 1 }}
                    whileTap={{ scale: file ? 0.98 : 1 }}
                    onClick={handleResize}
                    disabled={!file || !width || !height || resizing}
                    className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all ${
                      file && width && height && !resizing
                        ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {resizing ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
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
                    whileHover={{ scale: file && !resizing ? 1.02 : 1 }}
                    whileTap={{ scale: file && !resizing ? 0.98 : 1 }}
                    disabled={!file || resizing}
                    className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold border transition-all ${
                      file && !resizing
                        ? 'border-white/10 hover:bg-green-600 hover:border-green-600 text-white'
                        : 'border-white/5 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Download className="size-5" />
                    Download Output
                  </motion.button>

                  {/* Share Buttons */}
                  {file && !resizing && (
                    <div className="pt-4 border-t border-white/5">
                      <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">
                        Share Result
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => window.open('https://wa.me/?text=Check out my resized image!', '_blank')}
                          className="flex flex-col items-center gap-2 p-3 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
                        >
                          <MessageCircle className="size-5" />
                          <span className="text-xs font-medium">WhatsApp</span>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => window.location.href = 'mailto:?subject=Resized Image&body=Here is my resized image'}
                          className="flex flex-col items-center gap-2 p-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                        >
                          <Mail className="size-5" />
                          <span className="text-xs font-medium">Email</span>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => window.open('https://drive.google.com/drive/my-drive', '_blank')}
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
          </motion.div>
        </div>
      </div>
    </div>
  );
}