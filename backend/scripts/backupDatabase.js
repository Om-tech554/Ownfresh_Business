import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

async function backupDatabase() {
    let mongoUri = (process.env.MONGODB_URL || "").trim();

    // Clean quotes or mongosh prefix
    if (mongoUri.startsWith("mongosh")) {
        const match = mongoUri.match(/["'](mongodb(?:\+srv)?:\/\/[^"']+)["']/);
        if (match) mongoUri = match[1];
    }

    if (!mongoUri) {
        console.error("❌ MONGODB_URL is missing in backend/.env");
        process.exit(1);
    }

    console.log("🔌 Connecting to MongoDB for Backup...");
    try {
        await mongoose.connect(mongoUri);
        console.log("✅ Connected successfully to:", mongoose.connection.name || "MongoDB");
    } catch (err) {
        console.error("❌ Failed to connect to MongoDB:", err.message);
        process.exit(1);
    }

    try {
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();

        if (collections.length === 0) {
            console.log("⚠️ No collections found in the database.");
            await mongoose.disconnect();
            return;
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const backupDir = path.join(__dirname, "../backups", `backup_${timestamp}`);

        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        console.log(`\n📦 Starting Backup into: ${backupDir}`);
        console.log(`Found ${collections.length} collection(s) to export:\n`);

        const summary = {};

        for (const colInfo of collections) {
            const colName = colInfo.name;
            // Skip system collections
            if (colName.startsWith("system.")) continue;

            const collection = db.collection(colName);
            const documents = await collection.find({}).toArray();

            const filePath = path.join(backupDir, `${colName}.json`);
            fs.writeFileSync(filePath, JSON.stringify(documents, null, 2), "utf-8");

            summary[colName] = documents.length;
            console.log(`  💾 Exported [${colName}]: ${documents.length} document(s) -> ${colName}.json`);
        }

        // Save metadata
        const metadata = {
            timestamp: new Date().toISOString(),
            databaseName: mongoose.connection.name,
            totalCollections: Object.keys(summary).length,
            collectionsSummary: summary
        };
        fs.writeFileSync(path.join(backupDir, "backup_metadata.json"), JSON.stringify(metadata, null, 2), "utf-8");

        console.log("\n========================================================");
        console.log("🎉 DATABASE BACKUP COMPLETED SUCCESSFULLY!");
        console.log(`📁 Location: ${backupDir}`);
        console.log("========================================================\n");

    } catch (err) {
        console.error("❌ Backup error:", err);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Disconnected from MongoDB.");
    }
}

backupDatabase();
