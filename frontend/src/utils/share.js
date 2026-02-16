const isMobile = () =>
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );

/**
 * Enhanced sharing utility using Web Share API with Cloudinary URLs
 * Works directly with Cloudinary URLs - no download needed!
 */
export const shareFile = async ({
  cloudinaryUrl,
  title = "Check out my file!",
  text = "Processed with Image Utility Hub",
  fileType = "image/png",
}) => {
  if (!cloudinaryUrl) return { success: false, error: "No URL provided" };

  try {
    // 1. Fetch the file from Cloudinary to share it as an actual File object
    const response = await fetch(cloudinaryUrl);
    if (!response.ok) throw new Error("Failed to fetch file for sharing");
    const blob = await response.blob();

    // Extract filename from Cloudinary URL or use timestamp
    const filename = cloudinaryUrl.split("/").pop() || `file-${Date.now()}`;
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
      await navigator.share({ title, text, url: cloudinaryUrl });
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
export const copyImageToClipboard = async (cloudinaryUrl) => {
  try {
    const response = await fetch(cloudinaryUrl);
    const blob = await response.blob();
    const item = new ClipboardItem({ [blob.type]: blob });
    await navigator.clipboard.write([item]);
    return true;
  } catch (err) {
    console.error("Clipboard copy failed:", err);
    return false;
  }
};

/**
 * Copy URL to clipboard
 */
export const copyUrlToClipboard = async (url) => {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch (err) {
    console.error("URL copy failed:", err);
    return false;
  }
};

/**
 * Specialized WhatsApp sharing with Cloudinary URLs
 */
export const shareToWhatsApp = async (
  cloudinaryUrl,
  customText = "Check out my file!",
  fileType = "image/png",
) => {
  if (isMobile()) {
    return await shareFile({ cloudinaryUrl, text: customText, fileType });
  }

  // Desktop Flow: Clipboard + Web WhatsApp
  if (fileType.startsWith("image/")) {
    const copied = await copyImageToClipboard(cloudinaryUrl);
    if (copied) {
      alert(
        "Image copied to clipboard! Opening WhatsApp Web... Just press Ctrl+V to paste your image.",
      );
    }
  } else {
    // For non-images, copy URL
    await copyUrlToClipboard(cloudinaryUrl);
    alert(
      "Link copied to clipboard! Opening WhatsApp Web... Paste (Ctrl+V) the link to share the file.",
    );
  }
  window.open("https://web.whatsapp.com/", "_blank");
  return { success: true };
};

/**
 * Dedicated Email sharing with Cloudinary URLs
 */
export const shareByEmail = async (
  cloudinaryUrl,
  subject = "Processed File",
  fileType = "image/png",
) => {
  if (isMobile()) {
    return await shareFile({ cloudinaryUrl, title: subject, fileType });
  }

  // Desktop Flow: Clipboard + mailto
  if (fileType.startsWith("image/")) {
    const copied = await copyImageToClipboard(cloudinaryUrl);
    if (copied) {
      alert(
        "Image copied to clipboard! Opening your mail app... You can now paste (Ctrl+V) the image directly into your email.",
      );
    }
  }

  const mailtoUrl = `mailto:?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(
    "Hello,\n\nI processed a file using Image Utility Hub. You can view/download it here:\n\n" +
      cloudinaryUrl,
  )}`;
  window.open(mailtoUrl, "_blank");
  return { success: true };
};

/**
 * Dedicated Google Drive logic with Cloudinary URLs
 */
export const shareToDrive = async (cloudinaryUrl, fileType = "image/png") => {
  // 1. Try native share (best for mobile Drive app)
  if (isMobile()) {
    return await shareFile({
      cloudinaryUrl,
      title: "Save to Drive",
      text: "Saving processed file to Google Drive",
      fileType,
    });
  }

  // 2. Desktop Flow: Copy URL and open Drive
  await copyUrlToClipboard(cloudinaryUrl);
  alert(
    "Link copied to clipboard! Opening Google Drive... You can:\n" +
      "1. Click 'New' → 'File Upload' and paste the image URL\n" +
      "2. Or download the file first using the link in your clipboard:\n" +
      cloudinaryUrl.substring(0, 60) +
      "...",
  );
  window.open("https://drive.google.com/drive/my-drive", "_blank");
  return { success: true };
};
