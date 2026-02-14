import { getDownloadUrl } from "@/services/api";

const isMobile = () =>
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );

/**
 * Enhanced sharing utility using Web Share API
 * Prioritizes sharing actual files (images/PDFs/ZIPs) to provide a native experience.
 */
export const shareFile = async ({
  filename,
  title = "Check out my file!",
  text = "Processed with Image Utility Hub",
  fileType = "image/png",
}) => {
  if (!filename) return { success: false, error: "No filename provided" };

  const url = getDownloadUrl(filename);

  try {
    // 1. Fetch the file to share it as an actual File object
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch file for sharing");
    const blob = await response.blob();

    // Ensure we have a proper filename and extension
    const file = new File([blob], filename, { type: fileType });

    // 2. Check if the device can share this specific file
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title,
        text,
      });
      return { success: true, method: "file" };
    }

    // 3. Fallback to basic share (links) only if file sharing is NOT supported
    if (navigator.share) {
      await navigator.share({ title, text, url });
      return { success: true, method: "link" };
    }

    throw new Error("Web Share API not supported on this browser/device");
  } catch (err) {
    if (err.name === "AbortError") {
      return { success: false, cancelled: true };
    }

    console.error("Share failed:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Copies a blob (image) to the clipboard for Desktop sharing.
 */
export const copyImageToClipboard = async (url) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    // ClipboardItem only supports PNG in many browsers, but we'll try the blob type
    const item = new ClipboardItem({ [blob.type]: blob });
    await navigator.clipboard.write([item]);
    return true;
  } catch (err) {
    console.error("Clipboard copy failed:", err);
    return false;
  }
};

/**
 * Specialized WhatsApp sharing.
 */
export const shareToWhatsApp = async (
  filename,
  customText = "Check out my file!",
  fileType = "image/png",
) => {
  if (isMobile()) {
    return await shareFile({ filename, text: customText, fileType });
  }

  // Desktop Flow: Clipboard + Web WhatsApp
  const url = getDownloadUrl(filename);
  if (fileType.startsWith("image/")) {
    const copied = await copyImageToClipboard(url);
    if (copied) {
      alert(
        "Image copied to clipboard! Opening WhatsApp Web... Just press Ctrl+V to paste your image.",
      );
    }
  } else {
    alert(
      "Opening WhatsApp Web... Since this is a " +
        fileType.split("/")[1].toUpperCase() +
        " file, please drag it into the chat.",
    );
  }
  window.open("https://web.whatsapp.com/", "_blank");
  return { success: true };
};

/**
 * Dedicated Email sharing.
 */
export const shareByEmail = async (
  filename,
  subject = "Processed File",
  fileType = "image/png",
) => {
  if (isMobile()) {
    return await shareFile({ filename, title: subject, fileType });
  }

  // Desktop Flow: Clipboard + mailto
  const url = getDownloadUrl(filename);
  if (fileType.startsWith("image/")) {
    await copyImageToClipboard(url);
    alert(
      "Image copied to clipboard! Opening your mail app... You can now paste (Ctrl+V) the image directly into your email.",
    );
  }

  const mailtoUrl = `mailto:?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(
    "Hello,\n\nI processed a file using Image Utility Hub. You can find it here: " +
      url,
  )}`;
  window.open(mailtoUrl, "_blank");
  return { success: true };
};

/**
 * Dedicated Google Drive logic.
 */
export const shareToDrive = async (filename, fileType = "image/png") => {
  // 1. Try native share (best for mobile Drive app)
  if (isMobile()) {
    return await shareFile({
      filename,
      title: "Save to Drive",
      text: "Saving processed file to Google Drive",
      fileType,
    });
  }

  // 2. Desktop Flow: Use Google "Save to Drive" logic or direct link
  alert(
    "Opening Google Drive... You can save this file directly to your cloud storage by dragging the file or using the upload button.",
  );
  window.open("https://drive.google.com/drive/my-drive", "_blank");
  return { success: true };
};
