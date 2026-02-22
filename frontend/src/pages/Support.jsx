import { motion } from "framer-motion";
import {
  HelpCircle,
  Zap,
  RefreshCw,
  Maximize2,
  FileImage,
  FilePlus,
  ChevronDown,
  ChevronUp,
  Mail,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const categories = [
  {
    icon: Zap,
    color: "from-blue-500 to-cyan-500",
    title: "Compression",
    faqs: [
      {
        q: "How much can I compress an image?",
        a: "FormatFlow can typically reduce file sizes by 50–90% depending on the original image and the quality setting you choose. The default quality of 80 provides an excellent balance.",
      },
      {
        q: "Will compression make my image look bad?",
        a: "Not noticeably. Our compression engine uses advanced algorithms (via Sharp) to remove redundant data while preserving visual quality. Higher quality settings (e.g. 85+) are essentially lossless to the human eye.",
      },
      {
        q: "What formats support compression?",
        a: "All major formats are supported: JPEG, PNG, WebP, and AVIF. AVIF and WebP typically achieve the best compression ratios.",
      },
    ],
  },
  {
    icon: RefreshCw,
    color: "from-purple-500 to-pink-500",
    title: "Conversion",
    faqs: [
      {
        q: "Which formats can I convert between?",
        a: "You can convert between PNG, JPEG, WebP, AVIF, and TIFF. All combinations are supported.",
      },
      {
        q: "Is the conversion lossless?",
        a: "It depends on the target format. PNG and TIFF are lossless by nature. JPEG, WebP, and AVIF support both lossy and lossless modes — FormatFlow defaults to high-quality lossy for smaller file sizes.",
      },
      {
        q: "Can I batch convert multiple files?",
        a: "Batch processing is coming soon! Currently each file is converted individually.",
      },
    ],
  },
  {
    icon: Maximize2,
    color: "from-green-500 to-emerald-500",
    title: "Resize",
    faqs: [
      {
        q: "Can I maintain the aspect ratio while resizing?",
        a: "Yes! Use the aspect ratio lock toggle in the resize tool. With it enabled, changing one dimension automatically updates the other.",
      },
      {
        q: "What resize strategies are available?",
        a: "We support Cover (fill dimensions, crop if needed), Contain (fit within dimensions, no crop), Fill (stretch to exact dimensions), and Free (resize without maintaining aspect ratio).",
      },
      {
        q: "Is there a maximum output resolution?",
        a: "Output is capped at 10,000 × 10,000 pixels to prevent server overload. This is sufficient for all standard use cases including print production.",
      },
    ],
  },
  {
    icon: FileImage,
    color: "from-orange-500 to-red-500",
    title: "PDF Extraction",
    faqs: [
      {
        q: "Can I extract all images from a PDF at once?",
        a: "Yes! All images embedded in the PDF are extracted and returned. The download includes a ZIP archive with each image as a separate file.",
      },
      {
        q: "What PDF formats are supported?",
        a: "PDF 1.4 and later are supported. Password-protected PDFs are not currently supported.",
      },
      {
        q: "Are vector graphics (SVG) extracted?",
        a: "No. Only raster images (JPEG, PNG, TIFF, etc.) embedded in the PDF are extracted. Vector graphics remain part of the document structure.",
      },
    ],
  },
  {
    icon: FilePlus,
    color: "from-indigo-500 to-purple-500",
    title: "Images to PDF",
    faqs: [
      {
        q: "How many images can I combine into one PDF?",
        a: "Currently up to 20 images per PDF. Larger batch support is planned for a future release.",
      },
      {
        q: "Can I reorder images before creating the PDF?",
        a: "Yes! The image order in the PDF matches the order you arrange them in the uploader. Drag and drop to rearrange.",
      },
      {
        q: "What page sizes are supported?",
        a: 'A4, US Letter, and a "Fit to Image" mode that sizes each page to match your image dimensions.',
      },
    ],
  },
];

function FaqItem({ q, a, index }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="border-b border-white/5 last:border-0"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-4 py-4 text-left cursor-pointer"
      >
        <span className="text-primary font-bold text-lg leading-none mt-0.5 flex-shrink-0">
          Q.
        </span>
        <span className="flex-1 font-medium text-sm sm:text-base">{q}</span>
        {open ? (
          <ChevronUp className="size-5 text-slate-400 flex-shrink-0 mt-0.5" />
        ) : (
          <ChevronDown className="size-5 text-slate-400 flex-shrink-0 mt-0.5" />
        )}
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="flex gap-4 pb-4"
        >
          <span className="text-slate-600 font-bold text-lg leading-none mt-0.5 flex-shrink-0">
            A.
          </span>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            {a}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function Support() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden pt-16 sm:pt-24 pb-12 sm:pb-16">
        <div className="absolute inset-0 hero-gradient pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="size-16 sm:size-20 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center">
              <HelpCircle className="size-8 sm:size-10 text-primary" />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold uppercase tracking-wider">
              Support Center
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
              How Can We{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-cyan-400">
                Help You?
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              Browse answers by tool, or reach out directly. We're here to make
              sure FormatFlow works perfectly for you.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mt-2">
              <Link to="/contact" className="btn-primary text-sm sm:text-base">
                <Mail className="size-4" />
                Contact Support
              </Link>
              <a
                href="#"
                className="btn-secondary text-sm sm:text-base flex items-center gap-2"
              >
                <ExternalLink className="size-4" />
                GitHub Issues
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ by Category */}
      <section className="py-8 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col gap-6 sm:gap-8">
            {categories.map((cat, ci) => (
              <motion.div
                key={ci}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: ci * 0.08 }}
                className="glass-card rounded-2xl overflow-hidden"
              >
                {/* Category Header */}
                <div className="flex items-center gap-4 p-5 sm:p-6 border-b border-white/5">
                  <div
                    className={`size-10 sm:size-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white flex-shrink-0`}
                  >
                    <cat.icon className="size-5 sm:size-6" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold">{cat.title}</h2>
                </div>

                {/* FAQs */}
                <div className="px-5 sm:px-6">
                  {cat.faqs.map((faq, fi) => (
                    <FaqItem key={fi} q={faq.q} a={faq.a} index={fi} />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Still Need Help */}
      <section className="pb-12 sm:pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl p-6 sm:p-10 bg-gradient-to-br from-primary/20 to-cyan-500/10 border border-primary/20 text-center flex flex-col items-center gap-4"
          >
            <h3 className="text-xl sm:text-2xl font-bold">Still Need Help?</h3>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl">
              Can't find your answer above? Our team is happy to help. Reach out
              via email or open a GitHub issue for technical bugs.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/contact" className="btn-primary text-sm sm:text-base">
                <Mail className="size-4" />
                Send Us a Message
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
