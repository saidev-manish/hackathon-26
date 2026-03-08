import React, { useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../styles/theme';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PCOSDurationTwoThreeScreen() {
    const router = useRouter();
    const { currentUser } = useAuth();

    useEffect(() => {
        let active = true;

        const enforcePcosRoute = async () => {
            if (!currentUser?.uid) return;
            const careTypeKey = `careType:${currentUser.uid}`;
            const careType = await AsyncStorage.getItem(careTypeKey);
            if (!active) return;

            if (careType !== 'pcos') {
                await AsyncStorage.setItem(careTypeKey, 'pcos');
            }
        };

        enforcePcosRoute().catch((error) => {
            console.error('Failed to enforce PCOS duration 2-3 route', error);
        });

        return () => {
            active = false;
        };
    }, [currentUser?.uid, router]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>You’re taking the first step toward better health.</Text>
                <Text style={styles.subtitle}>For 2-3 months delay, continue to home for daily support and tracking.</Text>

                <TouchableOpacity style={styles.continueBtn} onPress={() => router.replace('/pcos-empty')} activeOpacity={0.9}>
                    <Text style={styles.continueText}>Continue to Home</Text>
                </TouchableOpacity>
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
        paddingHorizontal: 24,
        gap: 14,
    },
    title: {
        fontSize: 26,
        fontWeight: '700',
        textAlign: 'center',
        color: theme.colors.heading,
        lineHeight: 34,
    },
    subtitle: {
        fontSize: 14,
        color: theme.colors.body,
        textAlign: 'center',
        lineHeight: 22,
    },
    continueBtn: {
        marginTop: 8,
        width: '100%',
        minHeight: 52,
        borderRadius: 14,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    continueText: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.surface,
    },
});
