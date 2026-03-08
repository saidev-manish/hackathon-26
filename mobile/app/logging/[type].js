import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Alert,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { ArrowLeft, Droplets, Flame, Moon, Activity, Smile, Calendar } from 'lucide-react-native';
import { theme } from '../../styles/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoggingScreen() {
    const { type } = useLocalSearchParams();
    const { currentUser } = useAuth();
    const { t } = useLanguage();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Form States
    const [symptoms, setSymptoms] = useState({ cramps: 0, acne: 0, headache: 0, fatigue: 0, bloating: 0 });
    const [diet, setDiet] = useState({ water: '', calories: '' });
    const [sleep, setSleep] = useState({ hours: '', quality: 'Neutral' });
    const [workout, setWorkout] = useState({ type: '', duration: '', intensity: 'Medium' });
    const [mood, setMood] = useState(3);
    const [period, setPeriod] = useState({ startDate: new Date().toISOString().split('T')[0], endDate: '' });

    const handleSave = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            let collectionName = '';
            let data = {
                userId: currentUser.uid,
                timestamp: Timestamp.fromDate(new Date()),
                createdAtServer: serverTimestamp(),
            };

            switch (type) {
                case 'symptoms':
                    collectionName = 'symptomLogs';
                    data.symptoms = symptoms;
                    break;
                case 'diet':
                    collectionName = 'dietLogs';
                    data.waterIntake = Number(diet.water);
                    data.calories = Number(diet.calories);
                    break;
                case 'sleep':
                    collectionName = 'sleepLogs';
                    data.hours = Number(sleep.hours);
                    data.quality = sleep.quality;
                    break;
                case 'workout':
                    collectionName = 'workoutLogs';
                    data.type = workout.type;
                    data.duration = Number(workout.duration);
                    data.intensity = workout.intensity;
                    break;
                case 'mood':
                    collectionName = 'moodLogs';
                    data.mood = mood;
                    break;
                case 'period':
                    collectionName = 'periodHistory';
                    data.startDate = period.startDate;
                    data.endDate = period.endDate || null;
                    break;
            }

            const savePromise = addDoc(collection(db, collectionName), data);
            
            // Clear caches to force fresh data on next view
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

            router.back();
            return;
        } catch (error) {
            console.error(error);
            Alert.alert(t('error'), t('failedToSaveLog'));
        } finally {
            setLoading(false);
        }
    };

    const renderSymptoms = () => (
        <View>
            {Object.keys(symptoms).map((s) => (
                <View key={s} style={styles.logItem}>
                    <Text style={styles.logLabel}>{s.charAt(0).toUpperCase() + s.slice(1)}</Text>
                    <View style={styles.selectorRow}>
                        {[0, 1, 2, 3].map((lvl) => (
                            <TouchableOpacity
                                key={lvl}
                                onPress={() => setSymptoms({ ...symptoms, [s]: lvl })}
                                style={[styles.selectorBtn, symptoms[s] === lvl && styles.selectorBtnActive]}
                            >
                                <Text style={[styles.selectorBtnText, symptoms[s] === lvl && styles.selectorBtnTextActive]}>
                                    {lvl === 0 ? t('none') : lvl}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            ))}
        </View>
    );

    const renderDiet = () => (
        <View>
            <View style={styles.inputGroup}>
                <View style={styles.labelRow}><Droplets size={16} color={theme.colors.primary} /><Text style={styles.label}>{t('waterGlasses')}</Text></View>
                <TextInput style={styles.input} keyboardType="numeric" value={diet.water} onChangeText={(v) => setDiet({ ...diet, water: v })} placeholder="8" />
            </View>
            <View style={styles.inputGroup}>
                <View style={styles.labelRow}><Flame size={16} color={theme.colors.primary} /><Text style={styles.label}>{t('caloriesKcal')}</Text></View>
                <TextInput style={styles.input} keyboardType="numeric" value={diet.calories} onChangeText={(v) => setDiet({ ...diet, calories: v })} placeholder="2000" />
            </View>
        </View>
    );

    const renderSleep = () => (
        <View>
            <View style={styles.inputGroup}>
                <View style={styles.labelRow}><Moon size={16} color={theme.colors.primary} /><Text style={styles.label}>{t('hoursSlept')}</Text></View>
                <TextInput style={styles.input} keyboardType="numeric" value={sleep.hours} onChangeText={(v) => setSleep({ ...sleep, hours: v })} placeholder="7.5" />
            </View>
            <Text style={styles.label}>{t('quality')}</Text>
            <View style={styles.selectorRow}>
                {[
                    { key: 'Poor', label: t('poor') },
                    { key: 'Neutral', label: t('neutral') },
                    { key: 'Good', label: t('good') },
                    { key: 'Excellent', label: t('excellent') },
                ].map((q) => (
                    <TouchableOpacity key={q.key} onPress={() => setSleep({ ...sleep, quality: q.key })} style={[styles.selectorBtn, sleep.quality === q.key && styles.selectorBtnActive, { flex: 1 }]}>
                        <Text style={[styles.selectorBtnText, sleep.quality === q.key && styles.selectorBtnTextActive, { fontSize: 10 }]}>{q.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderWorkout = () => (
        <View>
            <View style={styles.inputGroup}>
                <View style={styles.labelRow}><Activity size={16} color={theme.colors.primary} /><Text style={styles.label}>{t('workoutType')}</Text></View>
                <TextInput style={styles.input} value={workout.type} onChangeText={(v) => setWorkout({ ...workout, type: v })} placeholder={t('workoutTypePlaceholder')} />
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('durationMins')}</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={workout.duration} onChangeText={(v) => setWorkout({ ...workout, duration: v })} placeholder="30" />
            </View>
            <Text style={styles.label}>{t('intensity')}</Text>
            <View style={styles.selectorRow}>
                {[
                    { key: 'Low', label: t('low') },
                    { key: 'Medium', label: t('medium') },
                    { key: 'High', label: t('high') },
                ].map((i) => (
                    <TouchableOpacity key={i.key} onPress={() => setWorkout({ ...workout, intensity: i.key })} style={[styles.selectorBtn, workout.intensity === i.key && styles.selectorBtnActive, { flex: 1 }]}>
                        <Text style={[styles.selectorBtnText, workout.intensity === i.key && styles.selectorBtnTextActive]}>{i.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderMood = () => (
        <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 64, marginBottom: 20 }}>
                {['😢', '😕', '😐', '🙂', '😊'][mood - 1]}
            </Text>
            <View style={styles.selectorRow}>
                {[1, 2, 3, 4, 5].map((m) => (
                    <TouchableOpacity key={m} onPress={() => setMood(m)} style={[styles.selectorBtn, mood === m && styles.selectorBtnActive, { width: 50 }]}>
                        <Text style={[styles.selectorBtnText, mood === m && styles.selectorBtnTextActive]}>{m}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderPeriod = () => (
        <View>
            <View style={styles.inputGroup}>
                <View style={styles.labelRow}><Calendar size={16} color={theme.colors.primary} /><Text style={styles.label}>{t('startDateFormat')}</Text></View>
                <TextInput style={styles.input} value={period.startDate} onChangeText={(v) => setPeriod({ ...period, startDate: v })} placeholder="2026-02-15" />
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('endDateOptional')}</Text>
                <TextInput style={styles.input} value={period.endDate} onChangeText={(v) => setPeriod({ ...period, endDate: v })} placeholder="2026-02-20" />
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color={theme.colors.heading} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('log')} {t(`logType_${type || 'period'}`)}</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.card}>
                    {type === 'symptoms' && renderSymptoms()}
                    {type === 'diet' && renderDiet()}
                    {type === 'sleep' && renderSleep()}
                    {type === 'workout' && renderWorkout()}
                    {type === 'mood' && renderMood()}
                    {type === 'period' && renderPeriod()}

                    <TouchableOpacity
                        style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color={theme.colors.surface} /> : <Text style={styles.saveBtnText}>{t('saveLog')}</Text>}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: theme.colors.surface },
    backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.heading },
    content: { padding: 20 },
    card: { backgroundColor: theme.colors.card, borderRadius: 24, padding: 24, ...theme.shadows.soft },
    logItem: { marginBottom: 20 },
    logLabel: { fontSize: 16, fontWeight: '500', color: theme.colors.body, marginBottom: 12 },
    selectorRow: { flexDirection: 'row', gap: 8 },
    selectorBtn: { flex: 1, height: 40, backgroundColor: theme.colors.surface, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.colors.inputBorder },
    selectorBtnActive: { backgroundColor: theme.colors.primaryDark },
    selectorBtnText: { color: theme.colors.body, fontSize: 14, fontWeight: '600' },
    selectorBtnTextActive: { color: theme.colors.surface },
    inputGroup: { marginBottom: 20 },
    labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    label: { fontSize: 14, fontWeight: '500', color: theme.colors.body },
    input: { backgroundColor: theme.colors.surface, borderRadius: 12, height: 48, paddingHorizontal: 16, fontSize: 16, color: theme.colors.heading, borderWidth: 1, borderColor: theme.colors.inputBorder },
    saveBtn: { backgroundColor: theme.colors.primaryDark, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 24 },
    saveBtnDisabled: { opacity: 0.6 },
    saveBtnText: { color: theme.colors.surface, fontSize: 18, fontWeight: '700' },
});
