import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Smile, Utensils, Zap, Moon, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { db } from '../firebase/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SYMPTOMS, MOODS } from '../constants/tracker-data';
import { theme } from '../styles/theme';

export default function LoggingHubScreen() {
    const router = useRouter();
    const { currentUser } = useAuth();
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('period');
    const [saving, setSaving] = useState(false);

    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState('');
    const [selectedSymptoms, setSelectedSymptoms] = useState([]);
    const [severity, setSeverity] = useState(3);
    const [selectedMood, setSelectedMood] = useState('Happy');
    const [moodNote, setMoodNote] = useState('');
    const [calories, setCalories] = useState('2000');
    const [water, setWater] = useState('1500');
    const [sleep, setSleep] = useState('7');
    const [workout, setWorkout] = useState('30');

    const tabs = [
        { id: 'period', icon: Calendar, label: t('cycle') },
        { id: 'symptoms', icon: Zap, label: t('feelings') },
        { id: 'mood', icon: Smile, label: t('mood') },
        { id: 'diet', icon: Utensils, label: t('food') },
        { id: 'wellness', icon: Moon, label: t('sleep') },
    ];

    const hydrationPct = useMemo(() => {
        const value = Number(water) || 0;
        return Math.max(0, Math.min(100, Math.round((value / 2000) * 100)));
    }, [water]);

    const toggleSymptom = (symptom) => {
        setSelectedSymptoms((prev) =>
            prev.includes(symptom) ? prev.filter((entry) => entry !== symptom) : [...prev, symptom]
        );
    };

    const saveLog = async () => {
        if (!currentUser) return;

        try {
            setSaving(true);

            let collectionName = '';
            let payload = {
                userId: currentUser.uid,
                timestamp: Timestamp.fromDate(new Date()),
                createdAtServer: serverTimestamp(),
            };

            if (activeTab === 'period') {
                collectionName = 'periodHistory';
                payload = { ...payload, startDate, endDate: endDate || null };
            }

            if (activeTab === 'symptoms') {
                collectionName = 'symptomLogs';
                const symptomsMap = { cramps: 0, acne: 0, headache: 0, fatigue: 0, bloating: 0 };
                selectedSymptoms.forEach((entry) => {
                    const key = entry.toLowerCase().replace(/\s+/g, '');
                    if (key.includes('cramp')) symptomsMap.cramps = severity;
                    if (key.includes('acne')) symptomsMap.acne = severity;
                    if (key.includes('head')) symptomsMap.headache = severity;
                    if (key.includes('fatigue')) symptomsMap.fatigue = severity;
                    if (key.includes('bloat')) symptomsMap.bloating = severity;
                });
                payload = { ...payload, symptoms: symptomsMap, selectedSymptoms, severity };
            }

            if (activeTab === 'mood') {
                collectionName = 'moodLogs';
                const moodScale = {
                    Sad: 1,
                    Low: 2,
                    Neutral: 3,
                    Calm: 4,
                    Happy: 5,
                    Energetic: 5,
                };
                payload = { ...payload, mood: moodScale[selectedMood] || 3, moodLabel: selectedMood, note: moodNote };
            }

            if (activeTab === 'diet') {
                collectionName = 'dietLogs';
                payload = { ...payload, calories: Number(calories) || 0, waterIntake: Number(water) || 0 };
            }

            if (activeTab === 'wellness') {
                collectionName = 'sleepLogs';
                payload = {
                    ...payload,
                    hours: Number(sleep) || 0,
                    quality: (Number(sleep) || 0) >= 7 ? 'Good' : 'Neutral',
                    workoutMinutes: Number(workout) || 0,
                };
            }

            const savePromise = addDoc(collection(db, collectionName), payload);
            
            // Clear reports cache to force refresh on next view
            const cacheKeys = [
                `reportsCache:${currentUser.uid}:weekly`,
                `reportsCache:${currentUser.uid}:monthly`,
                `dashboardCache:${currentUser.uid}`,
            ];
            Promise.all(cacheKeys.map((key) => AsyncStorage.removeItem(key))).catch(() => null);

            savePromise.catch((error) => {
                console.error(error);
                Alert.alert(t('error'), t('failedToSaveLog'));
            });

            const tabLabelMap = {
                period: t('logType_period'),
                symptoms: t('logType_symptoms'),
                mood: t('logType_mood'),
                diet: t('logType_diet'),
                wellness: t('logType_sleep'),
            };
            
            Alert.alert(t('saved'), `${tabLabelMap[activeTab] || t('log')} ${t('logSaved')}`, [
                {
                    text: t('ok') || 'OK',
                    onPress: () => {
                        // Reset form after log saved
                        setStartDate(new Date().toISOString().split('T')[0]);
                        setEndDate('');
                        setSelectedSymptoms([]);
                        setSeverity(3);
                        setSelectedMood('Happy');
                        setMoodNote('');
                        setCalories('2000');
                        setWater('1500');
                        setSleep('7');
                        setWorkout('30');
                    }
                }
            ]);
        } catch (error) {
            console.error(error);
            Alert.alert(t('error'), t('failedToSaveLog'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.headerRow}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <ArrowLeft size={20} color={theme.colors.heading} />
                    </TouchableOpacity>
                    <Text style={styles.title}>{t('dailyLogs')}</Text>
                    <View style={styles.backButton} />
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab.id}
                            onPress={() => setActiveTab(tab.id)}
                            style={[styles.tabButton, activeTab === tab.id ? styles.tabButtonActive : styles.tabButtonInactive]}
                        >
                            <tab.icon size={16} color={activeTab === tab.id ? theme.colors.surface : theme.colors.body} />
                            <Text style={[styles.tabLabel, activeTab === tab.id ? styles.tabLabelActive : styles.tabLabelInactive]}>{tab.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <View style={styles.card}>
                    {activeTab === 'period' && (
                        <View style={styles.sectionContent}>
                            <Text style={styles.sectionTitle}>{t('logPeriodDates')}</Text>
                            <View>
                                <Text style={styles.inputLabel}>{t('startDateFormat')}</Text>
                                <TextInput style={styles.input} value={startDate} onChangeText={setStartDate} />
                            </View>
                            <View>
                                <Text style={styles.inputLabel}>{t('endDateOptional')}</Text>
                                <TextInput style={styles.input} value={endDate} onChangeText={setEndDate} />
                            </View>
                            <View style={styles.tipCard}>
                                <Text style={styles.tipText}>{t('cyclePredictionTip')}</Text>
                            </View>
                        </View>
                    )}

                    {activeTab === 'symptoms' && (
                        <View style={styles.sectionContent}>
                            <Text style={styles.sectionTitle}>{t('howAreYouFeeling')}</Text>
                            <View style={styles.chipsWrap}>
                                {SYMPTOMS.map((symptom) => {
                                    const selected = selectedSymptoms.includes(symptom);
                                    return (
                                        <TouchableOpacity
                                            key={symptom}
                                            onPress={() => toggleSymptom(symptom)}
                                            style={[styles.chip, selected ? styles.chipSelected : styles.chipDefault]}
                                        >
                                            <Text style={[styles.chipText, selected ? styles.chipTextSelected : styles.chipTextDefault]}>{symptom}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            <View>
                                <View style={styles.rowBetween}>
                                    <Text style={styles.inputLabel}>{t('severityLevel')}</Text>
                                    <Text style={styles.severityText}>{severity}/5</Text>
                                </View>
                                <View style={styles.rangeRow}>
                                    {[1, 2, 3, 4, 5].map((value) => (
                                        <TouchableOpacity
                                            key={value}
                                            style={[styles.rangeDot, severity === value && styles.rangeDotActive]}
                                            onPress={() => setSeverity(value)}
                                        >
                                            <Text style={[styles.rangeDotText, severity === value && styles.rangeDotTextActive]}>{value}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </View>
                    )}

                    {activeTab === 'mood' && (
                        <View style={styles.sectionContent}>
                            <Text style={styles.sectionTitle}>{t('todaysMood')}</Text>
                            <View style={styles.moodGrid}>
                                {MOODS.map((mood) => {
                                    const selected = selectedMood === mood.label;
                                    return (
                                        <TouchableOpacity
                                            key={mood.label}
                                            onPress={() => setSelectedMood(mood.label)}
                                            style={[styles.moodCard, selected ? styles.moodCardSelected : styles.moodCardDefault]}
                                        >
                                            <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                                            <Text style={styles.moodLabel}>{mood.label}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            <TextInput
                                style={styles.textArea}
                                placeholder={t('moodNotePlaceholder')}
                                placeholderTextColor={theme.colors.muted}
                                multiline
                                value={moodNote}
                                onChangeText={setMoodNote}
                            />
                        </View>
                    )}

                    {activeTab === 'diet' && (
                        <View style={styles.sectionContent}>
                            <Text style={styles.sectionTitle}>{t('nutritionalProgress')}</Text>
                            <View>
                                <Text style={styles.inputLabel}>{t('waterIntakeMl')}</Text>
                                <View style={styles.waterRow}>
                                    <TextInput
                                        style={[styles.input, styles.flex1]}
                                        keyboardType="numeric"
                                        value={water}
                                        onChangeText={setWater}
                                    />
                                    <View style={styles.percentCircle}>
                                        <Text style={styles.percentText}>{hydrationPct}%</Text>
                                    </View>
                                </View>
                            </View>

                            <View>
                                <Text style={styles.inputLabel}>{t('calories')}</Text>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="numeric"
                                    value={calories}
                                    onChangeText={setCalories}
                                />
                            </View>
                        </View>
                    )}

                    {activeTab === 'wellness' && (
                        <View style={styles.sectionContent}>
                            <Text style={styles.sectionTitle}>{t('activitySleep')}</Text>
                            <View>
                                <Text style={styles.inputLabel}>{t('sleepHours')}</Text>
                                <TextInput style={styles.input} keyboardType="numeric" value={sleep} onChangeText={setSleep} />
                            </View>
                            <View>
                                <Text style={styles.inputLabel}>{t('workoutMinutes')}</Text>
                                <TextInput style={styles.input} keyboardType="numeric" value={workout} onChangeText={setWorkout} />
                            </View>
                        </View>
                    )}

                    <TouchableOpacity style={styles.saveButton} onPress={saveLog} disabled={saving}>
                        {saving ? <ActivityIndicator color={theme.colors.surface} /> : <Text style={styles.saveButtonText}>{t('saveChanges')}</Text>}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        padding: 20,
        gap: 16,
        paddingBottom: 36,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: theme.colors.heading,
    },
    tabScroll: {
        gap: 10,
        paddingVertical: 4,
    },
    tabButton: {
        height: 40,
        borderRadius: 999,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    tabButtonActive: {
        backgroundColor: theme.colors.primary,
        ...theme.shadows.soft,
    },
    tabButtonInactive: {
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
    },
    tabLabel: {
        fontSize: 13,
        fontWeight: '600',
    },
    tabLabelActive: {
        color: theme.colors.surface,
    },
    tabLabelInactive: {
        color: theme.colors.body,
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: 24,
        padding: 18,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        ...theme.shadows.soft,
        gap: 16,
    },
    sectionContent: {
        gap: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.primary,
    },
    inputLabel: {
        fontSize: 13,
        color: theme.colors.body,
        fontWeight: '500',
        marginBottom: 6,
    },
    input: {
        height: 46,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        backgroundColor: theme.colors.surface,
        color: theme.colors.heading,
        paddingHorizontal: 14,
        fontSize: 15,
    },
    tipCard: {
        padding: 12,
        borderRadius: 12,
        backgroundColor: theme.colors.card,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
    },
    tipText: {
        fontSize: 12,
        color: theme.colors.body,
    },
    chipsWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 7,
    },
    chipSelected: {
        backgroundColor: theme.colors.primary,
    },
    chipDefault: {
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
    },
    chipText: {
        fontSize: 12,
        fontWeight: '600',
    },
    chipTextSelected: {
        color: theme.colors.surface,
    },
    chipTextDefault: {
        color: theme.colors.body,
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    severityText: {
        color: theme.colors.primary,
        fontWeight: '700',
    },
    rangeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
        marginTop: 8,
    },
    rangeDot: {
        flex: 1,
        height: 36,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
    },
    rangeDotActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    rangeDotText: {
        color: theme.colors.body,
        fontWeight: '600',
        fontSize: 12,
    },
    rangeDotTextActive: {
        color: theme.colors.surface,
    },
    moodGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    moodCard: {
        width: '31%',
        minHeight: 86,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    moodCardSelected: {
        backgroundColor: theme.colors.card,
        borderWidth: 2,
        borderColor: theme.colors.primary,
    },
    moodCardDefault: {
        backgroundColor: theme.colors.background,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
    },
    moodEmoji: {
        fontSize: 28,
    },
    moodLabel: {
        fontSize: 11,
        color: theme.colors.body,
        fontWeight: '600',
    },
    textArea: {
        minHeight: 100,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        backgroundColor: theme.colors.background,
        padding: 12,
        color: theme.colors.heading,
        textAlignVertical: 'top',
    },
    waterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    flex1: {
        flex: 1,
    },
    percentCircle: {
        width: 54,
        height: 54,
        borderRadius: 27,
        borderWidth: 3,
        borderColor: theme.colors.secondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    percentText: {
        fontSize: 11,
        color: theme.colors.secondaryText,
        fontWeight: '700',
    },
    saveButton: {
        height: 52,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.primaryDark,
        ...theme.shadows.soft,
    },
    saveButtonText: {
        color: theme.colors.surface,
        fontSize: 16,
        fontWeight: '700',
    },
});
