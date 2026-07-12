import admin from "../config/firebaseAdmin.js";

export const verifyAppCheck = async (req, res, next) => {
    // Only enforce if the env var requires it, making it easier for local testing if needed
    if (process.env.NODE_ENV !== "production" && !process.env.ENFORCE_APP_CHECK) {
        return next();
    }

    const appCheckToken = req.headers['x-firebase-appcheck'];

    if (!appCheckToken) {
        return res.status(401).json({ message: "Unauthorized. Missing App Check token." });
    }

    try {
        const appCheckClaims = await admin.appCheck().verifyToken(appCheckToken);
        req.appCheckClaims = appCheckClaims;
        return next();
    } catch (err) {
        console.error("App Check Verification Error:", err.message);
        return res.status(401).json({ message: "Unauthorized. Invalid App Check token." });
    }
};
