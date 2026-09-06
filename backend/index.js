import dotenv from "dotenv"
dotenv.config() // Load env vars FIRST before anything else
import express from "express"
import axios from "axios"
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
import ticketRoutes from "./routes/ticketRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import campaignRoutes from "./routes/campaignRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import galleryRoutes from "./routes/galleryRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import fulfillmentRoutes from "./routes/fulfillmentRoutes.js";
import path from "path";
import fs from "fs";
import helmet from "helmet";
import { fileURLToPath } from "url";
import { initCronJobs } from "./utils/cronJobs.js";
import { verifyAppCheck } from "./middleware/appCheckMiddleware.js";
import requestIdMiddleware from "./middleware/requestIdMiddleware.js";
import referralRoutes from "./routes/referralRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import membershipRoutes from "./routes/membershipRoutes.js";
import sitemapRoutes from "./routes/sitemapRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import tagRoutes from "./routes/tagRoutes.js";

import { deactivateAllExistingMembers } from "./controllers/membershipController.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express()
app.use(requestIdMiddleware);
app.set("trust proxy", 1); // Required for secure cookies on Render
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://apis.google.com", "https://www.gstatic.com", "https://www.googletagmanager.com"],
            frameSrc: ["'self'", "https://api.phonepe.com", "https://api-preprod.phonepe.com", "https://mercury.phonepe.com", "https://mercury-t2.phonepe.com", "https://own-fresh.firebaseapp.com", "https://www.google.com", "https://myownfresh.com", "https://www.myownfresh.com"],
            connectSrc: ["'self'", "https://api.phonepe.com", "https://api-preprod.phonepe.com", "https://mercury.phonepe.com", "https://api.geoapify.com", "https://nominatim.openstreetmap.org", "https://api.bigdatacloud.net", "https://ipapi.co", "https://ip-api.com", "https://*.onrender.com", "https://myownfresh.com", "https://www.myownfresh.com", "https://identitytoolkit.googleapis.com", "https://securetoken.googleapis.com", "https://firebaseinstallations.googleapis.com", "https://content-firebaseappcheck.googleapis.com"],
            imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://api.qrserver.com", "https://*.tile.openstreetmap.org", "https://lh3.googleusercontent.com"],
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
})); // Set standard security headers
const port = process.env.PORT || 10000

const allowedOrigins = [
    process.env.FRONTEND_URL,
    "https://myownfresh.com",
    "https://www.myownfresh.com",
    "http://localhost:5173",
    "http://localhost:3000"
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const cleanOrigin = origin.replace(/\/+$/, "");
        if (allowedOrigins.some(o => o && o.replace(/\/+$/, "") === cleanOrigin)) {
            return callback(null, true);
        }
        if (cleanOrigin.endsWith("myownfresh.com") || cleanOrigin.endsWith(".onrender.com")) {
            return callback(null, true);
        }
        return callback(new Error(`CORS blocked: unauthorized origin ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Firebase-AppCheck']
}))
app.use(express.json())
app.use(cookieParser())

import { apiGlobalLimiter } from "./middleware/rateLimiter.js";

// Protect API routes with Global Limiter & App Check
app.use("/api", apiGlobalLimiter);
app.use("/api", verifyAppCheck);
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter)
app.use("/api/product", productRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/ticket", ticketRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/coupon", couponRoutes);
app.use("/api/campaign", campaignRoutes);
app.use("/api/referral", referralRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/fulfillment", fulfillmentRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/membership", membershipRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/tag", tagRoutes);
app.use("/", sitemapRoutes);


// --- STATIC MEDIA & WORDPRESS PHOTOS SERVING ---
const __mediaDir = path.join(__dirname, "media");
app.use("/media", express.static(__mediaDir));

// Fallback for legacy WordPress media URLs
app.use("/wp-content/uploads", (req, res, next) => {
    const filename = path.basename(req.path);
    const photoPath = path.join(__mediaDir, "wordpress_photos", filename);
    res.sendFile(photoPath, (err) => {
        if (err) next();
    });
});

// --- STATIC FILES & SPA ROUTING FIX ---
const __frontendDir = path.join(__dirname, "../frontend/dist");
const __indexPath = path.join(__frontendDir, "index.html");

if (fs.existsSync(__frontendDir)) {
    app.use(express.static(__frontendDir));
}

// Catch-all middleware for client routing & API health status
app.use((req, res) => {
    // If it's an API request that wasn't caught, return 404
    if (req.url.startsWith("/api/")) {
        return res.status(404).json({ message: "API route not found" });
    }
    // If frontend build exists, serve it
    if (fs.existsSync(__indexPath)) {
        return res.sendFile(__indexPath);
    }
    // Fallback if backend is hosted as standalone API service on Render
    return res.status(200).json({
        success: true,
        message: "OwnFresh Backend API is live and running",
        environment: process.env.NODE_ENV || "development"
    });
});

app.listen(port, async () => {
    await connectDB();
    initCronJobs(); // 🚀 Initialize Background Sync

    // ⚡ Keep-Alive Ping to Prevent Render Cold Start Sleep
    const pingTarget = process.env.BACKEND_URL || "https://myownfresh.com/api/category/all";
    setInterval(async () => {
        try {
            await axios.get(pingTarget);
            console.log("⚡ Keep-alive ping executed to prevent Render cold start");
        } catch (e) {
            // Keep alive fail silent
        }
    }, 9 * 60 * 1000); // Self-ping every 9 minutes

    console.log(`🚀 Server running on port ${port}`);
})