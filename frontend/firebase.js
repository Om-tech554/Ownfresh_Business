// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "myownfresh-169f0.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "myownfresh-169f0",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "myownfresh-169f0.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "250708106658",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:250708106658:web:eeb5462a2e073a481d26fb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize App Check
let appCheck;
if (typeof window !== "undefined") {
  if (import.meta.env.DEV) {
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }
  
  if (import.meta.env.VITE_RECAPTCHA_SITE_KEY) {
    appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
      isTokenAutoRefreshEnabled: true
    });
  }
}

/**
 * Setup invisible RecaptchaVerifier for Phone OTP
 */
export const setUpRecaptcha = (containerId = "recaptcha-container") => {
  if (typeof window === "undefined") return null;

  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch (e) {
      console.warn("Recaptcha reset notice:", e);
    }
  }

  window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: "invisible",
    callback: () => {
      // reCAPTCHA solved
    },
    "expired-callback": () => {
      console.warn("reCAPTCHA expired. Please try sending OTP again.");
    }
  });

  return window.recaptchaVerifier;
};

export { app, auth, appCheck, signInWithPhoneNumber, GoogleAuthProvider, signInWithPopup };