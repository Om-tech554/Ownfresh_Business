// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
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
const auth=getAuth(app)
export {app,auth}