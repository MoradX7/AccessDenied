import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

// Read Firebase config exclusively from NEXT_PUBLIC_FIREBASE_* env vars
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const isMissingConfig = !firebaseConfig.apiKey || firebaseConfig.apiKey === "undefined";

if (isMissingConfig) {
  console.warn("WARNING: Firebase configuration is missing. Falling back to dummy config for build. Add NEXT_PUBLIC_FIREBASE_ vars to Vercel.");
}

const finalConfig = isMissingConfig ? {
  apiKey: "dummy-api-key",
  authDomain: "dummy.firebaseapp.com",
  projectId: "dummy-project",
  storageBucket: "dummy.appspot.com",
  messagingSenderId: "12345",
  appId: "1:12345:web:abcd",
} : firebaseConfig;

const app = getApps().length ? getApp() : initializeApp(finalConfig);

export const firebaseApp = app;
export const firebaseAuth = getAuth(app);
export const firebaseStorage = getStorage(app);
export const firebaseDb = getFirestore(app);
