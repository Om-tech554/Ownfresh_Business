import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import cloudinary from "../utils/cloudinary.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadLocalImage = async () => {
  const args = process.argv.slice(2);
  const filePath = args[0];

  if (!filePath) {
    console.log("\n=======================================================");
    console.log("📸 CLOUDINARY QUICK IMAGE UPLOADER");
    console.log("=======================================================");
    console.log("Usage: node scripts/uploadLocalMediaToCloudinary.js <file-path-or-folder>");
    console.log("Example 1: node scripts/uploadLocalMediaToCloudinary.js media/logo.png");
    console.log("Example 2: node scripts/uploadLocalMediaToCloudinary.js C:/Users/Downloads/my-photo.jpg");
    console.log("=======================================================\n");
    process.exit(1);
  }

  const targetPath = path.isAbsolute(filePath) ? filePath : path.join(__dirname, "..", filePath);

  if (!fs.existsSync(targetPath)) {
    console.error(`❌ Error: File or directory not found at "${targetPath}"`);
    process.exit(1);
  }

  const stat = fs.statSync(targetPath);
  const filesToUpload = stat.isDirectory()
    ? fs.readdirSync(targetPath).map(f => path.join(targetPath, f)).filter(f => /\.(png|jpe?g|webp|gif|svg)$/i.test(f))
    : [targetPath];

  console.log(`\n🚀 Uploading ${filesToUpload.length} image(s) to Cloudinary...\n`);

  for (const file of filesToUpload) {
    try {
      const result = await cloudinary.uploader.upload(file, {
        folder: "ownfresh_media",
        resource_type: "image"
      });
      console.log(`✅ Success: ${path.basename(file)}`);
      console.log(`🔗 Cloudinary URL: ${result.secure_url}\n`);
    } catch (err) {
      console.error(`❌ Failed: ${path.basename(file)} - ${err.message}`);
    }
  }

  process.exit(0);
};

uploadLocalImage();
