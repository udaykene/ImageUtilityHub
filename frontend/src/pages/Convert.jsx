import { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Download, Sparkles, MessageCircle, Mail, Cloud } from 'lucide-react';
import FileUpload from '@/components/FileUpload';

const formats = [
  { value: 'jpg', label: 'JPG', description: 'Standard' },
  { value: 'png', label: 'PNG', description: 'Lossless' },
  { value: 'webp', label: 'WEBP', description: 'Web optimized' },
  { value: 'avif', label: 'AVIF', description: 'Next-gen' },
];

export default function Convert() {
  const [file, setFile] = useState(null);
  const [targetFormat, setTargetFormat] = useState('webp');
  const [quality, setQuality] = useState(80);
  const [converting, setConverting] = useState(false);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
  };

  const handleConvert = () => {
    if (!file) return;
    setConverting(true);
    
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
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
              <RefreshCw className="size-6" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black">Format Conversion</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg max-w-2xl">
            Convert between PNG, JPG, WebP, and AVIF formats with quality preservation and batch support.
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
              subtitle="Supports JPG, PNG, WebP, and AVIF up to 20MB"
            />

            {/* Format Selection Pills */}
            {file && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-6"
              >
                <h3 className="font-bold text-lg mb-4">Select Target Format</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {formats.map((format) => (
                    <motion.button
                      key={format.value}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setTargetFormat(format.value)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        targetFormat === format.value
                          ? 'border-primary bg-primary/10 text-white'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <p className="font-black text-lg">{format.label}</p>
                      <p className="text-xs text-slate-400 mt-1">{format.description}</p>
                    </motion.button>
                  ))}
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
                {/* Quality */}
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium text-slate-400">Quality</label>
                    <span className="text-primary font-bold">{quality}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                {/* Format Info */}
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-xs font-bold text-primary mb-2">TARGET FORMAT</p>
                  <p className="font-bold text-2xl uppercase">{targetFormat}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {formats.find((f) => f.value === targetFormat)?.description}
                  </p>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-4">
                  <motion.button
                    whileHover={{ scale: file ? 1.02 : 1 }}
                    whileTap={{ scale: file ? 0.98 : 1 }}
                    onClick={handleConvert}
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
                <span>WebP and AVIF formats offer better compression while maintaining quality</span>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}