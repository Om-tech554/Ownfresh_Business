import adminApp from "../config/firebaseAdmin.js";
import { getAppCheck } from "firebase-admin/app-check";

export const verifyAppCheck = async (req, res, next) => {
    // Allow PhonePe callback webhook to bypass App Check
    if (req.originalUrl && req.originalUrl.includes("/phonepe-callback")) {
        return next();
    }

    // Only enforce if explicitly requested via environment variable.
    if (process.env.ENFORCE_APP_CHECK !== "true") {
        return next();
    }

    if (!adminApp) {
        // Admin SDK not initialized (missing env variables), bypass App Check
        console.warn("⚠️ Bypassing App Check: Firebase Admin SDK is not configured.");
        return next();
    }

    const appCheckToken = req.headers['x-firebase-appcheck'];

    if (!appCheckToken) {
        return res.status(401).json({ message: "Unauthorized. Missing App Check token." });
    }

    try {
        const appCheckClaims = await getAppCheck(adminApp).verifyToken(appCheckToken);
        req.appCheckClaims = appCheckClaims;
        return next();
    } catch (err) {
        console.error("App Check Verification Error:", err.message);
        return res.status(401).json({ message: "Unauthorized. Invalid App Check token." });
    }
};
