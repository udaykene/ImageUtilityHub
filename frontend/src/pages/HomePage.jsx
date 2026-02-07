import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  RefreshCw, 
  Maximize2, 
  FileImage, 
  FilePlus,
  ArrowRight,
  Activity
} from 'lucide-react';
import { FloatingShapes } from '@/components/Shapes';

const tools = [
  {
    id: 1,
    title: 'Compression',
    description: 'Reduce file size by up to 90% without losing visible quality. Perfect for web optimization.',
    icon: Zap,
    path: '/compress',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 2,
    title: 'Conversion',
    description: 'Convert between PNG, JPG, WebP, AVIF, and TIFF formats instantly with quality preservation.',
    icon: RefreshCw,
    path: '/convert',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 3,
    title: 'Resizing',
    description: 'Set perfect dimensions for any platform with smart-crop technology and aspect ratio lock.',
    icon: Maximize2,
    path: '/resize',
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 4,
    title: 'PDF Extraction',
    description: 'Extract high-resolution images from PDF documents in seconds with no quality loss.',
    icon: FileImage,
    path: '/extract',
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 5,
    title: 'Images to PDF',
    description: 'Combine multiple images into a single, professional PDF document with custom settings.',
    icon: FilePlus,
    path: '/images-to-pdf',
    color: 'from-indigo-500 to-purple-500',
  },
];

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Process your files in seconds with our optimized engine',
  },
  {
    icon: Activity,
    title: 'High Quality',
    description: 'Maintain original quality while reducing file size',
  },
  {
    icon: RefreshCw,
    title: 'Batch Processing',
    description: 'Handle multiple files at once (coming soon)',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-16 sm:pb-24">
        <FloatingShapes />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            {/* Left Column - Text */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col gap-6 sm:gap-8 text-center lg:text-left"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs sm:text-sm font-bold uppercase tracking-wider w-fit mx-auto lg:mx-0"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Now Supporting 4K Processing
              </motion.div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-tight tracking-tight">
                Simplify Your <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent-purple">
                  Media Workflow
                </span>
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg lg:text-xl text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed mx-auto lg:mx-0">
                Instant, high-quality transformations for images and documents. No signup, no fees, just pure efficiency.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mx-auto lg:mx-0">
                <motion.a
                  href="#tools"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary text-base sm:text-lg justify-center"
                >
                  Get Started Free <ArrowRight className="size-5" />
                </motion.a>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-secondary text-base sm:text-lg justify-center"
                >
                  View Demo
                </motion.button>
              </div>
            </motion.div>

            {/* Right Column - Visual */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative group hidden lg:block"
            >
              <div className="relative aspect-square w-full max-w-[500px] mx-auto">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-accent-purple/30 blur-3xl rounded-full opacity-50 group-hover:opacity-70 transition-opacity"></div>
                
                {/* Main card */}
                <div className="relative z-10 w-full h-full glass-card rounded-3xl flex items-center justify-center p-8">
                  <div className="grid grid-cols-2 gap-6 w-full h-full">
                    {/* Top Left */}
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="flex flex-col gap-6 justify-center"
                    >
                      <div className="h-32 rounded-2xl bg-gradient-to-br from-primary/40 to-primary/10 border border-white/10 flex items-center justify-center shadow-2xl">
                        <FileImage className="size-12" />
                      </div>
                      <div className="h-32 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <Zap className="size-10 text-slate-500" />
                      </div>
                    </motion.div>

                    {/* Bottom Right */}
                    <motion.div
                      animate={{ y: [0, 10, 0] }}
                      transition={{ duration: 4, repeat: Infinity, delay: 2 }}
                      className="flex flex-col gap-6 justify-center mt-12"
                    >
                      <div className="h-32 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <RefreshCw className="size-10 text-slate-500" />
                      </div>
                      <div className="h-32 rounded-2xl bg-gradient-to-br from-accent-purple/40 to-accent-purple/10 border border-white/10 flex items-center justify-center shadow-2xl">
                        <FilePlus className="size-12" />
                      </div>
                    </motion.div>
                  </div>

                  {/* Center Icon */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-20 bg-white dark:bg-background-dark rounded-full border-2 border-primary/50 flex items-center justify-center shadow-[0_0_30px_rgba(19,127,236,0.5)]"
                  >
                    <RefreshCw className="text-primary size-8" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="py-12 sm:py-20 bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center mb-12 sm:mb-16 gap-4"
          >
            <span className="text-primary font-bold text-xs sm:text-sm tracking-widest uppercase">
              Powerful Tools
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center">
              Everything You Need
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl text-center text-sm sm:text-base">
              Professional-grade tools designed for speed, quality, and ease of use
            </p>
          </motion.div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {tools.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link to={tool.path}>
                  <motion.div
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="glass-card glow-hover rounded-2xl p-6 sm:p-8 group cursor-pointer h-full flex flex-col"
                  >
                    {/* Icon */}
                    <div className={`size-12 sm:size-14 rounded-xl bg-gradient-to-br ${tool.color} bg-opacity-10 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
                      <tool.icon className="size-6 sm:size-8" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl sm:text-2xl font-bold mb-3">{tool.title}</h3>
                    <p className="text-slate-400 leading-relaxed mb-6 flex-1 text-sm sm:text-base">
                      {tool.description}
                    </p>

                    {/* Link */}
                    <div className="flex items-center gap-2 text-primary font-bold text-sm group-hover:gap-4 transition-all">
                      Try it now <ArrowRight className="size-4" />
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why Choose FormatFlow?</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
              Built with performance and quality in mind
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center text-center gap-4 p-6 sm:p-8 rounded-2xl bg-primary/5 border border-primary/10 hover:border-primary/30 transition-colors"
              >
                <div className="p-4 rounded-xl bg-primary/10">
                  <feature.icon className="size-6 sm:size-8 text-primary" />
                </div>
                <h3 className="font-bold text-lg sm:text-xl">{feature.title}</h3>
                <p className="text-slate-400 text-sm sm:text-base">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-3xl p-8 sm:p-12 overflow-hidden relative bg-gradient-to-br from-primary to-blue-800 text-center flex flex-col items-center gap-6 sm:gap-8"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 size-48 sm:size-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 size-48 sm:size-64 bg-black/20 rounded-full blur-3xl"></div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white relative z-10">
              Ready to transform your media?
            </h2>
            <p className="text-white/80 text-base sm:text-lg max-w-xl relative z-10">
              Join thousands who use FormatFlow to save time and maintain quality every day
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 relative z-10">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-primary px-8 sm:px-10 py-3 sm:py-4 rounded-xl font-black text-base sm:text-lg shadow-xl shadow-black/20"
              >
                Get Started Now
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-black/20 text-white border border-white/20 px-8 sm:px-10 py-3 sm:py-4 rounded-xl font-black text-base sm:text-lg backdrop-blur"
              >
                Explore Tools
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}