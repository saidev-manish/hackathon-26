import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArrowLeft } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../styles/theme';

export default function PcosExerciseFivePlusScreen() {
    const router = useRouter();
    const { currentUser } = useAuth();

    useEffect(() => {
        let active = true;
        const enforceRoute = async () => {
            if (!currentUser?.uid) return;
            const careType = await AsyncStorage.getItem(`careType:${currentUser.uid}`);
            if (!active) return;
            if (careType === 'period') {
                router.replace('/period-dashboard');
                return;
            }
            if (careType !== 'pcos') router.replace('/care-type');
        };
        enforceRoute().catch((e) => console.error('Failed to enforce PCOS exercise 5+ route', e));
        return () => {
            active = false;
        };
    }, [currentUser?.uid, router]);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.headerRow}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => router.replace('/pcos-duration-5-plus')}>
                        <ArrowLeft size={20} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Gentle Exercise (5+)</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Recommended</Text>
                    <Text style={styles.item}>- Avoid very intense workouts</Text>
                    <Text style={styles.item}>- 30-40 minutes walking</Text>
                    <Text style={styles.item}>- Light yoga</Text>
                    <Text style={styles.item}>- Stretching exercises</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Helpful Yoga Poses</Text>
                    <Text style={styles.item}>- Butterfly pose</Text>
                    <Text style={styles.item}>- Cobra pose</Text>
                    <Text style={styles.item}>- Child's pose</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Goal</Text>
                    <Text style={styles.text}>Reduce stress and improve metabolism.</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    content: { padding: 20, gap: 12 },
    headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    iconButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 22, fontWeight: '700', color: theme.colors.heading, flex: 1 },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        padding: 14,
        ...theme.shadows.soft,
    },
    sectionTitle: { fontSize: 17, fontWeight: '700', color: theme.colors.heading, marginBottom: 6 },
    text: { fontSize: 14, lineHeight: 22, color: theme.colors.body },
    item: { fontSize: 14, lineHeight: 22, color: theme.colors.body },
});
