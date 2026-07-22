import dotenv from "dotenv"
dotenv.config() // Load env vars FIRST before anything else
import express from "express"
import connectDB from "./config/db.js"
import cookieParser from "cookie-parser"
import authRouter from "./routes/authrouter.js"
import cors from "cors"
import userRouter from "./routes/userroutes.js"
import productRoutes from "./routes/productRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import newsletterRoutes from "./routes/newsletterRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import galleryRoutes from "./routes/galleryRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import fulfillmentRoutes from "./routes/fulfillmentRoutes.js";
import path from "path";
import helmet from "helmet";
import { fileURLToPath } from "url";
import { initCronJobs } from "./utils/cronJobs.js";
import { verifyAppCheck } from "./middleware/appCheckMiddleware.js";
import requestIdMiddleware from "./middleware/requestIdMiddleware.js";
import referralRoutes from "./routes/referralRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express()
app.use(requestIdMiddleware);
app.set("trust proxy", 1); // Required for secure cookies on Render
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://checkout.razorpay.com", "https://apis.google.com", "https://www.gstatic.com"],
      frameSrc: ["'self'", "https://api.razorpay.com", "https://checkout.razorpay.com", "https://own-fresh.firebaseapp.com", "https://www.google.com"],
      connectSrc: ["'self'", "https://api.geoapify.com", "https://api.razorpay.com", "https://*.onrender.com", "https://identitytoolkit.googleapis.com", "https://securetoken.googleapis.com", "https://firebaseinstallations.googleapis.com", "https://content-firebaseappcheck.googleapis.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://*.tile.openstreetmap.org", "https://lh3.googleusercontent.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
})); // Set standard security headers
const port = process.env.PORT || 10000

const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:3000"
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        // Very strict - only allow if exactly in allowedOrigins (for prod)
        if (origin.endsWith(".onrender.com")) {
           return callback(null, true);
        }
        return callback(new Error(`CORS blocked: unauthorized origin ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Firebase-AppCheck']
}))
app.use(express.json())
app.use(cookieParser())

// Protect API routes with App Check
app.use("/api", verifyAppCheck)
app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/product", productRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/coupon", couponRoutes);
app.use("/api/referral", referralRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/fulfillment", fulfillmentRoutes);
app.use("/api/settings", settingsRoutes);

// --- STATIC FILES & SPA ROUTING FIX ---
const __frontendDir = path.join(__dirname, "../frontend/dist");
app.use(express.static(__frontendDir));

// This catch-all middleware must be the LAST one
app.use((req, res) => {
    // If it's an API request that wasn't caught, return 404 instead of index.html
    if (req.url.startsWith("/api/")) {
        return res.status(404).json({ message: "API route not found" });
    }
    res.sendFile(path.join(__frontendDir, "index.html"));
});

app.listen(port, () => {
    connectDB()
    initCronJobs() // 🚀 Initialize Background Sync
    console.log(`🚀 Server running on port ${port}`);
})