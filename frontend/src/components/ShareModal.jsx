import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mail,
  MessageCircle,
  Send,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { shareToEmailApi, shareToWhatsAppApi } from "@/services/api";

const ShareModal = ({ isOpen, onClose, imageUrl, title }) => {
  const [mode, setMode] = useState(null); // 'email' or 'whatsapp'
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState(title || "Shared Image");
  const [message, setMessage] = useState("Check out this image I processed!");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleShare = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (mode === "email") {
        await shareToEmailApi({
          to: recipient,
          subject,
          message,
          imageUrl,
        });
      } else {
        await shareToWhatsAppApi({
          to: recipient,
          imageUrl,
          caption: message,
        });
      }
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setMode(null);
        setRecipient("");
        onClose();
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Failed to share. Check your account settings.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md glass-card rounded-2xl overflow-hidden shadow-2xl border border-white/10"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-primary/10 to-transparent">
            <h3 className="text-xl font-bold flex items-center gap-2">
              {mode === "email" ? (
                <Mail className="size-5 text-red-400" />
              ) : mode === "whatsapp" ? (
                <MessageCircle className="size-5 text-green-400" />
              ) : (
                "Direct Share"
              )}
              {mode
                ? `Share via ${mode === "email" ? "Email" : "WhatsApp"}`
                : "Choose Sharing Method"}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="p-6">
            {!mode ? (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setMode("email")}
                  className="flex flex-col items-center gap-3 p-6 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all group"
                >
                  <div className="p-3 rounded-full bg-red-500 text-white group-hover:scale-110 transition-transform">
                    <Mail className="size-6" />
                  </div>
                  <span className="font-bold">Email</span>
                </button>
                <button
                  onClick={() => setMode("whatsapp")}
                  className="flex flex-col items-center gap-3 p-6 rounded-xl bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 transition-all group"
                >
                  <div className="p-3 rounded-full bg-green-500 text-white group-hover:scale-110 transition-transform">
                    <MessageCircle className="size-6" />
                  </div>
                  <span className="font-bold">WhatsApp</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleShare} className="space-y-4">
                {success ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-8 text-center space-y-3"
                  >
                    <CheckCircle2 className="size-16 text-green-500" />
                    <p className="text-xl font-bold text-green-500">
                      Shared Successfully!
                    </p>
                  </motion.div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-400">
                        {mode === "email"
                          ? "Recipient Email"
                          : "WhatsApp Number (with country code)"}
                      </label>
                      <input
                        required
                        type={mode === "email" ? "email" : "text"}
                        placeholder={
                          mode === "email" ? "name@example.com" : "919876543210"
                        }
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>

                    {mode === "email" && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">
                          Subject
                        </label>
                        <input
                          type="text"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-primary/50 transition-colors"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-400">
                        Message (Optional)
                      </label>
                      <textarea
                        rows={3}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-primary/50 transition-colors resize-none"
                      />
                    </div>

                    {error && (
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                        {error}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setMode(null)}
                        className="px-4 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors font-bold"
                      >
                        Back
                      </button>
                      <button
                        disabled={loading}
                        type="submit"
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        {loading ? (
                          <Loader2 className="size-5 animate-spin" />
                        ) : (
                          <Send className="size-5" />
                        )}
                        {loading ? "Sending..." : "Send Now"}
                      </button>
                    </div>
                  </>
                )}
              </form>
            )}
          </div>

          <div className="p-4 bg-white/5 text-center">
            <p className="text-[10px] text-slate-500">
              {mode === "whatsapp"
                ? "Note: Recipient must be on WhatsApp."
                : "Note: Shared directly from our cloud server."}
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ShareModal;
