import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FilePlus, Download, X, GripVertical, Settings, MessageCircle, Mail, Cloud } from 'lucide-react';
import FileUpload from '@/components/FileUpload';

export default function ImagesToPDF() {
  const [images, setImages] = useState([]);
  const [orientation, setOrientation] = useState('portrait');
  const [margin, setMargin] = useState('none');
  const [pageSize, setPageSize] = useState('a4');
  const [generating, setGenerating] = useState(false);

  const handleFileSelect = (selectedFile) => {
    if (selectedFile) {
      setImages((prev) => [
        ...prev,
        {
          id: Date.now(),
          file: selectedFile,
          name: selectedFile.name,
          size: selectedFile.size,
        },
      ]);
    }
  };

  const removeImage = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const clearAll = () => {
    setImages([]);
  };

  const handleGenerate = () => {
    if (images.length === 0) return;
    setGenerating(true);

    setTimeout(() => {
      setGenerating(false);
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
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
              <FilePlus className="size-6" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black">Images to PDF</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg max-w-2xl">
            Combine multiple images into a single, professional PDF document with custom page settings.
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
            {/* Upload Area */}
            <div className="glass-card rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-8 hover:border-primary/50 transition-all">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="p-4 rounded-full bg-primary/10 text-primary">
                  <FilePlus className="size-8" />
                </div>
                <div>
                  <p className="text-lg font-bold mb-1">Add more images</p>
                  <p className="text-sm text-slate-400">Drag and drop JPG, PNG, or TIFF files here</p>
                </div>

                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                      e.target.value = '';
                    }}
                  />
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-primary text-sm"
                  >
                    Upload Images
                  </motion.div>
                </label>
              </div>
            </div>

            {/* Images List */}
            {images.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <FilePlus className="size-5" />
                    Selected Images ({images.length})
                  </h3>
                  <button
                    onClick={clearAll}
                    className="text-sm text-red-500 font-medium flex items-center gap-1 hover:underline"
                  >
                    <X className="size-4" />
                    Clear All
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                  <AnimatePresence>
                    {images.map((image, index) => (
                      <motion.div
                        key={image.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="group relative aspect-[3/4] rounded-xl overflow-hidden glass-card hover:border-primary transition-all cursor-grab active:cursor-grabbing"
                      >
                        {/* Image Preview */}
                        <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <img
                            src={URL.createObjectURL(image.file)}
                            alt={image.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-60" />

                        {/* Order Badge */}
                        <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                          {String(index + 1).padStart(2, '0')}
                        </div>

                        {/* Remove Button */}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeImage(image.id)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          <X className="size-4" />
                        </motion.button>

                        {/* Drag Handle */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <GripVertical className="size-8 text-white drop-shadow-lg" />
                        </div>

                        {/* Filename */}
                        <div className="absolute bottom-3 left-3 right-3">
                          <p className="text-white text-xs font-medium truncate">{image.name}</p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Right Column - Configuration */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-4"
          >
            <div className="glass-card rounded-xl p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <Settings className="size-5 text-primary" />
                <h2 className="text-xl font-bold">PDF Configuration</h2>
              </div>

              <div className="space-y-6">
                {/* Page Orientation */}
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">
                    Page Orientation
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
                    <button
                      onClick={() => setOrientation('portrait')}
                      className={`py-2 rounded-md font-bold text-sm transition-all ${
                        orientation === 'portrait'
                          ? 'bg-white dark:bg-primary text-slate-900 dark:text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      Portrait
                    </button>
                    <button
                      onClick={() => setOrientation('landscape')}
                      className={`py-2 rounded-md font-bold text-sm transition-all ${
                        orientation === 'landscape'
                          ? 'bg-white dark:bg-primary text-slate-900 dark:text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      Landscape
                    </button>
                  </div>
                </div>

                {/* Margin Size */}
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">
                    Margin Size
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'none', label: 'None (Full bleed)' },
                      { value: 'small', label: 'Small (0.5 inch)' },
                      { value: 'large', label: 'Large (1.0 inch)' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          margin === option.value
                            ? 'border-primary bg-primary/5'
                            : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="margin"
                          checked={margin === option.value}
                          onChange={() => setMargin(option.value)}
                          className="w-4 h-4 text-primary focus:ring-primary"
                        />
                        <span className="text-sm font-medium">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Page Size */}
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">
                    Page Size
                  </label>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-lg text-sm font-medium py-3 px-4 focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option value="a4">A4 (210 × 297 mm)</option>
                    <option value="letter">Letter (8.5 × 11 in)</option>
                    <option value="legal">Legal (8.5 × 14 in)</option>
                    <option value="auto">Auto (Fit to image size)</option>
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-6 border-t border-white/5">
                  <motion.button
                    whileHover={{ scale: images.length > 0 ? 1.02 : 1 }}
                    whileTap={{ scale: images.length > 0 ? 0.98 : 1 }}
                    onClick={handleGenerate}
                    disabled={images.length === 0 || generating}
                    className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all ${
                      images.length > 0 && !generating
                        ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {generating ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <FilePlus className="size-5" />
                        </motion.div>
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <FilePlus className="size-5" />
                        Generate PDF
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: images.length > 0 ? 1.02 : 1 }}
                    whileTap={{ scale: images.length > 0 ? 0.98 : 1 }}
                    disabled={images.length === 0}
                    className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold border transition-all ${
                      images.length > 0
                        ? 'border-white/10 hover:bg-purple-600 hover:border-purple-600 text-white'
                        : 'border-white/5 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Download className="size-5" />
                    Download 
                  </motion.button>

                  {/* Share Buttons */}
                  {images.length > 0 && !generating && (
                    <div className="pt-4 border-t border-white/5">
                      <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">
                        Share Result
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => window.open('https://wa.me/?text=Check out my PDF!', '_blank')}
                          className="flex flex-col items-center gap-2 p-3 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
                        >
                          <MessageCircle className="size-5" />
                          <span className="text-xs font-medium">WhatsApp</span>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => window.location.href = 'mailto:?subject=My PDF&body=Here is my PDF file'}
                          className="flex flex-col items-center gap-2 p-3 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
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

            {/* Info Icons */}
            <div className="mt-6 px-2">
              <div className="flex items-center justify-between gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1">
                  <span>🔒</span>
                  <span>Secure</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>🗑️</span>
                  <span>Auto-deleted</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>✓</span>
                  <span>High Quality</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}