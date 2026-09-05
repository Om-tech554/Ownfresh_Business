import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

import Gallery from "../models/galleryModel.js";
import User from "../models/usermodel.js";

const galleryData = JSON.parse(fs.readFileSync(path.join(__dirname, "curated_gallery_data.json"), "utf8"));

async function seedGallery() {
  console.log("=================================================");
  console.log("🚀 SEEDING 50+ OWNFRESH GALLERY PHOTOS TO DB & BACKUPS");
  console.log("=================================================");

  // 1. Save to backup files
  const backupLiveDir = path.join(__dirname, "../backups/backup_complete_live");
  const dataBackupDir = path.join(__dirname, "../data_backup");

  fs.writeFileSync(path.join(backupLiveDir, "galleries.json"), JSON.stringify(galleryData, null, 2));
  fs.writeFileSync(path.join(dataBackupDir, "galleries.json"), JSON.stringify(galleryData, null, 2));
  console.log("✅ Written galleries.json to both backup directories.");

  // 2. Connect to MongoDB Atlas
  const mongoUri = process.env.MONGODB_URL;
  if (!mongoUri) {
    console.error("❌ MONGODB_URL is missing in .env!");
    process.exit(1);
  }

  await mongoose.connect(mongoUri, { dbName: "OwnFresh" });
  console.log("✅ Connected to MongoDB Atlas (OwnFresh DB).");

  // Find an admin user or system user for uploadedBy
  let uploader = await User.findOne({ role: "admin" });
  if (!uploader) {
    uploader = await User.findOne();
  }
  const uploaderId = uploader ? uploader._id : new mongoose.Types.ObjectId();

  // Clear existing dummy Unsplash gallery items and insert all authentic OwnFresh gallery items
  await Gallery.deleteMany({});
  console.log("🧹 Cleared old gallery items.");

  const docsToInsert = galleryData.map(item => ({
    ...item,
    uploadedBy: uploaderId
  }));

  const inserted = await Gallery.insertMany(docsToInsert);
  console.log(`🎉 Successfully inserted ${inserted.length} authentic OwnFresh gallery photos into MongoDB!`);

  await mongoose.disconnect();
  console.log("=================================================");
  console.log("✅ GALLERY SEEDING COMPLETED!");
  console.log("=================================================");
}

seedGallery().catch(console.error);
