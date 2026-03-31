import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/productModel.js";

dotenv.config();

const productsData = [
  {
    "name": "OwnFresh stone Pressed Kacchi Ghani 1 Litre Coconut Oil",
    "price": 1205.0,
    "image": "https://myownfresh.com/wp-content/uploads/2025/06/coconut-1.png",
    "shortDesc": "Good Food Language. Kacchi Ghani oil. Unrefined Unfiltered. Quality Guaranteed. 100% Natural.",
    "rating": 5
  },
  {
    "name": "OwnFresh stone Pressed Kacchi Ghani 5 Litre Coconut Oil",
    "price": 6025.0,
    "image": "https://myownfresh.com/wp-content/uploads/2026/02/coconut-oil-5.png",
    "shortDesc": "Good Food Language. Kacchi Ghani oil. Unrefined Unfiltered. Quality Guaranteed. 100% Natural.",
    "rating": 5
  },
  {
    "name": "OwnFresh stone Pressed Kacchi Ghani 1 Liter Groundnut Oil",
    "price": 605.0,
    "image": "https://myownfresh.com/wp-content/uploads/2025/06/Groundnut-1.png",
    "shortDesc": "Good Food Language. Kacchi Ghani oil. Unrefined Unfiltered. Quality Guaranteed. 100% Natural.",
    "rating": 5
  },
  {
    "name": "OwnFresh stone Pressed Kacchi Ghani 1 Litre Mustard Oil",
    "price": 575.0,
    "image": "https://myownfresh.com/wp-content/uploads/2025/06/Mustard-1.png",
    "shortDesc": "Good Food Language. Kacchi Ghani oil. Unrefined Unfiltered. Quality Guaranteed. 100% Natural.",
    "rating": 5
  },
  {
    "name": "OwnFresh stone Pressed Kacchi Ghani 1 Litre Safflower Oil",
    "price": 580.0,
    "image": "https://myownfresh.com/wp-content/uploads/2025/06/safflower-1.png",
    "shortDesc": "Good Food Language. Kacchi Ghani oil. Unrefined Unfiltered. Quality Guaranteed. 100% Natural.",
    "rating": 5
  },
  {
    "name": "OwnFresh stone Pressed Kacchi Ghani 1 Litre Sesame Oil",
    "price": 680.0,
    "image": "https://myownfresh.com/wp-content/uploads/2025/06/sesame-1.png",
    "shortDesc": "Good Food Language. Kacchi Ghani oil. Unrefined Unfiltered. Quality Guaranteed. 100% Natural.",
    "rating": 5
  },
  {
    "name": "OwnFresh stone Pressed Kacchi Ghani 1 Litre Sunflower Oil",
    "price": 540.0,
    "image": "https://myownfresh.com/wp-content/uploads/2025/06/sunflower-1.png",
    "shortDesc": "Good Food Language. Kacchi Ghani oil. Unrefined Unfiltered. Quality Guaranteed. 100% Natural.",
    "rating": 5
  },
  {
    "name": "OwnFresh stone Pressed Kacchi Ghani 250 ML Coconut Oil",
    "price": 350.0,
    "image": "https://myownfresh.com/wp-content/uploads/2025/03/coconut-3.png",
    "shortDesc": "Good Food Language. Kacchi Ghani oil. Unrefined Unfiltered. Quality Guaranteed. 100% Natural.",
    "rating": 5
  },
  {
    "name": "OwnFresh stone Pressed Kacchi Ghani 250 ML Groundnut Oil",
    "price": 195.0,
    "image": "https://myownfresh.com/wp-content/uploads/2025/03/Groundnut-3.png",
    "shortDesc": "Good Food Language. Kacchi Ghani oil. Unrefined Unfiltered. Quality Guaranteed. 100% Natural.",
    "rating": 5
  },
  {
    "name": "OwnFresh stone Pressed Kacchi Ghani 250 ML Mustard Oil",
    "price": 185.0,
    "image": "https://myownfresh.com/wp-content/uploads/2025/03/Mustard-3.png",
    "shortDesc": "Good Food Language. Kacchi Ghani oil. Unrefined Unfiltered. Quality Guaranteed. 100% Natural.",
    "rating": 5
  },
  {
    "name": "OwnFresh stone Pressed Kacchi Ghani 250 ML Safflower Oil",
    "price": 190.0,
    "image": "https://myownfresh.com/wp-content/uploads/2025/02/safflower-3.png",
    "shortDesc": "Good Food Language. Kacchi Ghani oil. Unrefined Unfiltered. Quality Guaranteed. 100% Natural.",
    "rating": 5
  },
  {
    "name": "OwnFresh stone Pressed Kacchi Ghani 250 ML Sesame Oil",
    "price": 210.0,
    "image": "https://myownfresh.com/wp-content/uploads/2025/03/sesame-3.png",
    "shortDesc": "Good Food Language. Kacchi Ghani oil. Unrefined Unfiltered. Quality Guaranteed. 100% Natural.",
    "rating": 5
  },
  {
    "name": "OwnFresh stone Pressed Kacchi Ghani 250 ML Sunflower Oil",
    "price": 180.0,
    "image": "https://myownfresh.com/wp-content/uploads/2025/03/sunflower-3.png",
    "shortDesc": "Good Food Language. Kacchi Ghani oil. Unrefined Unfiltered. Quality Guaranteed. 100% Natural.",
    "rating": 5
  },
  {
    "name": "OwnFresh stone Pressed Kacchi Ghani 5 Liter Groundnut Oil",
    "price": 3025.0,
    "image": "https://myownfresh.com/wp-content/uploads/2026/02/Groundnut-Oil-5.png",
    "shortDesc": "Good Food Language. Kacchi Ghani oil. Unrefined Unfiltered. Quality Guaranteed. 100% Natural.",
    "rating": 5
  },
  {
    "name": "OwnFresh stone Pressed Kacchi Ghani 5 Litre Mustard Oil",
    "price": 2875.0,
    "image": "https://myownfresh.com/wp-content/uploads/2026/02/Mustard-Oil-5.png",
    "shortDesc": "Good Food Language. Kacchi Ghani oil. Unrefined Unfiltered. Quality Guaranteed. 100% Natural.",
    "rating": 5
  },
  {
    "name": "OwnFresh stone Pressed Kacchi Ghani 5 Litre Safflower Oil",
    "price": 3025.0,
    "image": "https://myownfresh.com/wp-content/uploads/2026/02/Safflower-Oil-5.png",
    "shortDesc": "Good Food Language. Kacchi Ghani oil. Unrefined Unfiltered. Quality Guaranteed. 100% Natural.",
    "rating": 5
  },
  {
    "name": "OwnFresh stone Pressed Kacchi Ghani 5 Litre Sesame Oil",
    "price": 3400.0,
    "image": "https://myownfresh.com/wp-content/uploads/2026/02/sesame-Oil-5.png",
    "shortDesc": "Good Food Language. Kacchi Ghani oil. Unrefined Unfiltered. Quality Guaranteed. 100% Natural.",
    "rating": 5
  },
  {
    "name": "OwnFresh stone Pressed Kacchi Ghani 5 Litre Sunflower Oil",
    "price": 2700.0,
    "image": "https://myownfresh.com/wp-content/uploads/2026/02/sunflower-oil-5.png",
    "shortDesc": "Good Food Language. Kacchi Ghani oil. Unrefined Unfiltered. Quality Guaranteed. 100% Natural.",
    "rating": 5
  },
  {
    "name": "OwnFresh stone Pressed Kacchi Ghani 500 ML Coconut Oil",
    "price": 635.0,
    "image": "https://myownfresh.com/wp-content/uploads/2025/03/Coconut-2.png",
    "shortDesc": "Good Food Language. Kacchi Ghani oil. Unrefined Unfiltered. Quality Guaranteed. 100% Natural.",
    "rating": 5
  },
  {
    "name": "OwnFresh stone Pressed Kacchi Ghani 500 ML Combo pack of 3",
    "price": 950.0,
    "image": "https://myownfresh.com/wp-content/uploads/2025/08/Groundnut-coconut-sesame-Combo-1.png",
    "shortDesc": "Good Food Language. Kacchi Ghani oil. Unrefined Unfiltered. Quality Guaranteed. 100% Natural.",
    "rating": 5
  },
  {
    "name": "OwnFresh stone Pressed Kacchi Ghani 500 ML Combo pack of 3",
    "price": 1310.0,
    "image": "https://myownfresh.com/wp-content/uploads/2025/08/mustard-coconut-sesame-Combo-1.png",
    "shortDesc": "Good Food Language. Kacchi Ghani oil. Unrefined Unfiltered. Quality Guaranteed. 100% Natural.",
    "rating": 5
  },
  {
    "name": "OwnFresh stone Pressed Kacchi Ghani 500 ML Combo pack of 3",
    "price": 990.0,
    "image": "https://myownfresh.com/wp-content/uploads/2025/08/Safflower-Groundnut-sunflower-Combo.png",
    "shortDesc": "Good Food Language. Kacchi Ghani oil. Unrefined Unfiltered. Quality Guaranteed. 100% Natural.",
    "rating": 5
  },
  {
    "name": "OwnFresh stone Pressed Kacchi Ghani 500 ML Groundnut Oil",
    "price": 330.0,
    "image": "https://myownfresh.com/wp-content/uploads/2025/03/Groundnut-2.png",
    "shortDesc": "Good Food Language. Kacchi Ghani oil. Unrefined Unfiltered. Quality Guaranteed. 100% Natural.",
    "rating": 5
  },
  {
    "name": "OwnFresh stone Pressed Kacchi Ghani 500 ML Safflower Oil",
    "price": 320.0,
    "image": "https://myownfresh.com/wp-content/uploads/2025/02/safflower-2.png",
    "shortDesc": "Good Food Language. Kacchi Ghani oil. Unrefined Unfiltered. Quality Guaranteed. 100% Natural.",
    "rating": 5
  },
  {
    "name": "OwnFresh stone Pressed Kacchi Ghani 500 ML Sesame Oil",
    "price": 360.0,
    "image": "https://myownfresh.com/wp-content/uploads/2025/03/sesame-2.png",
    "shortDesc": "Good Food Language. Kacchi Ghani oil. Unrefined Unfiltered. Quality Guaranteed. 100% Natural.",
    "rating": 5
  },
  {
    "name": "OwnFresh stone Pressed Kacchi Ghani 500 ML Sunflower Oil",
    "price": 300.0,
    "image": "https://myownfresh.com/wp-content/uploads/2025/03/sunflower-2.png",
    "shortDesc": "Good Food Language. Kacchi Ghani oil. Unrefined Unfiltered. Quality Guaranteed. 100% Natural.",
    "rating": 5
  },
  {
    "name": "OwnFresh stone Pressed Kacchi Ghani 500ML Mustard Oil",
    "price": 315.0,
    "image": "https://myownfresh.com/wp-content/uploads/2025/03/Mustard-2.png",
    "shortDesc": "Good Food Language. Kacchi Ghani oil. Unrefined Unfiltered. Quality Guaranteed. 100% Natural.",
    "rating": 5
  },
  {
    "name": "OwnFresh Stone Pressed Kacchi Ghani Oil 1L Combo pack of 3",
    "price": 1725.0,
    "image": "https://myownfresh.com/wp-content/uploads/2025/11/Groundnut-sunflower-sesame-Combo-1L.png",
    "shortDesc": "Good Food Language. Kacchi Ghani oil. Unrefined Unfiltered. Quality Guaranteed. 100% Natural.",
    "rating": 5
  },
  {
    "name": "OwnFresh Stone Pressed Kacchi Ghani Oil 1L Combo pack of 3",
    "price": 2460.0,
    "image": "https://myownfresh.com/wp-content/uploads/2025/11/mustard-coconut-sesame-Combo-1L.png",
    "shortDesc": "Good Food Language. Kacchi Ghani oil. Unrefined Unfiltered. Quality Guaranteed. 100% Natural.",
    "rating": 5
  },
  {
    "name": "OwnFresh Stone Pressed Kacchi Ghani Oil 1L Combo pack of 3",
    "price": 1827.0,
    "image": "https://myownfresh.com/wp-content/uploads/2025/11/Safflower-Groundnut-sunflower-Combo-1L.png",
    "shortDesc": "Good Food Language. Kacchi Ghani oil. Unrefined Unfiltered. Quality Guaranteed. 100% Natural.",
    "rating": 5
  },
  {
    "name": "OwnFresh Stone Pressed Kacchi Ghani Oil 250 ML Combo pack of 5",
    "price": 960.0,
    "image": "https://myownfresh.com/wp-content/uploads/2025/08/Combo-250-ml.png",
    "shortDesc": "Good Food Language. Kacchi Ghani oil. Unrefined Unfiltered. Quality Guaranteed. 100% Natural.",
    "rating": 5
  },
  {
    "name": "OwnFresh Stone Pressed Kacchi Ghani Oil 250 ML Combo pack of 5",
    "price": 1100.0,
    "image": "https://myownfresh.com/wp-content/uploads/2025/08/Combo-250-ml-2.png",
    "shortDesc": "Good Food Language. Kacchi Ghani oil. Unrefined Unfiltered. Quality Guaranteed. 100% Natural.",
    "rating": 5
  }
];

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Database connected successfully!");

    // Clear existing products
    await Product.deleteMany({});
    console.log("Existing products cleared.");

    // Insert new products
    await Product.insertMany(productsData);
    console.log(`Successfully migrated ${productsData.length} products!`);

    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrate();
