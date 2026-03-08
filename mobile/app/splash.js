import  { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { theme } from '../styles/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function SplashScreen() {
    const { currentUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const [isNavigating, setIsNavigating] = useState(false);

    const withTimeout = (promise, timeoutMs = 1500) => {
        return Promise.race([
            promise,
            new Promise((resolve) => setTimeout(() => resolve(null), timeoutMs)),
        ]);
    };

    useEffect(() => {
        let isMounted = true;
        let navigationTimeout;

        const determineInitialRoute = async () => {
            try {
                if (!currentUser?.uid) {
                    setIsNavigating(true);
                    navigationTimeout = setTimeout(() => {
                        if (isMounted) router.replace('/login');
                    }, 300);
                    return;
                }

                const profileCacheKey = `profileCompleted:${currentUser.uid}`;
                const cachedCompleted = await AsyncStorage.getItem(profileCacheKey);

                if (!isMounted) return;

                if (cachedCompleted === 'true') {
                    setIsNavigating(true);
                    navigationTimeout = setTimeout(() => {
                        if (isMounted) router.replace('/care-type');
                    }, 300);
                    return;
                }

                try {
                    const userDoc = await withTimeout(getDoc(doc(db, 'users', currentUser.uid)), 1500);
                    if (isMounted) {
                        if (userDoc && userDoc.exists()) {
                            const userData = userDoc.data();
                            const isCompleted = userData.profileCompleted === true || Boolean(
                                userData.fullName && userData.age && userData.phone && userData.weight && userData.height
                            );
                            if (isCompleted) {
                                await AsyncStorage.setItem(profileCacheKey, 'true');
                                setIsNavigating(true);
                                navigationTimeout = setTimeout(() => {
                                    if (isMounted) router.replace('/care-type');
                                }, 300);
                                return;
                            }
                        }
                        setIsNavigating(true);
                        navigationTimeout = setTimeout(() => {
                            if (isMounted) router.replace('/welcome');
                        }, 300);
                    }
                } catch (error) {
                    console.warn('Error checking profile in splash:', error);
                    if (isMounted) {
                        setIsNavigating(true);
                        navigationTimeout = setTimeout(() => {
                            if (isMounted) router.replace('/welcome');
                        }, 300);
                    }
                }
            } catch (error) {
                console.error('Error in splash navigation:', error);
                if (isMounted) {
                    setIsNavigating(true);
                    navigationTimeout = setTimeout(() => {
                        if (isMounted) router.replace('/login');
                    }, 300);
                }
            }
        };

        if (!authLoading) {
            determineInitialRoute();
        }

        return () => {
            isMounted = false;
            if (navigationTimeout) clearTimeout(navigationTimeout);
        };
    }, [currentUser, authLoading, router]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.logo}></Text>
                <Text style={styles.appName}>PulseCare</Text>
                <ActivityIndicator
                    size="large"
                    color={theme.colors.primary}
                    style={styles.spinner}
                />
                <Text style={styles.loadingText}>Loading your wellness journey...</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
    },
    logo: {
        fontSize: 64,
        marginBottom: 12,
    },
    appName: {
        fontSize: 28,
        fontWeight: '700',
        color: theme.colors.heading,
    },
    spinner: {
        marginTop: 24,
    },
    loadingText: {
        fontSize: 14,
        color: theme.colors.muted,
        marginTop: 12,
    },
});
