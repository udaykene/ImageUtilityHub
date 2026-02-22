import { motion } from "framer-motion";
import {
  Code2,
  Terminal,
  Zap,
  Copy,
  CheckCheck,
  Lock,
  Globe,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";

const endpoints = [
  {
    method: "POST",
    path: "/api/compress",
    description:
      "Compress an image. Returns the compressed file as a binary blob.",
    params: [
      {
        name: "file",
        type: "File (multipart)",
        required: true,
        desc: "The image file to compress (PNG, JPG, WebP, AVIF).",
      },
      {
        name: "quality",
        type: "number",
        required: false,
        desc: "Compression quality 1–100. Default: 80.",
      },
    ],
    example: `curl -X POST https://api.formatflow.com/api/compress \\
  -F "file=@photo.jpg" \\
  -F "quality=75" \\
  --output compressed.jpg`,
    response: `HTTP/1.1 200 OK
Content-Type: image/jpeg
Content-Disposition: attachment; filename="compressed.jpg"

<binary image data>`,
  },
  {
    method: "POST",
    path: "/api/convert",
    description: "Convert an image to a different format.",
    params: [
      {
        name: "file",
        type: "File (multipart)",
        required: true,
        desc: "The source image file.",
      },
      {
        name: "format",
        type: "string",
        required: true,
        desc: "Target format: png | jpg | webp | avif | tiff.",
      },
    ],
    example: `curl -X POST https://api.formatflow.com/api/convert \\
  -F "file=@photo.png" \\
  -F "format=webp" \\
  --output converted.webp`,
    response: `HTTP/1.1 200 OK
Content-Type: image/webp
Content-Disposition: attachment; filename="converted.webp"

<binary image data>`,
  },
  {
    method: "POST",
    path: "/api/resize",
    description: "Resize an image to specific dimensions.",
    params: [
      {
        name: "file",
        type: "File (multipart)",
        required: true,
        desc: "The image to resize.",
      },
      {
        name: "width",
        type: "number",
        required: false,
        desc: "Target width in pixels.",
      },
      {
        name: "height",
        type: "number",
        required: false,
        desc: "Target height in pixels.",
      },
      {
        name: "fit",
        type: "string",
        required: false,
        desc: "Resize strategy: cover | contain | fill | inside | outside. Default: cover.",
      },
    ],
    example: `curl -X POST https://api.formatflow.com/api/resize \\
  -F "file=@photo.jpg" \\
  -F "width=800" \\
  -F "height=600" \\
  -F "fit=cover" \\
  --output resized.jpg`,
    response: `HTTP/1.1 200 OK
Content-Type: image/jpeg
Content-Disposition: attachment; filename="resized.jpg"

<binary image data>`,
  },
  {
    method: "POST",
    path: "/api/extract-pdf-images",
    description: "Extract all images embedded in a PDF document.",
    params: [
      {
        name: "file",
        type: "File (multipart)",
        required: true,
        desc: "The PDF file to extract images from.",
      },
    ],
    example: `curl -X POST https://api.formatflow.com/api/extract-pdf-images \\
  -F "file=@document.pdf"`,
    response: `HTTP/1.1 200 OK
Content-Type: application/json

{
  "count": 3,
  "images": [
    { "index": 0, "format": "png", "data": "<base64 string>" },
    { "index": 1, "format": "jpeg", "data": "<base64 string>" },
    { "index": 2, "format": "png", "data": "<base64 string>" }
  ]
}`,
  },
  {
    method: "POST",
    path: "/api/images-to-pdf",
    description: "Combine multiple images into a single PDF document.",
    params: [
      {
        name: "files",
        type: "File[] (multipart)",
        required: true,
        desc: "Array of image files to combine (order preserved).",
      },
      {
        name: "pageSize",
        type: "string",
        required: false,
        desc: "PDF page size: A4 | Letter | Fit. Default: A4.",
      },
      {
        name: "orientation",
        type: "string",
        required: false,
        desc: "portrait | landscape. Default: portrait.",
      },
    ],
    example: `curl -X POST https://api.formatflow.com/api/images-to-pdf \\
  -F "files=@page1.jpg" \\
  -F "files=@page2.jpg" \\
  -F "pageSize=A4" \\
  --output document.pdf`,
    response: `HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename="output.pdf"

<binary PDF data>`,
  },
];

const methodColors = {
  GET: "bg-green-500/20 text-green-400 border-green-500/30",
  POST: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="bg-slate-950/80 border border-white/5 rounded-xl p-4 sm:p-5 overflow-x-auto text-xs sm:text-sm text-slate-300 leading-relaxed font-mono">
        <code>{code}</code>
      </pre>
      <button
        onClick={copy}
        className="absolute top-3 right-3 size-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-primary/20 hover:border-primary/40 transition-all opacity-0 group-hover:opacity-100"
      >
        {copied ? (
          <CheckCheck className="size-4 text-primary" />
        ) : (
          <Copy className="size-4 text-slate-400" />
        )}
      </button>
    </div>
  );
}

function EndpointCard({ endpoint, index }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="glass-card glow-hover rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 sm:gap-4 p-5 sm:p-6 text-left cursor-pointer"
      >
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-md border flex-shrink-0 ${methodColors[endpoint.method] || "bg-slate-700/50 text-slate-300 border-slate-600/50"}`}
        >
          {endpoint.method}
        </span>
        <code className="text-slate-200 font-mono text-sm sm:text-base flex-1 truncate">
          {endpoint.path}
        </code>
        <ArrowRight
          className={`size-4 text-slate-500 transition-transform flex-shrink-0 ${open ? "rotate-90" : ""}`}
        />
      </button>

      <p className="px-5 sm:px-6 pb-4 text-slate-400 text-sm">
        {endpoint.description}
      </p>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="border-t border-white/5"
        >
          <div className="p-5 sm:p-6 flex flex-col gap-6">
            {/* Parameters */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
                Parameters
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-500 text-xs">
                      <th className="text-left pb-2 pr-4 font-medium">Name</th>
                      <th className="text-left pb-2 pr-4 font-medium">Type</th>
                      <th className="text-left pb-2 pr-4 font-medium">
                        Required
                      </th>
                      <th className="text-left pb-2 font-medium">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {endpoint.params.map((p, pi) => (
                      <tr key={pi} className="border-b border-white/[0.03]">
                        <td className="py-2.5 pr-4">
                          <code className="text-primary text-sm">{p.name}</code>
                        </td>
                        <td className="py-2.5 pr-4 text-slate-400 text-xs">
                          {p.type}
                        </td>
                        <td className="py-2.5 pr-4">
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded ${p.required ? "bg-red-500/20 text-red-400" : "bg-slate-700/50 text-slate-400"}`}
                          >
                            {p.required ? "required" : "optional"}
                          </span>
                        </td>
                        <td className="py-2.5 text-slate-400 text-xs">
                          {p.desc}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Example */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
                Example Request
              </h4>
              <CodeBlock code={endpoint.example} />
            </div>

            {/* Response */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
                Example Response
              </h4>
              <CodeBlock code={endpoint.response} />
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function ApiDocs() {
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
              <Code2 className="size-8 sm:size-10 text-primary" />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold uppercase tracking-wider">
              API Reference
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
              Build With{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-cyan-400">
                FormatFlow API
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              Integrate powerful image processing into your own apps with our
              simple, fast REST API.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {[
                { icon: Globe, text: "REST API" },
                { icon: Zap, text: "Low Latency" },
                { icon: Lock, text: "No Auth Required (Beta)" },
                { icon: Terminal, text: "JSON & Binary Responses" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-sm text-slate-300"
                >
                  <item.icon className="size-4 text-primary" />
                  {item.text}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Base URL */}
      <section className="pb-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="glass-card rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Base URL
              </p>
              <code className="text-primary font-mono text-sm sm:text-base">
                https://api.formatflow.com
              </code>
            </div>
            <div className="h-px sm:h-10 w-full sm:w-px bg-white/10 sm:mx-4" />
            <p className="text-slate-400 text-sm">
              All endpoints accept{" "}
              <code className="text-primary">multipart/form-data</code> requests
              unless otherwise noted. Currently in{" "}
              <span className="text-yellow-400 font-bold">public beta</span> —
              no API key required.
            </p>
          </div>
        </div>
      </section>

      {/* Endpoints */}
      <section className="py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <Terminal className="size-5 text-primary" />
            <h2 className="text-xl sm:text-2xl font-bold">Endpoints</h2>
            <span className="text-sm text-slate-400 ml-1">
              (click to expand)
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {endpoints.map((ep, i) => (
              <EndpointCard key={i} endpoint={ep} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Rate Limits */}
      <section className="pb-12 sm:pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-primary/20 to-cyan-500/10 border border-primary/20 text-center flex flex-col items-center gap-4"
          >
            <h3 className="text-xl sm:text-2xl font-bold">
              Rate Limits & Quotas
            </h3>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl">
              During the public beta, each IP is limited to{" "}
              <strong className="text-white">100 requests/hour</strong> and{" "}
              <strong className="text-white">50MB max file size</strong>. Need
              higher limits for production use? Get in touch.
            </p>
            <a href="/contact" className="btn-primary text-sm sm:text-base">
              <Zap className="size-4" />
              Request Higher Limits
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
