import mongoose from "mongoose";

const connectDB = async () => {
  try {
    let uri = (process.env.MONGODB_URL || "").trim();

    // Clean any accidental mongosh command prefix/quotes
    if (uri.startsWith("mongosh")) {
      const match = uri.match(/["'](mongodb(?:\+srv)?:\/\/[^"']+)["']/);
      if (match) uri = match[1];
    }

    if (!uri) {
      throw new Error("MONGODB_URL is missing in .env file");
    }

    await mongoose.connect(uri, {
      dbName: "OwnFresh"
    });
    console.log("✅ Database Connected Successfully (DB: OwnFresh)");
  } catch (error) {
    console.error("❌ Database Connection Error:", error.message);
    process.exit(1);
  }
};
export default connectDB;

