import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { ArrowLeft, Dumbbell, Droplets, Salad } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../styles/theme';

const mealPlan = [
    {
        day: 'Monday',
        breakfast: ['Besan chilla (gram flour pancake) with vegetables', '1 small bowl yogurt'],
        lunch: ['Quinoa or brown rice', 'Grilled paneer or tofu', 'Steamed broccoli and carrots', 'Cucumber salad'],
        dinner: ['2 whole wheat rotis', 'Mixed vegetable curry', 'Moong dal soup'],
    },
    {
        day: 'Tuesday',
        breakfast: ['Vegetable oats with flax seeds', '5 almonds'],
        lunch: ['Millet roti (jowar or bajra)', 'Chickpea curry (chole)', 'Spinach salad'],
        dinner: ['Vegetable soup', 'Stir-fried paneer with bell peppers'],
    },
    {
        day: 'Wednesday',
        breakfast: ['Greek yogurt with berries and chia seeds'],
        lunch: ['Brown rice', 'Rajma (kidney beans curry)', 'Mixed vegetable stir fry'],
        dinner: ['2 wheat rotis', 'Lentil curry (dal)', 'Tomato and cucumber salad'],
    },
    {
        day: 'Thursday',
        breakfast: ['Vegetable omelette (or tofu scramble)', '1 slice whole grain toast'],
        lunch: ['Quinoa salad with vegetables', 'Grilled chicken or soy chunks'],
        dinner: ['Vegetable khichdi (brown rice + lentils)', 'Small bowl yogurt'],
    },
    {
        day: 'Friday',
        breakfast: ['Smoothie (spinach + banana + milk + pumpkin seeds)'],
        lunch: ['Whole wheat roti', 'Paneer curry', 'Green salad with lemon dressing'],
        dinner: ['Lentil soup', 'Steamed vegetables'],
    },
    {
        day: 'Saturday',
        breakfast: ['Idli with sambar', 'Small amount coconut chutney'],
        lunch: ['Brown rice lemon rice', 'Vegetable curry', 'Carrot salad'],
        dinner: ['2 wheat rotis', 'Moong dal', 'Stir-fried vegetables'],
    },
    {
        day: 'Sunday',
        breakfast: ['Poha with peanuts and vegetables'],
        lunch: ['Quinoa bowl with grilled vegetables', 'Chickpeas or tofu'],
        dinner: ['Oats vegetable soup', 'Paneer or tofu salad'],
    },
];

export default function PcosDietFourFiveScreen() {
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
            console.error('Failed to enforce PCOS diet 4-5 route', error);
        });

        return () => {
            active = false;
        };
    }, [currentUser?.uid, router]);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.headerRow}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => router.replace('/pcos-duration-4-5')} activeOpacity={0.8}>
                        <ArrowLeft size={20} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.pageTitle}>Diet Plan (4-5)</Text>
                    <View style={styles.iconSpacer} />
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Diet Focus</Text>
                    <Text style={styles.bodyText}>Low glycemic foods to improve insulin sensitivity and support hormonal balance.</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Foods to Include</Text>
                    <Text style={styles.listItem}>- Quinoa, brown rice, whole wheat, millets</Text>
                    <Text style={styles.listItem}>- Lentils, chickpeas, rajma, moong dal</Text>
                    <Text style={styles.listItem}>- Paneer, tofu, yogurt, eggs (if preferred)</Text>
                    <Text style={styles.listItem}>- Spinach, broccoli, carrots, cucumber salad</Text>
                    <Text style={styles.listItem}>- Flax seeds, chia seeds, pumpkin seeds, almonds</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Foods to Reduce</Text>
                    <Text style={styles.listItem}>- White bread and refined carbs</Text>
                    <Text style={styles.listItem}>- Sugary desserts and sugary drinks</Text>
                    <Text style={styles.listItem}>- Deep fried and processed snacks</Text>
                </View>

                <Text style={styles.planTitle}>1-Week Meal Plan (4-5 Months Delay)</Text>

                {mealPlan.map((dayPlan) => (
                    <View key={dayPlan.day} style={styles.card}>
                        <Text style={styles.dayTitle}>{dayPlan.day}</Text>

                        <Text style={styles.mealLabel}>Breakfast</Text>
                        {dayPlan.breakfast.map((item) => (
                            <Text key={`${dayPlan.day}-breakfast-${item}`} style={styles.listItem}>- {item}</Text>
                        ))}

                        <Text style={styles.mealLabel}>Lunch</Text>
                        {dayPlan.lunch.map((item) => (
                            <Text key={`${dayPlan.day}-lunch-${item}`} style={styles.listItem}>- {item}</Text>
                        ))}

                        <Text style={styles.mealLabel}>Dinner</Text>
                        {dayPlan.dinner.map((item) => (
                            <Text key={`${dayPlan.day}-dinner-${item}`} style={styles.listItem}>- {item}</Text>
                        ))}
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
    planTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.heading,
        marginTop: 6,
    },
    dayTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: theme.colors.heading,
        marginBottom: 6,
    },
    mealLabel: {
        marginTop: 10,
        marginBottom: 4,
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.primary,
    },
    bodyText: {
        fontSize: 14,
        lineHeight: 22,
        color: theme.colors.body,
    },
    listItem: {
        fontSize: 14,
        color: theme.colors.body,
        lineHeight: 22,
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
