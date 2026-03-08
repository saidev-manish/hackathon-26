import { createContext, useContext, useEffect, useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    auth,
    db,
    GoogleAuthProvider,
    signInWithCredential,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    signInWithGoogleWeb
} from "../firebase/config";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";

WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext();
const SAVED_ACCOUNTS_KEY = "savedAccounts";
const GUEST_SESSION_KEY = "guestSessionActive";
const GUEST_USER = {
    uid: "guest-user",
    email: "",
    displayName: "Guest",
    photoURL: "",
    isAnonymous: true,
};

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [isGuest, setIsGuest] = useState(false);
    const [loading, setLoading] = useState(true);
    const [savedAccounts, setSavedAccounts] = useState([]);

    const loadSavedAccounts = async () => {
        try {
            const raw = await AsyncStorage.getItem(SAVED_ACCOUNTS_KEY);
            if (!raw) {
                setSavedAccounts([]);
                return;
            }
            const parsed = JSON.parse(raw);
            setSavedAccounts(Array.isArray(parsed) ? parsed : []);
        } catch (error) {
            console.error("Failed to load saved accounts", error);
            setSavedAccounts([]);
        }
    };

    const persistSavedAccounts = async (accounts) => {
        setSavedAccounts(accounts);
        await AsyncStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(accounts));
    };

    const upsertSavedAccount = async (user) => {
        if (!user?.uid) return;

        const account = {
            uid: user.uid,
            email: user.email || "",
            displayName: user.displayName || user.email?.split("@")[0] || "User",
            photoURL: user.photoURL || "",
            providerId: user.providerData?.[0]?.providerId || "password",
            lastLoginAt: new Date().toISOString(),
        };

        const next = [account, ...savedAccounts.filter((entry) => entry.uid !== user.uid)];
        await persistSavedAccounts(next);
    };

    const removeSavedAccount = async (uid) => {
        const next = savedAccounts.filter((entry) => entry.uid !== uid);
        await persistSavedAccounts(next);
    };

    const beginSwitchAccount = async (uid) => {
        await AsyncStorage.setItem("accountSwitchTarget", uid);
    };

    useEffect(() => {
        loadSavedAccounts();
    }, []);

    const [, response, promptAsync] = Google.useAuthRequest({
        androidClientId: "404417616704-37qvn9j3imcfp150iqofm86j41bauhm4.apps.googleusercontent.com",
        webClientId: "404417616704-37qvn9j3imcfp150iqofm86j41bauhm4.apps.googleusercontent.com",
    }, {
        useProxy: true,
        projectNameForProxy: 'pulsecare-mobile'
    });

    useEffect(() => {
        if (response?.type === 'success') {
            const { id_token } = response.params;
            const credential = GoogleAuthProvider.credential(id_token);
            signInWithCredential(auth, credential).catch((error) => {
                if (error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request') {
                    return;
                }
                console.error('Google credential sign-in failed:', error);
            });
        }
    }, [response]);

    async function signup(email, password, userData) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Store additional user details in Firestore
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            ...userData,
            createdAt: serverTimestamp()
        });

        return user;
    }

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    async function continueAsGuest() {
        await AsyncStorage.setItem(GUEST_SESSION_KEY, "true");
        setIsGuest(true);
        setCurrentUser(GUEST_USER);
        setLoading(false);
        return GUEST_USER;
    }

    async function loginWithGoogle() {
        try {
            if (Platform.OS === 'web') {
                return await signInWithGoogleWeb();
            }
            return await promptAsync();
        } catch (error) {
            if (error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request') {
                return { cancelled: true };
            }
            throw error;
        }
    }

    async function logout() {
        if (isGuest) {
            await AsyncStorage.removeItem(GUEST_SESSION_KEY);
            setIsGuest(false);
            setCurrentUser(null);
            return;
        }

        await signOut(auth);
    }

    function resetPassword(email) {
        return sendPasswordResetEmail(auth, email);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUser(user);
                setIsGuest(false);
                AsyncStorage.removeItem(GUEST_SESSION_KEY).catch(() => {});
                upsertSavedAccount(user);
                setLoading(false);
                return;
            }

            AsyncStorage.getItem(GUEST_SESSION_KEY)
                .then((guestSessionValue) => {
                    if (guestSessionValue === "true") {
                        setCurrentUser(GUEST_USER);
                        setIsGuest(true);
                    } else {
                        setCurrentUser(null);
                        setIsGuest(false);
                    }
                })
                .catch(() => {
                    setCurrentUser(null);
                    setIsGuest(false);
                })
                .finally(() => {
                    setLoading(false);
                });
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        const fallbackTimer = setTimeout(() => {
            setLoading(false);
        }, 4000);

        return () => clearTimeout(fallbackTimer);
    }, []);

    const value = {
        currentUser,
        isGuest,
        loading,
        savedAccounts,
        signup,
        login,
        loginWithGoogle,
        continueAsGuest,
        logout,
        resetPassword,
        removeSavedAccount,
        beginSwitchAccount,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
