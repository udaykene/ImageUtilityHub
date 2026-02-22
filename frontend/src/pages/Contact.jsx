import { motion } from "framer-motion";
import {
  Mail,
  MessageSquare,
  Github,
  Twitter,
  Send,
  MapPin,
  Clock,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { FloatingShapes } from "@/components/Shapes";

const contactMethods = [
  {
    icon: Mail,
    title: "Email Us",
    description: "Drop us a line and we'll get back within 24 hours.",
    value: "support@formatflow.com",
    href: "mailto:support@formatflow.com",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Github,
    title: "GitHub",
    description: "Found a bug? Open an issue or submit a PR.",
    value: "github.com/formatflow",
    href: "#",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Twitter,
    title: "Twitter / X",
    description: "Follow us for updates and tips.",
    value: "@formatflow",
    href: "#",
    color: "from-sky-500 to-blue-600",
  },
];

const faqs = [
  {
    q: "Is FormatFlow completely free?",
    a: "Yes! All tools are free to use with no signup required. We believe in open, accessible media tools for everyone.",
  },
  {
    q: "Are my files stored on your servers?",
    a: "No. Your files are processed in memory and immediately discarded. We never store, log, or analyze your uploads.",
  },
  {
    q: "What file sizes are supported?",
    a: "Currently we support files up to 50MB for images and 100MB for PDF extraction. Larger file support is coming soon.",
  },
  {
    q: "Which image formats are supported?",
    a: "We support PNG, JPG/JPEG, WebP, AVIF, and TIFF. PDF extraction and Images-to-PDF are also available.",
  },
];

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    // Simulate a small delay for UX
    await new Promise((r) => setTimeout(r, 1000));
    setSending(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden pt-16 sm:pt-24 pb-12 sm:pb-20">
        <FloatingShapes />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold uppercase tracking-wider">
              <MessageSquare className="size-4" />
              Get In Touch
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
              We'd Love to{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-cyan-400">
                Hear From You
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              Have a question, feedback, or feature request? Reach out anytime —
              we typically respond within 24 hours.
            </p>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-primary" />
                <span>Responds within 24h</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-primary" />
                <span>Remote-first team</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-8 sm:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {contactMethods.map((method, i) => (
              <motion.a
                key={i}
                href={method.href}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="glass-card glow-hover rounded-2xl p-6 flex flex-col gap-4 group cursor-pointer"
              >
                <div
                  className={`size-12 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center text-white group-hover:scale-110 transition-transform`}
                >
                  <method.icon className="size-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{method.title}</h3>
                  <p className="text-slate-400 text-sm mb-2">
                    {method.description}
                  </p>
                  <span className="text-primary text-sm font-medium">
                    {method.value}
                  </span>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-10 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-10 sm:gap-16 items-start">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                Send a Message
              </h2>
              <p className="text-slate-400 mb-8 text-sm sm:text-base">
                Fill out the form and we'll get back to you as soon as possible.
              </p>

              {sent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card rounded-2xl p-8 text-center flex flex-col items-center gap-4"
                >
                  <div className="size-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Sparkles className="size-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Message Sent!</h3>
                  <p className="text-slate-400 text-sm">
                    Thanks for reaching out, <strong>{form.name}</strong>. We'll
                    reply to <strong>{form.email}</strong> within 24 hours.
                  </p>
                  <button
                    onClick={() => {
                      setSent(false);
                      setForm({
                        name: "",
                        email: "",
                        subject: "",
                        message: "",
                      });
                    }}
                    className="btn-secondary text-sm px-4 py-2"
                  >
                    Send Another
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label
                        className="text-sm font-medium text-slate-400"
                        htmlFor="name"
                      >
                        Full Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Jane Doe"
                        className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-600"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label
                        className="text-sm font-medium text-slate-400"
                        htmlFor="email"
                      >
                        Email Address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        placeholder="jane@example.com"
                        className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      className="text-sm font-medium text-slate-400"
                      htmlFor="subject"
                    >
                      Subject
                    </label>
                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      value={form.subject}
                      onChange={handleChange}
                      placeholder="Feature request / Bug report / General"
                      className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-600"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      className="text-sm font-medium text-slate-400"
                      htmlFor="message"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Tell us what's on your mind..."
                      className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all resize-none placeholder:text-slate-600"
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={sending}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary justify-center text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <>
                        <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="size-5" />
                        Send Message
                      </>
                    )}
                  </motion.button>
                </form>
              )}
            </motion.div>

            {/* FAQ */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col gap-6"
            >
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">FAQ</h2>
                <p className="text-slate-400 text-sm sm:text-base">
                  Quick answers to common questions.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                {faqs.map((faq, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-card rounded-2xl p-5 sm:p-6 border-l-4 border-primary/40"
                  >
                    <h4 className="font-bold mb-2 text-sm sm:text-base">
                      {faq.q}
                    </h4>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {faq.a}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
