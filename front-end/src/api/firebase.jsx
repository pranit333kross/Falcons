import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA40Irs4WlY67hfMEX-Qsc92xTUCDpNF6g",
  authDomain: "ed-tech-app-d4d5d.firebaseapp.com",
  projectId: "ed-tech-app-d4d5d",
  storageBucket: "ed-tech-app-d4d5d.firebasestorage.app",
  messagingSenderId: "1065131513312",
  appId: "1:1065131513312:web:54f57665182606841dc785",
  measurementId: "G-LWLPCDDS2Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services and EXPORT them
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Also EXPORT the appId so other files can use it
export const appId = firebaseConfig.appId;