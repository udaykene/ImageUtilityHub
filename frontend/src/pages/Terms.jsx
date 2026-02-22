import { motion } from "framer-motion";
import {
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Scale,
  RefreshCw,
} from "lucide-react";

const sections = [
  {
    icon: CheckCircle,
    title: "Acceptable Use",
    color: "from-green-500 to-emerald-500",
    content: [
      {
        heading: "Personal & Commercial Use",
        text: "You may use FormatFlow for personal and commercial projects free of charge. No attribution is required.",
      },
      {
        heading: "File Ownership",
        text: "You retain full ownership and copyright of all files you upload and process. By uploading, you grant FormatFlow a temporary, limited license solely to process your files.",
      },
      {
        heading: "No Account Required",
        text: "FormatFlow is designed to be anonymous. You do not need to create an account to use any of our tools.",
      },
    ],
  },
  {
    icon: XCircle,
    title: "Prohibited Activities",
    color: "from-red-500 to-orange-500",
    content: [
      {
        heading: "Illegal Content",
        text: "You must not upload or process files containing illegal content, including but not limited to material that infringes on copyright, promotes illegal activity, or constitutes malware.",
      },
      {
        heading: "System Abuse",
        text: "Automated bulk abuse, denial-of-service attacks, or any attempt to circumvent rate limiting or security measures is strictly prohibited.",
      },
      {
        heading: "Reverse Engineering",
        text: "You may not attempt to reverse engineer, decompile, or extract source code from the FormatFlow service or its underlying infrastructure.",
      },
    ],
  },
  {
    icon: AlertTriangle,
    title: "Disclaimers & Limitations",
    color: "from-yellow-500 to-amber-500",
    content: [
      {
        heading: "No Warranties",
        text: 'FormatFlow is provided "as is" without any warranties, express or implied. We do not guarantee uninterrupted, error-free service.',
      },
      {
        heading: "Limitation of Liability",
        text: "To the maximum extent permitted by law, FormatFlow shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service.",
      },
      {
        heading: "File Loss",
        text: "We are not responsible for loss of original files. Always maintain your own backups before processing critical files.",
      },
    ],
  },
  {
    icon: Scale,
    title: "Intellectual Property",
    color: "from-blue-500 to-indigo-500",
    content: [
      {
        heading: "Our IP",
        text: "The FormatFlow name, logo, design, and underlying software are the intellectual property of the FormatFlow team and may not be used without permission.",
      },
      {
        heading: "Open Source",
        text: "Portions of the service may rely on open-source software. Relevant licenses are honored and credited in our GitHub repository.",
      },
      {
        heading: "Your Content",
        text: "We claim no intellectual property rights over files you process through our service.",
      },
    ],
  },
  {
    icon: RefreshCw,
    title: "Changes to Terms",
    color: "from-purple-500 to-pink-500",
    content: [
      {
        heading: "Updates",
        text: "We reserve the right to update these Terms at any time. Material changes will be announced on our website. Continued use after changes constitutes acceptance.",
      },
      {
        heading: "Governing Law",
        text: "These Terms are governed by applicable law. Any disputes shall be resolved under the jurisdiction agreed upon by both parties in good faith.",
      },
      {
        heading: "Severability",
        text: "If any provision of these Terms is found unenforceable, the remaining provisions shall continue in full force and effect.",
      },
    ],
  },
];

export default function Terms() {
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
              <FileText className="size-8 sm:size-10 text-primary" />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold uppercase tracking-wider">
              Terms of Service
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
              Simple,{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-cyan-400">
                Fair Terms
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              We've written our terms in plain language. No legalese. Just
              honest ground rules for using FormatFlow.
            </p>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-500">
              Last updated: February 2026 · Effective immediately
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-10 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col gap-6 sm:gap-8">
            {sections.map((section, si) => (
              <motion.div
                key={si}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: si * 0.08 }}
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
                  {section.content.map((item, ii) => (
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

            {/* Contact */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-primary/20 to-cyan-500/10 border border-primary/20 text-center flex flex-col items-center gap-4"
            >
              <h3 className="text-xl sm:text-2xl font-bold">
                Need Clarification?
              </h3>
              <p className="text-slate-400 text-sm sm:text-base max-w-xl">
                If you have questions about these Terms, we're happy to explain
                in plain English.
              </p>
              <a
                href="mailto:legal@formatflow.com"
                className="btn-primary text-sm sm:text-base"
              >
                <Scale className="size-4" />
                legal@formatflow.com
              </a>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
