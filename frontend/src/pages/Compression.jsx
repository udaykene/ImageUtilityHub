import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Download, Settings, Info, MessageCircle, Mail, Cloud } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import { ToolShapeDecoration } from '@/components/Shapes';

export default function Compress() {
  const [file, setFile] = useState(null);
  const [quality, setQuality] = useState(80);
  const [stripMetadata, setStripMetadata] = useState(true);
  const [converting, setConverting] = useState(false);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
  };

  const handleCompress = () => {
    if (!file) return;
    setConverting(true);
    
    // Simulate compression
    setTimeout(() => {
      setConverting(false);
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

            {/* Preview Section */}
            {file && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Info className="size-5 text-primary" />
                  Preview
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Original */}
                  <div className="glass-card rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
                      <span className="text-xs font-bold text-primary tracking-widest uppercase">
                        Original
                      </span>
                      <span className="text-xs text-slate-400">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>
                    <div className="aspect-video w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <img
                        src={URL.createObjectURL(file)}
                        alt="Original"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>

                  {/* Compressed Preview */}
                  <div className="glass-card rounded-xl overflow-hidden border-primary/30">
                    <div className="p-4 border-b border-white/5 flex justify-between items-center bg-primary/10">
                      <span className="text-xs font-bold text-primary tracking-widest uppercase">
                        Compressed
                      </span>
                      <span className="text-xs text-green-400 font-bold">
                        ~{((file.size * (quality / 100)) / (1024 * 1024)).toFixed(2)} MB (-
                        {(100 - quality).toFixed(0)}%)
                      </span>
                    </div>
                    <div className="aspect-video w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <img
                        src={URL.createObjectURL(file)}
                        alt="Compressed"
                        className="w-full h-full object-contain"
                      />
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
            <div className="glass-card rounded-xl p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <Settings className="size-5 text-primary" />
                <h2 className="text-xl font-bold">Compression Settings</h2>
              </div>

              <div className="space-y-6">
                {/* Quality Slider */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-slate-400">Quality vs. Size</label>
                    <span className="text-primary font-bold text-lg">{quality}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                    <span>Small Size</span>
                    <span>High Quality</span>
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={stripMetadata}
                      onChange={(e) => setStripMetadata(e.target.checked)}
                      className="w-5 h-5 rounded border-white/10 bg-slate-800 text-primary focus:ring-primary"
                    />
                    <span className="text-sm group-hover:text-white transition-colors">
                      Strip EXIF metadata
                    </span>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-6">
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
                        ? 'border-white/10 hover:bg-green-600 hover:border-green-600 text-white'
                        : 'border-white/5 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Download className="size-5" />
                    Download Result
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

                {/* File Info */}
                {file && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-8 p-4 rounded-lg bg-black/20 border border-white/5"
                  >
                    <p className="text-[10px] text-slate-500 uppercase font-black mb-2 tracking-widest">
                      Selected File
                    </p>
                    <p className="font-bold text-sm truncate">{file.name}</p>
                    <p className="text-xs text-slate-400">Ready for processing</p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}