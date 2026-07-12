// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey:import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "own-fresh.firebaseapp.com",
  projectId: "own-fresh",
  storageBucket: "own-fresh.firebasestorage.app",
  messagingSenderId: "250708106658",
  appId: "1:250708106658:web:eeb5462a2e073a481d26fb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize App Check
let appCheck;
if (typeof window !== "undefined") {
    // Optional: allow localhost debug token without breaking production
    if (import.meta.env.DEV) {
        self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }
    
    appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY || "dummy_key_until_configured"),
        isTokenAutoRefreshEnabled: true
    });
}

export { app, auth, appCheck };