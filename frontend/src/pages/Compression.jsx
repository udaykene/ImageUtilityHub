import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Download, Settings, Info, MessageCircle, Mail, Cloud, ArrowLeftRight } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import { ToolShapeDecoration } from '@/components/Shapes';

export default function Compress() {
  const [file, setFile] = useState(null);
  const [quality, setQuality] = useState(80);
  const [targetSize, setTargetSize] = useState('');
  const [outputFormat, setOutputFormat] = useState('original');
  const [stripMetadata, setStripMetadata] = useState(true);
  const [converting, setConverting] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [activePreset, setActivePreset] = useState(null);

  const compressionPresets = [
    { id: 'web', label: 'Web Optimized', quality: 80, description: 'Best for websites' },
    { id: 'high', label: 'High Quality', quality: 90, description: 'Minimal loss' },
    { id: 'max', label: 'Maximum Compression', quality: 60, description: 'Smallest size' },
  ];

  const formatOptions = [
    { value: 'original', label: 'Keep Original Format' },
    { value: 'jpg', label: 'JPG' },
    { value: 'png', label: 'PNG' },
    { value: 'webp', label: 'WebP' },
    { value: 'avif', label: 'AVIF' },
  ];

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
  };

  const handlePresetClick = (preset) => {
    setQuality(preset.quality);
    setActivePreset(preset.id);
    setTargetSize(''); // Clear target size when preset is selected
  };

  const handleTargetSizeChange = (e) => {
    setTargetSize(e.target.value);
    setActivePreset(null); // Clear active preset when custom size is entered
  };

  const handleCompress = () => {
    if (!file) return;
    setConverting(true);
    
    // Simulate compression
    setTimeout(() => {
      setConverting(false);
    }, 2000);
  };

  // Calculate estimated compressed size
  const getEstimatedSize = () => {
    if (!file) return 0;
    if (targetSize) {
      return parseFloat(targetSize);
    }
    return (file.size * (quality / 100)) / 1024; // in KB
  };

  const originalSizeKB = file ? (file.size / 1024).toFixed(2) : 0;
  const estimatedSizeKB = getEstimatedSize().toFixed(2);
  const savingsPercent = file ? ((1 - estimatedSizeKB / originalSizeKB) * 100).toFixed(0) : 0;

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
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black">Image Compression</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg max-w-2xl">
            Reduce file size by up to 90% without losing visible quality. Perfect for web speed optimization.
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
            {/* Upload Area */}
            <FileUpload
              accept="image/*"
              maxSize={20}
              onFileSelect={handleFileSelect}
              title="Drag & drop your image here"
              subtitle="Supports JPG, PNG, and WebP up to 20MB"
            />

            {/* Preview Section with Comparison Slider */}
            {file && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Info className="size-5 text-primary" />
                    Interactive Preview
                  </h3>
                  <span className="text-xs text-slate-400 flex items-center gap-2">
                    <ArrowLeftRight className="size-4" />
                    Drag to compare
                  </span>
                </div>

                {/* Comparison Slider Container */}
                <div className="glass-card rounded-xl overflow-hidden">
                  {/* Labels */}
                  <div className="grid grid-cols-2 border-b border-white/5">
                    <div className="p-4 bg-black/20 flex justify-between items-center">
                      <span className="text-xs font-bold text-primary tracking-widest uppercase">
                        Original
                      </span>
                      <span className="text-xs text-slate-400">
                        {originalSizeKB} KB
                      </span>
                    </div>
                    <div className="p-4 bg-primary/10 flex justify-between items-center border-l border-white/5">
                      <span className="text-xs font-bold text-primary tracking-widest uppercase">
                        Compressed
                      </span>
                      <span className="text-xs text-green-400 font-bold">
                        ~{estimatedSizeKB} KB (-{savingsPercent}%)
                      </span>
                    </div>
                  </div>

                  {/* Image Comparison with Slider */}
                  <div className="relative aspect-video w-full bg-slate-100 dark:bg-slate-800">
                    {/* Original Image (Background) */}
                    <div className="absolute inset-0">
                      <img
                        src={URL.createObjectURL(file)}
                        alt="Original"
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute top-2 left-2 px-2 py-1 rounded bg-black/60 text-white text-xs font-bold">
                        Original
                      </div>
                    </div>

                    {/* Compressed Image (Clipped) */}
                    <div 
                      className="absolute inset-0 overflow-hidden"
                      style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt="Compressed"
                        className="w-full h-full object-contain"
                        style={{ filter: `brightness(${0.95 + (quality / 1000)})` }}
                      />
                      <div className="absolute top-2 right-2 px-2 py-1 rounded bg-primary/80 text-white text-xs font-bold">
                        Compressed
                      </div>
                    </div>

                    {/* Slider Handle */}
                    <div 
                      className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize z-10"
                      style={{ left: `${sliderPosition}%` }}
                      onMouseDown={(e) => {
                        const handleMouseMove = (moveEvent) => {
                          const rect = e.currentTarget.parentElement.getBoundingClientRect();
                          const x = moveEvent.clientX - rect.left;
                          const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
                          setSliderPosition(percentage);
                        };

                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };

                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                    >
                      {/* Handle Circle */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center">
                        <ArrowLeftRight className="size-5 text-primary" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* File Size Comparison Chart */}
                <div className="glass-card rounded-xl p-6">
                  <h4 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">
                    Estimated Size Reduction
                  </h4>
                  <div className="space-y-4">
                    {/* Original Size Bar */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Original</span>
                        <span className="font-bold">{originalSizeKB} KB</span>
                      </div>
                      <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-500 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                    </div>

                    {/* Compressed Size Bar */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Compressed</span>
                        <span className="font-bold text-green-400">{estimatedSizeKB} KB</span>
                      </div>
                      <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(estimatedSizeKB / originalSizeKB) * 100}%` }}
                          className="h-full bg-gradient-to-r from-primary to-green-500 rounded-full"
                        ></motion.div>
                      </div>
                    </div>

                    {/* Savings Display */}
                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="text-sm text-slate-400">You'll save</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-green-400">{savingsPercent}%</span>
                        <span className="text-sm text-slate-400">
                          ({(originalSizeKB - estimatedSizeKB).toFixed(2)} KB)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-card rounded-xl p-4 sm:p-6 text-center">
                <Zap className="size-8 text-primary mx-auto mb-2" />
                <h4 className="font-bold text-sm sm:text-base">Lightning Fast</h4>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">Process in seconds</p>
              </div>
              <div className="glass-card rounded-xl p-4 sm:p-6 text-center">
                <Settings className="size-8 text-primary mx-auto mb-2" />
                <h4 className="font-bold text-sm sm:text-base">Fine Control</h4>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">Adjust quality levels</p>
              </div>
              <div className="glass-card rounded-xl p-4 sm:p-6 text-center">
                <Info className="size-8 text-primary mx-auto mb-2" />
                <h4 className="font-bold text-sm sm:text-base">No Quality Loss</h4>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">Visually identical</p>
              </div>
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

              {/* Output Format Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-400">Output Format</label>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-white/10 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                >
                  {formatOptions.map((format) => (
                    <option key={format.value} value={format.value}>
                      {format.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500">
                  Choose the format for your compressed image
                </p>
              </div>

              {/* Compression Presets */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <label className="text-sm font-medium text-slate-400">Quick Presets</label>
                <select
                  value={activePreset || ''}
                  onChange={(e) => {
                    const preset = compressionPresets.find(p => p.id === e.target.value);
                    if (preset) handlePresetClick(preset);
                  }}
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-white/10 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                >
                  <option value="">Select a preset...</option>
                  {compressionPresets.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.label} ({preset.quality}%) - {preset.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Target Size */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <label className="text-sm font-medium text-slate-400">Target Size (KB)</label>
                <input
                  type="number"
                  value={targetSize}
                  onChange={handleTargetSizeChange}
                  placeholder="e.g., 500"
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-white/10 text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
                <p className="text-xs text-slate-500">
                  Specify exact file size in kilobytes
                </p>
              </div>

              {/* Quality Slider (shown when no target size) */}
              {!targetSize && (
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-slate-400">Quality Level</label>
                    <span className="text-primary font-bold text-lg">{quality}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={quality}
                    onChange={(e) => {
                      setQuality(parseInt(e.target.value));
                      setActivePreset(null);
                    }}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                    <span>Small Size</span>
                    <span>High Quality</span>
                  </div>
                </div>
              )}

              {/* Additional Options */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={stripMetadata}
                    onChange={(e) => setStripMetadata(e.target.checked)}
                    className="w-5 h-5 rounded border-white/10 bg-slate-800 text-primary focus:ring-primary"
                  />
                  <div className="flex-1">
                    <span className="text-sm group-hover:text-white transition-colors block">
                      Strip EXIF metadata
                    </span>
                    <span className="text-xs text-slate-500">Remove camera data</span>
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-6 border-t border-white/5">
                <motion.button
                  whileHover={{ scale: file ? 1.02 : 1 }}
                  whileTap={{ scale: file ? 0.98 : 1 }}
                  onClick={handleCompress}
                  disabled={!file || converting}
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all ${
                    file && !converting
                      ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {converting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Zap className="size-5" />
                      </motion.div>
                      Compressing...
                    </>
                  ) : (
                    <>
                      <Zap className="size-5" />
                      Compress Now
                    </>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: file && !converting ? 1.02 : 1 }}
                  whileTap={{ scale: file && !converting ? 0.98 : 1 }}
                  disabled={!file || converting}
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold border transition-all ${
                    file && !converting
                      ? 'border-white/10 hover:bg-purple-600 hover:border-purple-600 text-white'
                      : 'border-white/5 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Download className="size-5" />
                  Download
                </motion.button>

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
                        onClick={() => window.open('https://wa.me/?text=Check out my file!', '_blank')}
                        className="flex flex-col items-center gap-2 p-3 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
                      >
                        <MessageCircle className="size-5" />
                        <span className="text-xs font-medium">WhatsApp</span>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => window.location.href = 'mailto:?subject=Shared File&body=Here is my file'}
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
          </motion.div>
        </div>
      </div>
    </div>
  );
}