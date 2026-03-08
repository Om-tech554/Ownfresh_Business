import cloudinary from "cloudinary";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Fix __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config();

// Configure Cloudinary (MATCHES YOUR .env)
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Get file name from terminal argument
const fileName = process.argv[2];

if (!fileName) {
  console.log("❌ Please provide file name.");
  console.log("Example: node uploadLocalMediaToCloudinary.js oil.png");
  process.exit(1);
}

// Path to local_uploads folder
const filePath = path.join(__dirname, "media", fileName);

// Check if file exists
if (!fs.existsSync(filePath)) {
  console.log("❌ File not found:", filePath);
  process.exit(1);
}

// Detect resource type automatically
const getResourceType = (file) => {
  const ext = file.split(".").pop().toLowerCase();

  if (["mp4", "mov", "avi", "webm", "mkv"].includes(ext)) {
    return "video";
  }

  if (["jpg", "jpeg", "png", "svg", "webp", "gif"].includes(ext)) {
    return "image";
  }

  return "auto";
};

async function uploadMedia() {
  try {
    const resourceType = getResourceType(fileName);

    const result = await cloudinary.v2.uploader.upload(filePath, {
      folder: "ownfresh_media",
      resource_type: resourceType,
    });

    console.log("\n✅ Upload Successful!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Type:", resourceType);
    console.log("Public ID:", result.public_id);
    console.log("Secure URL:", result.secure_url);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  } catch (error) {
    console.error("❌ Upload Failed:");
    console.error(error);
  }
}

uploadMedia();
