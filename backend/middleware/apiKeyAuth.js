import crypto from "crypto";
import dotenv from "dotenv";

/**
 * Middleware to authenticate automated publishing requests using an API Key.
 * Validates header: `x-api-key: process.env.BLOG_API_KEY`
 * Also permits `?api_key=` or `?apiKey=` query param for convenient browser debugging.
 */
export const verifyBlogApiKey = (req, res, next) => {
  // Reload .env if not loaded in memory yet (e.g. if modified while server is running)
  if (!process.env.BLOG_API_KEY) {
    dotenv.config();
  }

  const configuredKey = process.env.BLOG_API_KEY;

  if (!configuredKey) {
    console.error("❌ [Auth Error] BLOG_API_KEY is not defined in server environment variables or .env file.");
    return res.status(500).json({
      success: false,
      message: "Server configuration error: BLOG_API_KEY is missing on the server. Please check your .env file or Railway environment variables.",
    });
  }

  // Check header first (Express normalizes headers to lowercase), with query param fallback for browser testing
  const clientKey = req.headers["x-api-key"] || req.header("x-api-key") || req.query.api_key || req.query.apiKey;

  if (!clientKey) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Missing 'x-api-key' in request headers.",
    });
  }

  // Timing-safe comparison to prevent timing attacks
  const clientBuf = Buffer.from(String(clientKey));
  const serverBuf = Buffer.from(String(configuredKey));

  if (clientBuf.length !== serverBuf.length || !crypto.timingSafeEqual(clientBuf, serverBuf)) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid API key.",
    });
  }

  next();
};
