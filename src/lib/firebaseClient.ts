import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

// Prefer env vars from .env.local; fallbacks ensure auth works if env is not loaded (e.g. after clone).
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "AIzaSyAJZ7jU8vB9xOGvFxAPh3xWMEXsDB6bQDM",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "accessdenied-6bc25.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "accessdenied-6bc25",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "accessdenied-6bc25.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "28734985747",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "1:28734985747:web:753cc07854d8769a4f11e6",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "G-8SDP0W7SW2",
};

if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "undefined") {
  throw new Error("Firebase apiKey is missing. Add NEXT_PUBLIC_FIREBASE_API_KEY to .env.local or use the fallback in src/lib/firebaseClient.ts.");
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const firebaseApp = app;
export const firebaseAuth = getAuth(app);
export const firebaseStorage = getStorage(app);
export const firebaseDb = getFirestore(app);

