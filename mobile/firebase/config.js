import { initializeApp, getApp, getApps } from "firebase/app";
import {
    initializeAuth,
    getReactNativePersistence,
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithCredential,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    updateProfile,
    deleteUser
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const firebaseConfig = {
    apiKey: "AIzaSyBdLJ57AVdiiWXN06pS_tqA6XCKKL7NMz8",
    authDomain: "pcod-and-pocs.firebaseapp.com",
    projectId: "pcod-and-pocs",
    storageBucket: "pcod-and-pocs.firebasestorage.app",
    messagingSenderId: "404417616704",
    appId: "1:404417616704:web:e7facccab9b22a71f5f8a5",
    measurementId: "G-0ER4V894V4"
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Robust Auth Initialization
let auth;
if (Platform.OS === 'web') {
    // Web initialization
    auth = getAuth(app);
} else {
    // Native initialization
    try {
        auth = initializeAuth(app, {
            persistence: getReactNativePersistence(AsyncStorage)
        });
    } catch (e) {
        auth = getAuth(app);
    }
}

const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Export a helper for web login that is less restrictive
export const signInWithGoogleWeb = () => {
    // Try to use popup if we are on web or have a window
    if (Platform.OS === 'web') {
        return signInWithPopup(auth, googleProvider);
    }
    // For native, it will likely throw but we let Firebase handle the error message
    return signInWithPopup(auth, googleProvider);
};

export {
    auth,
    db,
    googleProvider,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithCredential,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    updateProfile,
    deleteUser
};
