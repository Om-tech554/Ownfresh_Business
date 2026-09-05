import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

async function restoreDatabase() {
    let mongoUri = (process.env.MONGODB_URL || "").trim();

    if (mongoUri.startsWith("mongosh")) {
        const match = mongoUri.match(/["'](mongodb(?:\+srv)?:\/\/[^"']+)["']/);
        if (match) mongoUri = match[1];
    }

    if (!mongoUri) {
        console.error("❌ MONGODB_URL is missing in backend/.env");
        process.exit(1);
    }

    const backupsBaseDir = path.join(__dirname, "../backups");
    if (!fs.existsSync(backupsBaseDir)) {
        console.error("❌ No backups folder found at:", backupsBaseDir);
        process.exit(1);
    }

    // List all backup folders
    const allBackups = fs.readdirSync(backupsBaseDir).filter(f => {
        return fs.statSync(path.join(backupsBaseDir, f)).isDirectory();
    }).sort().reverse();

    if (allBackups.length === 0) {
        console.error("❌ No backup directories found in:", backupsBaseDir);
        process.exit(1);
    }

    // Default to latest backup or argument
    const targetBackupFolder = process.argv[2] || allBackups[0];
    const backupDir = path.join(backupsBaseDir, targetBackupFolder);

    if (!fs.existsSync(backupDir)) {
        console.error("❌ Specified backup folder not found:", backupDir);
        process.exit(1);
    }

    console.log(`📂 Using Backup Folder: ${targetBackupFolder}`);
    console.log("🔌 Connecting to Target MongoDB...");

    try {
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 8000,
            dbName: "OwnFresh"
        });
        console.log("✅ Connected successfully to Target DB:", mongoose.connection.name || "MongoDB");
    } catch (err) {
        console.error("❌ Failed to connect to Target MongoDB:", err.message);
        process.exit(1);
    }

    try {
        const db = mongoose.connection.db;
        const files = fs.readdirSync(backupDir).filter(f => f.endsWith(".json") && f !== "backup_metadata.json");

        console.log(`Found ${files.length} collection file(s) to restore...\n`);

        for (const file of files) {
            const colName = path.basename(file, ".json");
            const filePath = path.join(backupDir, file);
            const content = fs.readFileSync(filePath, "utf-8");
            const documents = JSON.parse(content);

            if (!Array.isArray(documents) || documents.length === 0) {
                console.log(`  ⏩ Skipping [${colName}]: 0 documents`);
                continue;
            }

            const collection = db.collection(colName);

            // Insert documents with error handling for duplicates
            try {
                const result = await collection.insertMany(documents, { ordered: false });
                console.log(`  ✅ Restored [${colName}]: ${result.insertedCount} document(s)`);
            } catch (insertErr) {
                if (insertErr.code === 11000 || insertErr.writeErrors) {
                    console.log(`  ⚠️ Partial import for [${colName}]: some duplicate keys were skipped.`);
                } else {
                    console.error(`  ❌ Error restoring [${colName}]:`, insertErr.message);
                }
            }
        }

        console.log("\n========================================================");
        console.log("🎉 DATABASE RESTORE COMPLETED!");
        console.log("========================================================\n");

    } catch (err) {
        console.error("❌ Restore error:", err);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Disconnected from MongoDB.");
    }
}

restoreDatabase();
