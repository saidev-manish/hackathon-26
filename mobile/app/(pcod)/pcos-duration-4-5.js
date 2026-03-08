import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, ScrollView, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../styles/theme';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Bluetooth, Droplets, Dumbbell, Salad } from 'lucide-react-native';

const mealPlan = [
    {
        day: 'Monday',
        breakfast: ['Besan chilla with vegetables', '1 small bowl yogurt'],
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

const SOS_GUIDES = {
    sugar: {
        title: 'Sugar Craving SOS',
        intro: 'Cravings happen. Let\'s manage them in a healthy way.',
        purpose: 'Provide immediate guidance so cravings do not turn into harmful choices.',
        points: [
            'Healthy alternatives:',
            'Small bowl of fruit (apple, berries, papaya)',
            'Dark chocolate (70%) in a small portion',
            'Greek yogurt with nuts',
            'Dates with almonds',
            'Banana with peanut butter',
            'Quick distraction techniques:',
            'Drink a glass of water',
            'Take 5 deep breaths',
            'Go for a 5 minute walk',
            'Eat a handful of nuts and wait 10 minutes',
        ],
    },
    stress: {
        title: 'Stress SOS',
        intro: 'Take a moment. Your health matters.',
        purpose: 'Reduce stress spikes that can influence hormonal balance.',
        points: [
            '1 minute breathing guide:',
            'Inhale for 4 seconds',
            'Hold for 4 seconds',
            'Exhale for 6 seconds',
            'Repeat for 1 minute',
            'Quick relaxation suggestions:',
            'Listen to calming music',
            'Stretch your shoulders',
            'Take a short walk',
            'Drink warm herbal tea',
            'Write down what you feel',
            'Support message: Stress can influence hormonal balance. Small moments of relaxation can help your body restore balance.',
        ],
    },
    cramps: {
        title: 'Severe Cramps SOS',
        intro: 'You are not alone. Let\'s ease the pain safely.',
        purpose: 'Give quick relief actions for intense cramps.',
        points: [
            'Use a heating pad on lower abdomen',
            'Do gentle stretching for 5 to 10 minutes',
            'Hydrate with warm water',
            'Take rest and avoid intense activity',
        ],
    },
};

export default function PCOSDurationFourFiveScreen() {
    const router = useRouter();
    const { currentUser } = useAuth();
    const [showGoalIntro, setShowGoalIntro] = useState(true);
    const [sosVisible, setSosVisible] = useState(false);
    const [selectedSos, setSelectedSos] = useState(null);

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
            console.error('Failed to enforce PCOS duration 4-5 route', error);
        });

        return () => {
            active = false;
        };
    }, [currentUser?.uid, router]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowGoalIntro(false);
        }, 2500);

        return () => {
            clearTimeout(timer);
        };
    }, []);

    if (showGoalIntro) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.goalIntroWrap}>
                    <Text style={styles.goalIntroLabel}>Goal</Text>
                    <Text style={styles.goalIntroText}>Improve insulin resistance and reduce hormonal imbalance.</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.headerRow}>
                    <Text style={styles.pageTitle}>4-5 Months Delay Plan</Text>
                    <TouchableOpacity
                        style={styles.wearableButton}
                        onPress={() => router.push('/pcos-wearable-devices')}
                        activeOpacity={0.85}
                    >
                        <Bluetooth size={18} color={theme.colors.primary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Goal</Text>
                    <Text style={styles.bodyText}>Improve insulin resistance and reduce hormonal imbalance.</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Diet Suggestions</Text>
                    <Text style={styles.bodyText}>Focus on low glycemic index foods.</Text>

                    <Text style={styles.subTitle}>Foods to include</Text>
                    <Text style={styles.listItem}>- Quinoa</Text>
                    <Text style={styles.listItem}>- Whole wheat</Text>
                    <Text style={styles.listItem}>- Lentils</Text>
                    <Text style={styles.listItem}>- Greek yogurt</Text>
                    <Text style={styles.listItem}>- Pumpkin seeds</Text>
                    <Text style={styles.listItem}>- Flax seeds</Text>

                    <Text style={styles.subTitle}>Add anti-inflammatory foods</Text>
                    <Text style={styles.listItem}>- Turmeric</Text>
                    <Text style={styles.listItem}>- Ginger</Text>
                    <Text style={styles.listItem}>- Garlic</Text>

                    <Text style={styles.subTitle}>Avoid</Text>
                    <Text style={styles.listItem}>- White bread</Text>
                    <Text style={styles.listItem}>- Sugary desserts</Text>
                    <Text style={styles.listItem}>- Deep fried foods</Text>
                    <Text style={styles.listItem}>- Soft drinks</Text>
                </View>

                <Text style={styles.planTitle}>1-Week Meal Plan (4-5 Months Period Delay)</Text>

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

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Exercise Plan</Text>
                    <Text style={styles.bodyText}>Goal: Improve insulin sensitivity</Text>
                    <Text style={styles.subTitle}>Recommended</Text>
                    <Text style={styles.listItem}>- 40 minutes physical activity daily</Text>
                    <Text style={styles.listItem}>- Cardio workouts</Text>
                    <Text style={styles.listItem}>- Light strength training</Text>

                    <Text style={styles.subTitle}>Exercises</Text>
                    <Text style={styles.listItem}>- Jogging</Text>
                    <Text style={styles.listItem}>- Cycling</Text>
                    <Text style={styles.listItem}>- Squats</Text>
                    <Text style={styles.listItem}>- Yoga for hormone balance</Text>

                    <Text style={styles.subTitle}>Yoga poses</Text>
                    <Text style={styles.listItem}>- Cobra pose</Text>
                    <Text style={styles.listItem}>- Bridge pose</Text>
                    <Text style={styles.listItem}>- Child's pose</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Water Intake</Text>
                    <Text style={styles.bodyText}>3 - 3.5 liters per day</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Mood Management</Text>
                    <Text style={styles.bodyText}>Possible moods:</Text>
                    <Text style={styles.listItem}>- Irritable</Text>
                    <Text style={styles.listItem}>- Anxious</Text>
                    <Text style={styles.listItem}>- Stressed</Text>
                    <Text style={styles.listItem}>- Emotional</Text>
                </View>

                <TouchableOpacity
                    style={styles.sosCard}
                    activeOpacity={0.9}
                    onPress={() => {
                        setSelectedSos(null);
                        setSosVisible(true);
                    }}
                >
                    <Text style={styles.sosTitle}>SOS Assistant</Text>
                    <Text style={styles.sosSubtitle}>Immediate guidance for sugar cravings, stress, and severe cramps.</Text>
                </TouchableOpacity>

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

            <Modal
                visible={sosVisible}
                transparent
                animationType="fade"
                onRequestClose={() => {
                    setSosVisible(false);
                    setSelectedSos(null);
                }}
            >
                <Pressable
                    style={styles.sosOverlay}
                    onPress={() => {
                        setSosVisible(false);
                        setSelectedSos(null);
                    }}
                >
                    <Pressable style={styles.sosModalCard} onPress={() => null}>
                        <Text style={styles.sosModalTitle}>SOS Support</Text>

                        {!selectedSos ? (
                            <View style={styles.sosOptionWrap}>
                                <TouchableOpacity style={styles.sosOption} onPress={() => setSelectedSos('sugar')}>
                                    <Text style={styles.sosOptionTitle}>1) Sugar Craving SOS</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.sosOption} onPress={() => setSelectedSos('stress')}>
                                    <Text style={styles.sosOptionTitle}>2) Stress SOS</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.sosOption} onPress={() => setSelectedSos('cramps')}>
                                    <Text style={styles.sosOptionTitle}>3) Severe Cramps SOS</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <ScrollView style={styles.sosGuideWrap} contentContainerStyle={styles.sosGuideContent}>
                                <Text style={styles.sosGuideTitle}>{SOS_GUIDES[selectedSos].title}</Text>
                                <Text style={styles.sosGuideIntro}>{SOS_GUIDES[selectedSos].intro}</Text>
                                <Text style={styles.sosGuidePurpose}>Purpose: {SOS_GUIDES[selectedSos].purpose}</Text>
                                {SOS_GUIDES[selectedSos].points.map((point) => (
                                    <Text key={point} style={styles.sosGuidePoint}>- {point}</Text>
                                ))}
                                <TouchableOpacity style={styles.sosBackBtn} onPress={() => setSelectedSos(null)}>
                                    <Text style={styles.sosBackText}>Back to options</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        )}

                        <TouchableOpacity
                            style={styles.sosCloseBtn}
                            onPress={() => {
                                setSosVisible(false);
                                setSelectedSos(null);
                            }}
                        >
                            <Text style={styles.sosCloseText}>Close</Text>
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>
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
        paddingTop: 20,
        paddingBottom: 28,
        gap: 12,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.heading,
    },
    wearableButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        backgroundColor: theme.colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        ...theme.shadows.soft,
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
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.heading,
        marginBottom: 6,
    },
    subTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.heading,
        marginTop: 10,
        marginBottom: 4,
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
    goalIntroWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        backgroundColor: theme.colors.background,
    },
    goalIntroLabel: {
        fontSize: 22,
        fontWeight: '700',
        color: theme.colors.primary,
        marginBottom: 12,
    },
    goalIntroText: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.heading,
        textAlign: 'center',
        lineHeight: 34,
    },
    sosCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        paddingHorizontal: 14,
        paddingVertical: 12,
        ...theme.shadows.soft,
    },
    sosTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: theme.colors.heading,
    },
    sosSubtitle: {
        marginTop: 4,
        fontSize: 13,
        color: theme.colors.body,
    },
    sosOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    sosModalCard: {
        width: '100%',
        maxWidth: 420,
        maxHeight: '78%',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        backgroundColor: theme.colors.surface,
        padding: 16,
        ...theme.shadows.soft,
    },
    sosModalTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: theme.colors.heading,
        marginBottom: 12,
    },
    sosOptionWrap: {
        gap: 10,
    },
    sosOption: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        backgroundColor: theme.colors.card,
        paddingVertical: 12,
        paddingHorizontal: 12,
    },
    sosOptionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.heading,
    },
    sosGuideWrap: {
        maxHeight: 340,
    },
    sosGuideContent: {
        gap: 8,
        paddingBottom: 8,
    },
    sosGuideTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: theme.colors.heading,
        marginBottom: 2,
    },
    sosGuideIntro: {
        fontSize: 13,
        lineHeight: 20,
        color: theme.colors.heading,
        fontWeight: '700',
    },
    sosGuidePurpose: {
        fontSize: 13,
        lineHeight: 20,
        color: theme.colors.body,
    },
    sosGuidePoint: {
        fontSize: 13,
        lineHeight: 20,
        color: theme.colors.body,
    },
    sosBackBtn: {
        marginTop: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sosBackText: {
        color: theme.colors.primary,
        fontSize: 13,
        fontWeight: '700',
    },
    sosCloseBtn: {
        marginTop: 12,
        borderRadius: 10,
        backgroundColor: theme.colors.primary,
        paddingVertical: 11,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sosCloseText: {
        color: theme.colors.surface,
        fontSize: 14,
        fontWeight: '700',
    },
});
