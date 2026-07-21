import mongoose from "mongoose";

const carrierSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  baseTrackingUrl: { type: String, required: true },
  logo: { type: String },
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.Carrier || mongoose.model("Carrier", carrierSchema);
