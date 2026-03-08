import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArrowLeft } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../styles/theme';

export default function PcosDietFivePlusScreen() {
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
        enforceRoute().catch((e) => console.error('Failed to enforce PCOS diet 5+ route', e));
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
                    <Text style={styles.title}>Hormone Support Diet (5+)</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Supportive Lifestyle Guidance</Text>
                    <Text style={styles.text}>Focus on foods that reduce insulin resistance and inflammation.</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Suggested Foods</Text>
                    <Text style={styles.item}>- Leafy greens (spinach, kale)</Text>
                    <Text style={styles.item}>- High fiber foods</Text>
                    <Text style={styles.item}>- Lentils and chickpeas</Text>
                    <Text style={styles.item}>- Nuts and seeds</Text>
                    <Text style={styles.item}>- Omega-3 foods (walnuts, chia seeds)</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Foods to Reduce</Text>
                    <Text style={styles.item}>- Refined sugar</Text>
                    <Text style={styles.item}>- Junk food</Text>
                    <Text style={styles.item}>- Processed snacks</Text>
                    <Text style={styles.item}>- Sugary drinks</Text>
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
