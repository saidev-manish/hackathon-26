import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBdLJ57AVdiiWXN06pS_tqA6XCKKL7NMz8",
  authDomain: "pcod-and-pocs.firebaseapp.com",
  projectId: "pcod-and-pocs",
  storageBucket: "pcod-and-pocs.firebasestorage.app",
  messagingSenderId: "404417616704",
  appId: "1:404417616704:web:e7facccab9b22a71f5f8a5",
  measurementId: "G-0ER4V894V4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
// Initialize Firebase Cloud Messaging
// Initialize Firebase Cloud Messaging
export const messaging = getMessaging(app);

export default app;
