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
import referralRoutes from "./routes/referralRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import { initCronJobs } from "./utils/cronJobs.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express()
app.set("trust proxy", 1); // Required for secure cookies on Render
const port = process.env.PORT || 10000

const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:3000"
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin) || origin.includes("localhost") || origin.includes("127.0.0.1")) {
            return callback(null, true);
        }
        if (origin.endsWith(".onrender.com")) {
           return callback(null, true);
        }
        return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())
app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/product", productRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/referral", referralRoutes);
app.use("/api/coupon", couponRoutes);

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