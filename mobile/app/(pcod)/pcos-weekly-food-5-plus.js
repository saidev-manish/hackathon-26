import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArrowLeft } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../styles/theme';

export default function PcosWeeklyFoodFivePlusScreen() {
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
        enforceRoute().catch((e) => console.error('Failed to enforce PCOS weekly food 5+ route', e));
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
                    <Text style={styles.title}>Weekly Food Insights</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Manual Weekly Food Column</Text>
                    <Text style={styles.text}>Users can enter everything eaten during the week. The app then generates nutrient percentages and health predictions.</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Sample Weekly Trend</Text>
                    <Text style={styles.item}>- Carbohydrates: High (mostly from rice)</Text>
                    <Text style={styles.item}>- Protein: Moderate</Text>
                    <Text style={styles.item}>- Fat: Moderate</Text>
                    <Text style={styles.item}>- Fiber: Moderate to Low</Text>
                    <Text style={styles.item}>- Sugar: Low to Moderate</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Possible Insights</Text>
                    <Text style={styles.item}>- High carbohydrate intake detected</Text>
                    <Text style={styles.item}>- Protein intake slightly lower than recommended</Text>
                    <Text style={styles.item}>- Fiber intake can be improved with vegetables and fruits</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Possible Prediction</Text>
                    <Text style={styles.item}>- Slight weight gain risk if activity level is low</Text>
                    <Text style={styles.item}>- Blood sugar fluctuations possible</Text>
                    <Text style={styles.item}>- Mood symptoms or period delay risk can remain if pattern continues</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Suggested Improvements</Text>
                    <Text style={styles.item}>- Add more protein (eggs, lentils, paneer)</Text>
                    <Text style={styles.item}>- Increase leafy vegetables</Text>
                    <Text style={styles.item}>- Reduce rice portion size slightly</Text>
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
