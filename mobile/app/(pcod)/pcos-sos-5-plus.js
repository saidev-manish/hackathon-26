import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArrowLeft } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../styles/theme';

export default function PcosSosFivePlusScreen() {
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
        enforceRoute().catch((e) => console.error('Failed to enforce PCOS SOS 5+ route', e));
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
                    <Text style={styles.title}>Pulse Care SOS</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>1) Sugar Craving SOS</Text>
                    <Text style={styles.text}>Cravings happen. Let’s manage them in a healthy way.</Text>
                    <Text style={styles.item}>- Fruit bowl (apple, berries, papaya)</Text>
                    <Text style={styles.item}>- Dark chocolate (70%) small portion</Text>
                    <Text style={styles.item}>- Greek yogurt with nuts</Text>
                    <Text style={styles.item}>- Dates with almonds</Text>
                    <Text style={styles.item}>- Banana with peanut butter</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>2) Stress SOS</Text>
                    <Text style={styles.text}>Take a moment. Your health matters.</Text>
                    <Text style={styles.item}>- 4-4-6 breathing for 1 minute</Text>
                    <Text style={styles.item}>- Shoulder stretch</Text>
                    <Text style={styles.item}>- Short walk</Text>
                    <Text style={styles.item}>- Warm herbal tea</Text>
                    <Text style={styles.item}>- Write down what you feel</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>3) Severe Cramps SOS</Text>
                    <Text style={styles.item}>- Heating pad</Text>
                    <Text style={styles.item}>- Gentle stretching</Text>
                    <Text style={styles.item}>- Hydration</Text>
                    <Text style={styles.item}>- Rest</Text>
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
    text: { fontSize: 14, lineHeight: 22, color: theme.colors.body, marginBottom: 4 },
    item: { fontSize: 14, lineHeight: 22, color: theme.colors.body },
});
