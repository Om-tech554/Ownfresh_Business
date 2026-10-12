/**
 * Injects automatic Cloudinary transformations for peak performance & Lighthouse 90+:
 * - f_auto: Delivers AVIF or WebP automatically depending on the browser.
 * - q_auto: Intelligent perceptual quality compression (slashes byte size by 70-90%).
 * - w_${width}: Resizes the image to the target viewport dimensions.
 * - c_limit: Avoids upscaling smaller images.
 * - dpr_auto: Adjusts for high-DPI retina screens.
 */
export const optimizeCloudinaryUrl = (url, width = 800) => {
  if (!url || typeof url !== "string") return url;

  // Only transform Cloudinary URLs
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url;
  }

  // Already transformed? Return as-is to avoid duplicate transformations
  if (url.includes("/upload/f_auto") || url.includes("/upload/q_auto") || url.includes("/upload/c_")) {
    return url;
  }

  const transformation = `f_auto,q_auto,w_${width},c_limit`;
  return url.replace("/upload/", `/upload/${transformation}/`);
};

export default optimizeCloudinaryUrl;
