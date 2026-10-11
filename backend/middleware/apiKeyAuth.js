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

  const rawConfiguredKey = process.env.BLOG_API_KEY;
  const configuredKey = rawConfiguredKey ? String(rawConfiguredKey).trim().replace(/^["']|["']$/g, "") : "";

  if (!configuredKey) {
    console.error("❌ [Auth Error] BLOG_API_KEY is not defined in server environment variables or .env file.");
    return res.status(500).json({
      success: false,
      message: "Server configuration error: BLOG_API_KEY is missing on the server. Please check your .env file or Railway environment variables.",
    });
  }

  // Check header first (Express normalizes headers to lowercase)
  // Supports: x-api-key, api-key, x-api-token, Authorization: Bearer <key>, query params ?api_key= / ?apiKey=
  let authBearer = "";
  const authHeader = req.headers["authorization"] || req.header("authorization") || "";
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    authBearer = authHeader.slice(7).trim();
  }

  const rawClientKey = (
    req.headers["x-api-key"] ||
    req.header("x-api-key") ||
    req.headers["api-key"] ||
    req.header("api-key") ||
    req.headers["x-api-token"] ||
    req.header("x-api-token") ||
    authBearer ||
    req.query.api_key ||
    req.query.apiKey ||
    ""
  );

  const clientKey = String(rawClientKey).trim().replace(/^["']|["']$/g, "");

  if (!clientKey) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Missing 'x-api-key' in request headers.",
    });
  }

  // Timing-safe comparison to prevent timing attacks
  const clientBuf = Buffer.from(clientKey);
  const serverBuf = Buffer.from(configuredKey);

  if (clientBuf.length !== serverBuf.length || !crypto.timingSafeEqual(clientBuf, serverBuf)) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid API key.",
    });
  }

  next();
};
