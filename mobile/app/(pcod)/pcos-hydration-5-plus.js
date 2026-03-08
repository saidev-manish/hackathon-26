import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArrowLeft } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../styles/theme';

export default function PcosHydrationFivePlusScreen() {
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
        enforceRoute().catch((e) => console.error('Failed to enforce PCOS hydration 5+ route', e));
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
                    <Text style={styles.title}>Hydration Guidance (5+)</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Recommended Daily Water</Text>
                    <Text style={styles.primary}>3.5 - 4 liters per day</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Reminder Idea</Text>
                    <Text style={styles.text}>Set hydration notification every 2 hours to maintain consistency.</Text>
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
    primary: { fontSize: 20, fontWeight: '700', color: theme.colors.primary },
});
