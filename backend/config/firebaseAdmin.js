import { initializeApp, getApps, cert } from "firebase-admin/app";
import dotenv from "dotenv";

dotenv.config();

let adminApp = null;

if (!getApps().length) {
    try {
        if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
            console.warn("⚠️ Firebase Admin SDK: Missing environment variables. Firebase features (like App Check) will not work.");
        } else {
            adminApp = initializeApp({
                credential: cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    // Replace escaped newlines if provided in env
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                }),
            });
            console.log("🔥 Firebase Admin SDK initialized successfully.");
        }
    } catch (error) {
        console.error("Firebase Admin SDK Initialization Error:", error.message);
    }
} else {
    adminApp = getApps()[0];
}

export default adminApp;
