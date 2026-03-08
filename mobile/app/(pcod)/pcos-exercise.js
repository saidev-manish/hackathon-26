import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Wind,
    Play,
    Pause,
    RotateCcw,
    Flower2,
    Dumbbell,
    Sparkles,
    ChevronRight,
    X,
    ChevronDown,
    ChevronUp,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { theme } from '../../styles/theme';
import PcosBottomNav from '../../components/PcosBottomNav';
import { Exercise3DView } from '../../components/Exercise3DView';
import {
    EXERCISE_CATEGORIES,
    getExercisesByCategory,
    getProgramById,
} from '../../constants/pcos-exercises';
import { PCOS_DIET_PLAN } from '../../constants/pcos-diet';

const breathingExercises = [
    { name: 'Box Breathing', duration: '4 min', pattern: '4-4-4-4', desc: 'Calms anxiety & stress' },
    { name: '4-7-8 Breathing', duration: '5 min', pattern: '4-7-8', desc: 'Helps with sleep' },
    { name: 'Deep Belly', duration: '3 min', pattern: '5-5', desc: 'Reduces cortisol' },
];

const categoryCards = [
    {
        key: EXERCISE_CATEGORIES.YOGA,
        title: 'Yoga (Hormone + Stress)',
        subtitle: 'Reduces cortisol • supports endocrine balance',
        color: '#FDE2F3',
    },
    {
        key: EXERCISE_CATEGORIES.STRENGTH,
        title: 'Strength (Most Important)',
        subtitle: 'Improves insulin sensitivity • builds lean muscle',
        color: '#DCFCE7',
    },
    {
        key: EXERCISE_CATEGORIES.CARDIO,
        title: 'Low-Impact Cardio',
        subtitle: 'Moderate intensity • avoid cortisol spikes',
        color: '#FEF3C7',
    },
    {
        key: EXERCISE_CATEGORIES.CORE,
        title: 'Core + Pelvic Activation',
        subtitle: 'Supports pelvic circulation and hormonal regulation',
        color: '#E0F2FE',
    },
];

const PoseEmoji = ({ exercise, stepIndex }) => {
    const getPoseEmoji = () => {
        if (exercise?.category === EXERCISE_CATEGORIES.YOGA) {
            const poses = ['🧘‍♀️', '🧘', '🪷', '🧘‍♀️', '✨'];
            return poses[stepIndex] || '🧘‍♀️';
        } else if (exercise?.category === EXERCISE_CATEGORIES.STRENGTH) {
            const poses = ['💪', '🏋️‍♀️', '🦵', '🔥', '✅'];
            return poses[stepIndex] || '💪';
        } else if (exercise?.category === EXERCISE_CATEGORIES.CARDIO) {
            const poses = ['🚶‍♀️', '🚴‍♀️', '🏊‍♀️', '💓', '✅'];
            return poses[stepIndex] || '🚶‍♀️';
        } else if (exercise?.category === EXERCISE_CATEGORIES.CORE) {
            const poses = ['🧘', '🦴', '⚖️', '🧠', '✅'];
            return poses[stepIndex] || '🤸‍♀️';
        }
        return '🧘‍♀️';
    };

    return (
        <View style={styles.poseContainer}>
            <Text style={styles.poseEmoji}>{getPoseEmoji()}</Text>
        </View>
    );
};

export default function PcosExerciseScreen() {
    const { t } = useLanguage();
    const { currentUser } = useAuth();
    const router = useRouter();

    const [isBreathing, setIsBreathing] = useState(false);
    const [phaseIndex, setPhaseIndex] = useState(0);
    const [selectedWorkout, setSelectedWorkout] = useState(null);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [showExerciseModal, setShowExerciseModal] = useState(false);

    const phases = useMemo(() => ['inhale', 'hold', 'exhale'], []);
    const resetProgram = useMemo(() => getProgramById(1), []);
    const categorySections = useMemo(
        () =>
            categoryCards.map((categoryCard) => ({
                ...categoryCard,
                exercises: getExercisesByCategory(categoryCard.key),
            })),
        []
    );
    const breathPhase = phases[phaseIndex];

    // PCOS-only route guard
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
            console.error('Failed to enforce PCOS exercise route', error);
        });

        return () => {
            active = false;
        };
    }, [currentUser?.uid, router]);

    const toggleBreathing = () => {
        setIsBreathing((prev) => !prev);
        if (!isBreathing) setPhaseIndex(0);
    };

    const advancePhase = () => {
        setPhaseIndex((prev) => (prev + 1) % phases.length);
    };

    const resetBreathing = () => {
        setIsBreathing(false);
        setPhaseIndex(0);
    };

    const openExerciseModal = (workout) => {
        setSelectedWorkout(workout);
        setCurrentStepIndex(0);
        setShowExerciseModal(true);
    };

    const closeExerciseModal = () => {
        setShowExerciseModal(false);
        setSelectedWorkout(null);
        setCurrentStepIndex(0);
    };

    const goToNextStep = () => {
        if (selectedWorkout && currentStepIndex < selectedWorkout.steps.length - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
        }
    };

    const goToPreviousStep = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(currentStepIndex - 1);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.screenBody}>
                <ScrollView contentContainerStyle={styles.content}>
                    <View>
                        <Text style={styles.title}>PCOS Exercise</Text>
                        <Text style={styles.subtitle}>Movement & wellness plan for hormone balance</Text>
                    </View>

                    {/* Breathing Card */}
                    <View style={styles.card}>
                        <Wind size={24} color={theme.colors.primary} style={styles.centerIcon} />
                        <Text style={styles.cardTitle}>Breathe</Text>
                        <Text style={styles.cardSubtitle}>Calm your nervous system</Text>

                        <TouchableOpacity
                            style={[styles.breathCircle, isBreathing ? styles.breathCircleActive : null]}
                            activeOpacity={0.85}
                            onPress={isBreathing ? advancePhase : undefined}
                        >
                            <Text style={styles.breathText}>{isBreathing ? breathPhase : 'Ready'}</Text>
                        </TouchableOpacity>

                        <View style={styles.rowButtons}>
                            <TouchableOpacity style={styles.iconButton} onPress={resetBreathing}>
                                <RotateCcw size={18} color={theme.colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.primaryButton} onPress={toggleBreathing}>
                                {isBreathing
                                    ? <Pause size={16} color={theme.colors.surface} />
                                    : <Play size={16} color={theme.colors.surface} />}
                                <Text style={styles.primaryButtonText}>{isBreathing ? 'Pause' : 'Start'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Breathing Exercises */}
                    <View>
                        <Text style={styles.sectionTitle}>Breathing Exercises</Text>
                        <View style={styles.listGap}>
                            {breathingExercises.map((exercise) => (
                                <View key={exercise.name} style={styles.listItem}>
                                    <View style={styles.listIconWrap}>
                                        <Wind size={18} color={theme.colors.iconActive} />
                                    </View>
                                    <View style={styles.flex1}>
                                        <Text style={styles.listItemTitle}>{exercise.name}</Text>
                                        <Text style={styles.listItemSub}>{exercise.desc} · {exercise.duration}</Text>
                                    </View>
                                    <ChevronRight size={16} color={theme.colors.muted} />
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Exercise Categories */}
                    <View>
                        <View style={styles.workoutHeader}>
                            <Text style={styles.sectionTitle}>Exercise Categories</Text>
                            <Dumbbell size={18} color={theme.colors.primary} />
                        </View>
                        <View style={styles.listGap}>
                            {categorySections.map((categoryItem) => (
                                <View key={categoryItem.key} style={[styles.categoryCard, { backgroundColor: categoryItem.color }]}>
                                    <Text style={styles.categoryTitle}>{categoryItem.title}</Text>
                                    <Text style={styles.categorySubtitle}>{categoryItem.subtitle}</Text>
                                    <View style={styles.categoryExerciseRow}>
                                        {categoryItem.exercises.slice(0, 3).map((exercise) => (
                                            <TouchableOpacity
                                                key={exercise.id}
                                                style={styles.exerciseChip}
                                                onPress={() => openExerciseModal(exercise)}
                                                activeOpacity={0.8}
                                            >
                                                <Flower2 size={14} color={theme.colors.primary} />
                                                <Text style={styles.exerciseChipText}>{exercise.name}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* PCOS Reset Program */}
                    <View style={styles.programCard}>
                        <Text style={styles.programTitle}>PCOS Reset Program</Text>
                        <Text style={styles.programSubtitle}>A structured multi-week plan</Text>
                        {resetProgram?.weeks?.map((week) => (
                            <View key={week.week} style={styles.weekRow}>
                                <Text style={styles.weekTitle}>Week {week.week}: {week.name}</Text>
                                <Text style={styles.weekDescription}>{week.description}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Nutrition Therapy */}
                    <View style={styles.nutritionCard}>
                        <Text style={styles.nutritionTitle}>PCOS / PCOD Nutrition Therapy</Text>
                        <Text style={styles.nutritionSubtitle}>Professional diet guidance to support insulin balance, hormone health, and inflammation control.</Text>

                        <View style={styles.nutritionSection}>
                            <Text style={styles.nutritionSectionTitle}>Core Principles</Text>
                            {PCOS_DIET_PLAN.principles.map((item) => (
                                <Text key={item} style={styles.nutritionBullet}>• {item}</Text>
                            ))}
                        </View>

                        <View style={styles.nutritionSection}>
                            <Text style={styles.nutritionSectionTitle}>Foods to Include</Text>
                            <View style={styles.foodChipWrap}>
                                {PCOS_DIET_PLAN.includeFoods.map((food) => (
                                    <View key={food} style={styles.foodGoodChip}>
                                        <Text style={styles.foodGoodText}>{food}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        <View style={styles.nutritionSection}>
                            <Text style={styles.nutritionSectionTitle}>Foods to Limit</Text>
                            <View style={styles.foodChipWrap}>
                                {PCOS_DIET_PLAN.limitFoods.map((food) => (
                                    <View key={food} style={styles.foodLimitChip}>
                                        <Text style={styles.foodLimitText}>{food}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        <View style={styles.nutritionSection}>
                            <Text style={styles.nutritionSectionTitle}>7-Day Structured Plan</Text>
                            {PCOS_DIET_PLAN.weeklyPlan.map((plan) => (
                                <View key={plan.day} style={styles.dayPlanCard}>
                                    <Text style={styles.dayPlanTitle}>{plan.day}</Text>
                                    <Text style={styles.dayPlanText}>Breakfast: {plan.breakfast}</Text>
                                    <Text style={styles.dayPlanText}>Lunch: {plan.lunch}</Text>
                                    <Text style={styles.dayPlanText}>Snack: {plan.snack}</Text>
                                    <Text style={styles.dayPlanText}>Dinner: {plan.dinner}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Affirmation */}
                    <View style={styles.affirmationCard}>
                        <Sparkles size={18} color={theme.colors.surface} style={styles.centerIcon} />
                        <Text style={styles.affirmationText}>
                            Your body is healing. Every step forward counts. 💜
                        </Text>
                    </View>
                </ScrollView>

                <PcosBottomNav active="exercise" />

                {/* Exercise Step-by-Step Modal */}
                <Modal
                    visible={showExerciseModal}
                    transparent
                    animationType="slide"
                    onRequestClose={closeExerciseModal}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <View>
                                    <Text style={styles.modalTitle}>{selectedWorkout?.name}</Text>
                                    <Text style={styles.stepIndicator}>
                                        Step {currentStepIndex + 1} of {selectedWorkout?.steps?.length}
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={closeExerciseModal}>
                                    <X size={24} color={theme.colors.heading} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.stepContainer}>
                                <Exercise3DView
                                    workoutName={selectedWorkout?.name}
                                    stepIndex={currentStepIndex}
                                    modelPath={selectedWorkout?.modelPath}
                                />
                                <PoseEmoji
                                    exercise={selectedWorkout}
                                    stepIndex={currentStepIndex}
                                />
                                <Text style={styles.stepText}>
                                    {selectedWorkout?.steps?.[currentStepIndex]}
                                </Text>
                            </View>

                            <View style={styles.modalButtonContainer}>
                                <TouchableOpacity
                                    style={[styles.navButton, currentStepIndex === 0 && styles.navButtonDisabled]}
                                    onPress={goToPreviousStep}
                                    disabled={currentStepIndex === 0}
                                >
                                    <ChevronUp size={20} color={currentStepIndex === 0 ? '#ccc' : theme.colors.primary} />
                                    <Text style={[styles.navButtonText, currentStepIndex === 0 && styles.navButtonTextDisabled]}>Previous</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.navButton, currentStepIndex === (selectedWorkout?.steps?.length ?? 1) - 1 && styles.navButtonDisabled]}
                                    onPress={goToNextStep}
                                    disabled={currentStepIndex === (selectedWorkout?.steps?.length ?? 1) - 1}
                                >
                                    <Text style={[styles.navButtonText, currentStepIndex === (selectedWorkout?.steps?.length ?? 1) - 1 && styles.navButtonTextDisabled]}>Next</Text>
                                    <ChevronDown size={20} color={currentStepIndex === (selectedWorkout?.steps?.length ?? 1) - 1 ? '#ccc' : theme.colors.primary} />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity style={styles.closeButton} onPress={closeExerciseModal}>
                                <Text style={styles.closeButtonText}>Done</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
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
        paddingBottom: 100,
        gap: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: theme.colors.heading,
    },
    subtitle: {
        marginTop: 4,
        fontSize: 14,
        color: theme.colors.body,
    },
    card: {
        backgroundColor: theme.colors.card,
        borderRadius: 24,
        padding: 20,
        alignItems: 'center',
        ...theme.shadows.soft,
    },
    centerIcon: {
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.heading,
    },
    cardSubtitle: {
        fontSize: 12,
        color: theme.colors.body,
        marginTop: 2,
        marginBottom: 16,
    },
    breathCircle: {
        width: 120,
        height: 120,
        borderRadius: 999,
        borderWidth: 4,
        borderColor: theme.colors.inputBorder,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    breathCircleActive: {
        borderColor: theme.colors.primary,
    },
    breathText: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.primary,
        textTransform: 'capitalize',
    },
    rowButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.surface,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        height: 44,
        borderRadius: 14,
        paddingHorizontal: 18,
        backgroundColor: theme.colors.primaryDark,
    },
    primaryButtonText: {
        color: theme.colors.surface,
        fontSize: 14,
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.heading,
        marginBottom: 10,
    },
    listGap: {
        gap: 8,
    },
    listItem: {
        backgroundColor: theme.colors.surface,
        borderRadius: 14,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        ...theme.shadows.soft,
    },
    listIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: theme.colors.accentBlue,
        alignItems: 'center',
        justifyContent: 'center',
    },
    flex1: {
        flex: 1,
    },
    listItemTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.heading,
    },
    listItemSub: {
        marginTop: 2,
        fontSize: 12,
        color: theme.colors.body,
    },
    workoutHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    categoryCard: {
        borderRadius: 16,
        padding: 12,
    },
    categoryTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.heading,
    },
    categorySubtitle: {
        marginTop: 4,
        fontSize: 12,
        color: theme.colors.body,
    },
    categoryExerciseRow: {
        marginTop: 10,
        gap: 8,
    },
    exerciseChip: {
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
        backgroundColor: theme.colors.surface,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    exerciseChipText: {
        flex: 1,
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.heading,
    },
    programCard: {
        borderRadius: 20,
        padding: 16,
        backgroundColor: theme.colors.card,
        ...theme.shadows.soft,
    },
    programTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.heading,
    },
    programSubtitle: {
        marginTop: 4,
        marginBottom: 12,
        fontSize: 12,
        color: theme.colors.body,
    },
    weekRow: {
        borderRadius: 12,
        padding: 10,
        marginBottom: 8,
        backgroundColor: theme.colors.surface,
    },
    weekTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: theme.colors.heading,
    },
    weekDescription: {
        marginTop: 2,
        fontSize: 12,
        color: theme.colors.body,
    },
    nutritionCard: {
        borderRadius: 20,
        padding: 16,
        backgroundColor: theme.colors.card,
        ...theme.shadows.soft,
    },
    nutritionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.heading,
    },
    nutritionSubtitle: {
        marginTop: 4,
        fontSize: 12,
        color: theme.colors.body,
    },
    nutritionSection: {
        marginTop: 12,
        gap: 6,
    },
    nutritionSectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: theme.colors.heading,
    },
    nutritionBullet: {
        fontSize: 12,
        color: theme.colors.body,
        lineHeight: 18,
    },
    foodChipWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    foodGoodChip: {
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: theme.colors.accentGreen,
    },
    foodGoodText: {
        fontSize: 11,
        fontWeight: '600',
        color: theme.colors.heading,
    },
    foodLimitChip: {
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: theme.colors.accentPink,
    },
    foodLimitText: {
        fontSize: 11,
        fontWeight: '600',
        color: theme.colors.secondaryText,
    },
    dayPlanCard: {
        borderRadius: 12,
        padding: 10,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        marginTop: 6,
    },
    dayPlanTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.colors.heading,
        marginBottom: 4,
    },
    dayPlanText: {
        fontSize: 11,
        color: theme.colors.body,
        lineHeight: 16,
    },
    affirmationCard: {
        borderRadius: 20,
        padding: 16,
        backgroundColor: theme.colors.primaryDark,
        alignItems: 'center',
    },
    affirmationText: {
        color: theme.colors.surface,
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '600',
        fontStyle: 'italic',
    },
    poseContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    poseEmoji: {
        fontSize: 80,
        marginBottom: 12,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: theme.colors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        minHeight: '70%',
        justifyContent: 'space-between',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.heading,
        marginBottom: 4,
    },
    stepIndicator: {
        fontSize: 12,
        color: theme.colors.body,
        fontWeight: '600',
    },
    stepContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.card,
        borderRadius: 16,
        padding: 20,
        marginVertical: 24,
    },
    stepText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.heading,
        textAlign: 'center',
        lineHeight: 24,
    },
    modalButtonContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    navButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: theme.colors.primaryLight,
        borderWidth: 1,
        borderColor: theme.colors.primary,
    },
    navButtonDisabled: {
        backgroundColor: '#f5f5f5',
        borderColor: '#ddd',
    },
    navButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.primary,
    },
    navButtonTextDisabled: {
        color: '#999',
    },
    closeButton: {
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
});
