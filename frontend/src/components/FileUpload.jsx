import { useCallback, useState } from 'react';
import { Upload, File, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function FileUpload({ 
  accept, 
  maxSize = 20, 
  onFileSelect,
  multiple = false,
  title = "Drag & drop your file here",
  subtitle = `Supports ${accept || 'all formats'} up to ${maxSize}MB`
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  }, [maxSize, onFileSelect, multiple]);

  const processFiles = (fileList) => {
    const validFiles = [];
    
    for (const file of fileList) {
      const fileSizeMB = file.size / (1024 * 1024);
      
      if (fileSizeMB > maxSize) {
        alert(`File "${file.name}" exceeds ${maxSize}MB limit`);
        continue;
      }
      
      validFiles.push(file);
      
      // If not multiple, only take first valid file
      if (!multiple) break;
    }

    if (validFiles.length > 0) {
      if (multiple) {
        setSelectedFiles(validFiles);
        if (onFileSelect) {
          onFileSelect(validFiles);
        }
      } else {
        setSelectedFiles([validFiles[0]]);
        if (onFileSelect) {
          onFileSelect(validFiles[0]);
        }
      }
    }
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    
    if (onFileSelect) {
      if (multiple) {
        onFileSelect(newFiles.length > 0 ? newFiles : null);
      } else {
        onFileSelect(null);
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {selectedFiles.length === 0 ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={cn(
              "flex flex-col items-center gap-6 rounded-2xl border-2 border-dashed px-6 py-12 sm:py-20 transition-all cursor-pointer group",
              isDragging 
                ? "border-primary bg-primary/5" 
                : "border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/30 hover:border-primary/50"
            )}
          >
            <motion.div
              animate={{ 
                scale: isDragging ? 1.1 : 1,
              }}
              transition={{ duration: 0.2 }}
              className={cn(
                "p-4 sm:p-5 rounded-full transition-colors",
                isDragging 
                  ? "bg-primary/20 text-primary" 
                  : "bg-primary/10 text-primary group-hover:bg-primary/20"
              )}
            >
              <Upload className="size-6 sm:size-8" />
            </motion.div>

            <div className="flex flex-col items-center gap-2">
              <p className="text-lg sm:text-xl font-bold text-center">{title}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center px-4">{subtitle}</p>
              {multiple && (
                <p className="text-xs text-primary font-medium">You can select multiple files</p>
              )}
            </div>

            <label className="cursor-pointer">
              <input
                type="file"
                className="hidden"
                accept={accept}
                multiple={multiple}
                onChange={handleFileInput}
              />
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary text-sm"
              >
                Browse Files
              </motion.div>
            </label>
          </motion.div>
        ) : (
          <motion.div
            key="files"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-3"
          >
            {selectedFiles.map((file, index) => (
              <motion.div
                key={`${file.name}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card rounded-2xl p-6 flex items-center gap-4"
              >
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  <File className="size-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">{file.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeFile(index)}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <X className="size-5" />
                </motion.button>
              </motion.div>
            ))}

            {multiple && (
              <label className="cursor-pointer block">
                <input
                  type="file"
                  className="hidden"
                  accept={accept}
                  multiple={multiple}
                  onChange={handleFileInput}
                />
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="glass-card rounded-xl p-4 flex items-center justify-center gap-2 border-2 border-dashed border-primary/30 hover:border-primary transition-all cursor-pointer"
                >
                  <Upload className="size-5 text-primary" />
                  <span className="font-medium text-primary">Add More Files</span>
                </motion.div>
              </label>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}