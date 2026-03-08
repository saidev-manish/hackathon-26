import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { ArrowLeft, Dumbbell, Droplets, Salad } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../styles/theme';

const workouts = [
    {
        title: 'Brisk Walk',
        detail: '30 minutes, 5 days per week',
    },
    {
        title: 'Strength Training',
        detail: '20-30 minutes, 3 days per week',
    },
    {
        title: 'Core + Stretch',
        detail: '15 minutes daily for stress and insulin support',
    },
    {
        title: 'Post-meal Walk',
        detail: '10-15 minutes after lunch or dinner',
    },
];

export default function PcosExerciseFourFiveScreen() {
    const router = useRouter();
    const { currentUser } = useAuth();

    useEffect(() => {
        let active = true;

        const enforcePcosRoute = async () => {
            if (!currentUser?.uid) return;
            const careType = await AsyncStorage.getItem(`careType:${currentUser.uid}`);
            if (!active) return;

            if (careType === 'period') {
                router.replace('/period-dashboard');
                return;
            }

            if (careType !== 'pcos') {
                router.replace('/care-type');
            }
        };

        enforcePcosRoute().catch((error) => {
            console.error('Failed to enforce PCOS exercise 4-5 route', error);
        });

        return () => {
            active = false;
        };
    }, [currentUser?.uid, router]);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.headerRow}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => router.back()} activeOpacity={0.8}>
                        <ArrowLeft size={20} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.pageTitle}>Exercise Plan (4-5)</Text>
                    <View style={styles.iconSpacer} />
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Focus</Text>
                    <Text style={styles.bodyText}>Improve insulin sensitivity and hormonal balance with moderate daily movement.</Text>
                </View>

                {workouts.map((item) => (
                    <View key={item.title} style={styles.card}>
                        <Text style={styles.workoutTitle}>{item.title}</Text>
                        <Text style={styles.bodyText}>{item.detail}</Text>
                    </View>
                ))}

                <View style={styles.bottomSpace} />
            </ScrollView>

            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/pcos-hydration-4-5')} activeOpacity={0.8}>
                    <Droplets size={20} color={theme.colors.primary} />
                    <Text style={styles.navLabel}>Water Intake</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/pcos-exercise-4-5')} activeOpacity={0.8}>
                    <Dumbbell size={20} color={theme.colors.primary} />
                    <Text style={styles.navLabel}>Exercise</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/pcos-diet-4-5')} activeOpacity={0.8}>
                    <Salad size={20} color={theme.colors.primary} />
                    <Text style={styles.navLabel}>Diet</Text>
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
        paddingHorizontal: 20,
        paddingTop: 18,
        paddingBottom: 28,
        gap: 12,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    iconButton: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconSpacer: {
        width: 34,
        height: 34,
    },
    pageTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: theme.colors.heading,
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        borderRadius: 16,
        padding: 14,
        ...theme.shadows.soft,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: theme.colors.heading,
        marginBottom: 6,
    },
    workoutTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.heading,
        marginBottom: 4,
    },
    bodyText: {
        fontSize: 14,
        lineHeight: 22,
        color: theme.colors.body,
    },
    bottomSpace: {
        height: 98,
    },
    bottomNav: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 78,
        backgroundColor: theme.colors.surface,
        borderTopWidth: 1,
        borderTopColor: theme.colors.inputBorder,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingBottom: 8,
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    navLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.colors.primary,
    },
});
