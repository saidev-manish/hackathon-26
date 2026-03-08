import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../styles/theme';
import PeriodBottomNav from '../../components/PeriodBottomNav';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PeriodWellnessScreen() {
    const { currentUser } = useAuth();
    const router = useRouter();

    useEffect(() => {
        let active = true;

        const enforcePeriodRoute = async () => {
            if (!currentUser?.uid) return;
            const careType = await AsyncStorage.getItem(`careType:${currentUser.uid}`);
            if (!active) return;

            if (careType === 'pcos') {
                router.replace('/pcos-exercise');
                return;
            }

            if (careType !== 'period') {
                router.replace('/care-type');
            }
        };

        enforcePeriodRoute().catch((error) => {
            console.error('Failed to enforce period wellness route', error);
        });

        return () => {
            active = false;
        };
    }, [currentUser?.uid, router]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.screenBody}>
                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={styles.title}>Period Wellness</Text>
                    <Text style={styles.subtitle}>Wellness guidance designed for period care</Text>

                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Daily Tips</Text>
                        <Text style={styles.cardText}> Stay hydrated and rest well during your cycle.</Text>
                        <Text style={styles.cardText}> Prefer iron-rich foods and warm meals.</Text>
                        <Text style={styles.cardText}> Gentle stretches can help with cramps.</Text>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Self-care</Text>
                        <Text style={styles.cardText}> Track mood, symptoms, and flow each day.</Text>
                        <Text style={styles.cardText}> Use breathing exercises for pain and stress relief.</Text>
                    </View>
                </ScrollView>
                <PeriodBottomNav active="wellness" />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    screenBody: {
        flex: 1,
    },
    content: {
        padding: 20,
        gap: 16,
        paddingBottom: 110,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: theme.colors.heading,
    },
    subtitle: {
        marginTop: 2,
        fontSize: 14,
        color: theme.colors.body,
    },
    card: {
        borderRadius: 18,
        padding: 16,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        ...theme.shadows.soft,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.heading,
        marginBottom: 8,
    },
    cardText: {
        fontSize: 13,
        color: theme.colors.body,
        lineHeight: 20,
        marginBottom: 4,
    },
});