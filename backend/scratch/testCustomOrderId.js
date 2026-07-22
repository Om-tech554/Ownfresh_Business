import mongoose from "mongoose";
import dotenv from "dotenv";
import Order from "../models/ordermodel.js";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("🟢 DB Connected!");
  } catch (error) {
    console.log("❌ DB Connection Error:", error.message);
    process.exit(1);
  }
};

const run = async () => {
  await connectDB();

  try {
    const year = new Date().getFullYear();
    const yearCode = `${year.toString().slice(0, 2)}${year.toString().slice(-1)}`;
    const orderCount = await Order.countDocuments();
    const sequenceStr = String(orderCount + 1).padStart(4, "0");
    const customOrderId = `MOF/${yearCode}/${sequenceStr}`;

    console.log("\n=== CUSTOM ORDER ID GENERATION TEST ===");
    console.log(`Current Year: ${year}`);
    console.log(`Year Code: ${yearCode}`);
    console.log(`Current Orders Count in DB: ${orderCount}`);
    console.log(`Next Sequence (Zero-padded): ${sequenceStr}`);
    console.log(`Generated Custom Order ID: ${customOrderId}`);
    console.log("Expected Format Sample: MOF/206/0035");

    if (/^MOF\/\d{3}\/\d{4}$/.test(customOrderId)) {
      console.log("\n✅ SUCCESS: Custom Order ID matches the format 'MOF/206/0035'!");
    } else {
      console.log("\n❌ FAILURE: Custom Order ID does not match expected format.");
    }

  } catch (error) {
    console.error("Test Error:", error.message);
  } finally {
    mongoose.connection.close();
    console.log("Disconnected from database.");
  }
};

run();
