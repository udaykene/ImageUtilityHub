import { motion } from "framer-motion";
import {
  Shield,
  Eye,
  Database,
  Lock,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const sections = [
  {
    icon: Eye,
    title: "Information We Collect",
    color: "from-blue-500 to-cyan-500",
    items: [
      {
        heading: "Files You Upload",
        text: "Files you upload for processing are handled entirely in-memory. They are never written to disk or stored in any database.",
      },
      {
        heading: "Usage Data",
        text: "We collect anonymous, aggregate usage statistics (e.g., number of files processed) solely to improve performance. No personally identifiable information is included.",
      },
      {
        heading: "Browser Data",
        text: "Standard browser metadata (browser type, OS, viewport) may be collected for debugging purposes only.",
      },
    ],
  },
  {
    icon: Database,
    title: "How We Use Your Data",
    color: "from-purple-500 to-pink-500",
    items: [
      {
        heading: "File Processing Only",
        text: "Your uploaded files are used exclusively to perform the requested operation (compress, convert, resize, etc.) and are discarded immediately after.",
      },
      {
        heading: "Service Improvement",
        text: "Anonymized usage patterns help us prioritize features and improve processing speeds.",
      },
      {
        heading: "No Marketing",
        text: "We do not use your data for advertising, marketing, or any third-party commercial purposes.",
      },
    ],
  },
  {
    icon: Lock,
    title: "Data Security",
    color: "from-green-500 to-emerald-500",
    items: [
      {
        heading: "Encrypted Transport",
        text: "All data transmitted between your browser and our servers is encrypted using TLS 1.3.",
      },
      {
        heading: "No Persistent Storage",
        text: "Files are processed in isolated, ephemeral memory containers and destroyed when the request completes.",
      },
      {
        heading: "No Third-Party Sharing",
        text: "Your files and personal information are never sold, rented, or shared with any third parties.",
      },
    ],
  },
  {
    icon: AlertCircle,
    title: "Cookies & Tracking",
    color: "from-orange-500 to-red-500",
    items: [
      {
        heading: "No Cookies",
        text: "FormatFlow does not use tracking cookies or persistent session cookies of any kind.",
      },
      {
        heading: "No Analytics Fingerprinting",
        text: "We do not use behavioral analytics tools or fingerprinting techniques.",
      },
      {
        heading: "Local Preferences Only",
        text: "Theme preferences (light/dark mode) may be stored in your browser's localStorage, entirely on your device.",
      },
    ],
  },
];

const highlights = [
  { icon: CheckCircle, text: "Zero file retention" },
  { icon: CheckCircle, text: "No account required" },
  { icon: CheckCircle, text: "No cookies or trackers" },
  { icon: CheckCircle, text: "No data sold ever" },
];

export default function Privacy() {
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
              <Shield className="size-8 sm:size-10 text-primary" />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold uppercase tracking-wider">
              Privacy Policy
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
              Your Privacy,{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-cyan-400">
                Our Priority
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              FormatFlow is built on a simple principle: your files belong to
              you. We process them and immediately forget them.
            </p>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-500">
              Last updated: February 2026
            </p>

            {/* Highlights */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-2">
              {highlights.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-sm text-slate-300"
                >
                  <h.icon className="size-4 text-primary" />
                  {h.text}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-10 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col gap-8 sm:gap-12">
            {sections.map((section, si) => (
              <motion.div
                key={si}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: si * 0.1 }}
                className="glass-card rounded-2xl p-6 sm:p-8"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className={`size-10 sm:size-12 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center text-white`}
                  >
                    <section.icon className="size-5 sm:size-6" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold">
                    {section.title}
                  </h2>
                </div>

                <div className="flex flex-col gap-5">
                  {section.items.map((item, ii) => (
                    <div key={ii} className="flex gap-4">
                      <div className="size-2 mt-2.5 rounded-full bg-primary flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-sm sm:text-base mb-1">
                          {item.heading}
                        </h3>
                        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                          {item.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}

            {/* Contact for Privacy */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-primary/20 to-cyan-500/10 border border-primary/20 text-center flex flex-col items-center gap-4"
            >
              <h3 className="text-xl sm:text-2xl font-bold">
                Questions About Your Privacy?
              </h3>
              <p className="text-slate-400 text-sm sm:text-base max-w-xl">
                If you have any concerns or requests regarding your data, please
                reach out directly. We're committed to transparency.
              </p>
              <a
                href="mailto:privacy@formatflow.com"
                className="btn-primary text-sm sm:text-base"
              >
                <Shield className="size-4" />
                privacy@formatflow.com
              </a>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
