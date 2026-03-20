import React, { useState, useRef, useEffect } from "react";
import {
  Share2,
  Copy,
  Mail,
  MessageCircle, // Using MessageCircle as fallback for WhatsApp if icon isn't present
  ChevronDown,
  Check,
} from "lucide-react";
import {
  shareFile,
  shareToWhatsApp,
  shareByEmail,
  copyUrlToClipboard,
} from "../utils/share";

const ShareButton = ({ cloudinaryUrl, filename, mimeType }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.addEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNativeShare = async () => {
    setIsSharing(true);
    try {
      const result = await shareFile({
        cloudinaryUrl,
        title: filename || "Processed File",
        text: "Check out this file I processed with Image Utility Hub!",
        fileType: mimeType || "image/png",
      });

      if (!result.success && !result.cancelled) {
        // Fallback to dropdown if native share fails or is unsupported
        setIsOpen(true);
      }
    } catch (error) {
      console.error("Share error:", error);
      setIsOpen(true);
    } finally {
      setIsSharing(false);
    }
  };

  const handleWhatsAppShare = () => {
    shareToWhatsApp(
      cloudinaryUrl,
      "Check out this file I processed with Image Utility Hub!",
      mimeType || "image/png"
    );
    setIsOpen(false);
  };

  const handleEmailShare = () => {
    shareByEmail(
      cloudinaryUrl,
      filename || "Processed File",
      mimeType || "image/png"
    );
    setIsOpen(false);
  };

  const handleCopyLink = async () => {
    const success = await copyUrlToClipboard(cloudinaryUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    setIsOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative inline-block text-left" ref={dropdownRef}>
        <div className="flex rounded-md shadow-sm">
        <button
          type="button"
          onClick={handleNativeShare}
          disabled={isSharing}
          className="relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-600 bg-gray-700 text-sm font-medium text-white hover:bg-gray-600 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        >
          {isSharing ? (
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <Share2 className="mr-2 h-4 w-4" />
          )}
          Share
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="relative -ml-px inline-flex items-center px-2 py-2 rounded-r-md border border-gray-600 bg-gray-700 text-sm font-medium text-white hover:bg-gray-600 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 divide-y divide-gray-700 z-50">
          <div className="py-1">
            <button
              onClick={handleWhatsAppShare}
              className="group flex w-full items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-white"
            >
              <MessageCircle className="mr-3 h-4 w-4 text-green-400 group-hover:text-green-300" />
              Share to WhatsApp
            </button>
            <button
              onClick={handleEmailShare}
              className="group flex w-full items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-white"
            >
              <Mail className="mr-3 h-4 w-4 text-blue-400 group-hover:text-blue-300" />
              Share via Email
            </button>
          </div>
        </div>
      )}
    </div>
    <button
      type="button"
      onClick={handleCopyLink}
      className={`inline-flex items-center px-4 py-2 rounded-md border text-sm font-medium transition-colors shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
        copied 
          ? "border-green-500 bg-green-50 text-green-700 hover:bg-green-100" 
          : "border-gray-600 bg-gray-700 text-white hover:bg-gray-600"
      }`}
    >
      {copied ? (
        <>
          <Check className="mr-2 h-4 w-4 text-green-600" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="mr-2 h-4 w-4" />
          Copy Link
        </>
      )}
    </button>
  </div>
  );
};

export default ShareButton;
