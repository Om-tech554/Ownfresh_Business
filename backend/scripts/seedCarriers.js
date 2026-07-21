import mongoose from "mongoose";
import dotenv from "dotenv";
import Carrier from "../models/carrierModel.js";

dotenv.config();

const carriersData = [
  { name: "Blue Dart", baseTrackingUrl: "https://www.bluedart.com/tracking?trackids=" },
  { name: "Delhivery", baseTrackingUrl: "https://www.delhivery.com/track/package/" },
  { name: "DTDC", baseTrackingUrl: "https://www.dtdc.in/tracking/tracking_results.asp?trckNo=" },
  { name: "XpressBees", baseTrackingUrl: "https://www.xpressbees.com/track?shipment_id=" },
  { name: "India Post", baseTrackingUrl: "https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignments.aspx?consignNo=" },
  { name: "Professional Couriers", baseTrackingUrl: "http://www.tpcindia.com/Default.aspx?AWB=" },
  { name: "Shadowfax", baseTrackingUrl: "https://track.shadowfax.in/track?awb=" },
  { name: "Ekart", baseTrackingUrl: "https://ekartlogistics.com/track/" },
  { name: "Ecom Express", baseTrackingUrl: "https://ecomexpress.in/tracking/?awb_field=" }
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Database connected successfully for seeding carriers!");

    // Clear existing carriers
    await Carrier.deleteMany({});
    console.log("Existing carriers cleared.");

    // Insert carriers
    await Carrier.insertMany(carriersData);
    console.log(`Successfully seeded ${carriersData.length} carriers!`);

    process.exit(0);
  } catch (error) {
    console.error("Carrier seeding failed:", error);
    process.exit(1);
  }
};

seed();
