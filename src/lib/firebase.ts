import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBNttUs2fdhivQqtODC-_Dgq6_M3LmJJD8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "quincy-8267a.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "quincy-8267a",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "quincy-8267a.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "830374300842",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:830374300842:web:eadec7fe04f946233454d3",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-RYJEB325R3",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

void isSupported().then((ok) => {
  if (ok) getAnalytics(app);
});
