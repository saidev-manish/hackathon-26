import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArrowLeft, CalendarDays, Droplets, CupSoda, Dumbbell, Salad } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../styles/theme';

export default function PcosHydrationFourFiveScreen() {
    const { currentUser } = useAuth();
    const router = useRouter();
    const [currentMl, setCurrentMl] = useState(0);
    const [logs, setLogs] = useState([]);
    const [customAmount, setCustomAmount] = useState('');

    const targetMl = 2500;
    const todayKey = useMemo(() => {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }, []);

    const storageKey = useMemo(() => {
        if (!currentUser?.uid) return null;
        return `pcosHydration4to5:${currentUser.uid}:${todayKey}`;
    }, [currentUser?.uid, todayKey]);

    const toTimeLabel = useCallback((date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }, []);

    const saveHydrationData = useCallback(async (nextMl, nextLogs) => {
        if (!storageKey) return;
        try {
            await AsyncStorage.setItem(storageKey, JSON.stringify({ currentMl: nextMl, logs: nextLogs }));
        } catch (error) {
            console.error('Failed to save hydration data', error);
        }
    }, [storageKey]);

    const addWater = useCallback((amountMl, label) => {
        if (!amountMl || amountMl <= 0) return;

        const now = new Date();
        const nextLog = {
            id: `${now.getTime()}`,
            amountMl,
            label,
            time: toTimeLabel(now),
            type: 'water',
        };

        setCurrentMl((prevMl) => {
            const nextMl = prevMl + amountMl;
            setLogs((prevLogs) => {
                const nextLogs = [nextLog, ...prevLogs].slice(0, 20);
                saveHydrationData(nextMl, nextLogs);
                return nextLogs;
            });
            return nextMl;
        });
    }, [saveHydrationData, toTimeLabel]);

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
            console.error('Failed to enforce PCOS hydration 4-5 route', error);
        });

        return () => {
            active = false;
        };
    }, [currentUser?.uid, router]);

    useEffect(() => {
        let active = true;

        const loadHydrationData = async () => {
            if (!storageKey) return;
            try {
                const saved = await AsyncStorage.getItem(storageKey);
                if (!active || !saved) return;
                const parsed = JSON.parse(saved);
                setCurrentMl(typeof parsed?.currentMl === 'number' ? parsed.currentMl : 0);
                setLogs(Array.isArray(parsed?.logs) ? parsed.logs : []);
            } catch (error) {
                console.error('Failed to load hydration data', error);
            }
        };

        loadHydrationData();

        return () => {
            active = false;
        };
    }, [storageKey]);

    const percent = Math.max(0, Math.min(100, Math.round((currentMl / targetMl) * 100)));
    const remainingMl = Math.max(0, targetMl - currentMl);
    const currentLiters = (currentMl / 1000).toFixed(1);
    const targetLiters = (targetMl / 1000).toFixed(1);
    const remainingLiters = (remainingMl / 1000).toFixed(1);

    const motivationMessage = useMemo(() => {
        if (percent >= 100) return 'Amazing! You completed today\'s hydration goal.';
        if (percent >= 75) return 'Great pace! You\'re close to your goal.';
        if (percent >= 40) return 'Keep it up! You\'re almost halfway.';
        return 'Good start! Keep sipping water through the day.';
    }, [percent]);

    const handleCustomAdd = useCallback(() => {
        const amount = Number(customAmount.trim());
        if (!Number.isFinite(amount) || amount <= 0) {
            Alert.alert('Invalid amount', 'Enter a valid water amount in ml.');
            return;
        }

        if (amount > 5000) {
            Alert.alert('Amount too high', 'Please enter an amount less than or equal to 5000 ml.');
            return;
        }

        addWater(Math.round(amount), 'Custom amount');
        setCustomAmount('');
    }, [addWater, customAmount]);

    const waterLevelStyle = useMemo(() => ({
        height: `${percent}%`,
    }), [percent]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.screenBody}>
                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.headerRow}>
                        <TouchableOpacity onPress={() => router.replace('/pcos-duration-4-5')} style={styles.iconButton}>
                            <ArrowLeft size={22} color={theme.colors.primary} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Hydration Tracker</Text>
                        <TouchableOpacity style={styles.iconButton}>
                            <CalendarDays size={22} color={theme.colors.primary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.tankWrap}>
                        <View style={styles.tank}>
                            <View style={[styles.waterLevel, waterLevelStyle]} />
                            <View style={styles.tankCenterText}>
                                <Text style={styles.percentText}>{percent}%</Text>
                                <Text style={styles.hydratedText}>HYDRATED</Text>
                            </View>
                        </View>
                    </View>

                    <Text style={styles.motivation}>{motivationMessage}</Text>

                    <View style={styles.card}>
                        <Text style={styles.cardLabel}>DAILY PROGRESS</Text>
                        <View style={styles.progressHeader}>
                            <Text style={styles.progressMain}>{currentLiters}L <Text style={styles.progressTarget}>/ {targetLiters}L</Text></Text>
                            <Text style={styles.progressRemain}>{remainingLiters}L to go</Text>
                        </View>
                        <View style={styles.progressTrack}>
                            <View style={[styles.progressFill, { width: `${percent}%` }]} />
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>QUICK ADD</Text>
                    <View style={styles.quickRow}>
                        <TouchableOpacity style={[styles.quickCard, styles.quickCardLight]} onPress={() => addWater(250, 'Quick add')}>
                            <CupSoda size={30} color={theme.colors.primary} />
                            <Text style={styles.quickText}>+250 ml</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.quickCard, styles.quickCardPrimary]} onPress={() => addWater(500, 'Quick add')}>
                            <CupSoda size={30} color={theme.colors.surface} />
                            <Text style={styles.quickTextPrimary}>+500 ml</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.customRow}>
                        <TextInput
                            value={customAmount}
                            onChangeText={setCustomAmount}
                            placeholder="Custom ml"
                            placeholderTextColor={theme.colors.muted}
                            keyboardType="number-pad"
                            style={styles.customInput}
                        />
                        <TouchableOpacity style={styles.customBtn} onPress={handleCustomAdd}>
                            <Text style={styles.customBtnText}>+ Add</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.logsHeader}>
                        <Text style={styles.sectionTitle}>TODAY'S LOGS</Text>
                        <Text style={styles.viewAll}>{logs.length}</Text>
                    </View>

                    {logs.length === 0 ? (
                        <View style={styles.emptyLogCard}>
                            <Text style={styles.emptyLogText}>No logs yet. Add water to start tracking.</Text>
                        </View>
                    ) : (
                        logs.map((log) => (
                            <View key={log.id} style={styles.logCard}>
                                <View style={styles.logIconWrap}><Droplets size={18} color={theme.colors.primary} /></View>
                                <View style={styles.logTextWrap}>
                                    <Text style={styles.logAmount}>{log.amountMl}ml</Text>
                                    <Text style={styles.logDesc}>{log.label}</Text>
                                </View>
                                <Text style={styles.logTime}>{log.time}</Text>
                            </View>
                        ))
                    )}

                    <View style={{ height: 8 }} />
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
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 100,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    iconButton: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: theme.colors.heading,
    },
    tankWrap: {
        alignItems: 'center',
        marginTop: 14,
        marginBottom: 8,
    },
    tank: {
        width: 210,
        height: 300,
        borderRadius: 34,
        borderWidth: 3,
        borderColor: theme.colors.primaryLight,
        backgroundColor: theme.colors.surface,
        overflow: 'hidden',
        justifyContent: 'center',
    },
    waterLevel: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: theme.colors.primary,
        opacity: 0.82,
    },
    tankCenterText: {
        alignItems: 'center',
    },
    percentText: {
        fontSize: 54,
        fontWeight: '800',
        color: theme.colors.primary,
    },
    hydratedText: {
        fontSize: 14,
        letterSpacing: 2,
        color: theme.colors.primaryDark,
        fontWeight: '700',
    },
    motivation: {
        textAlign: 'center',
        color: theme.colors.body,
        fontSize: 18,
        marginTop: 10,
        marginBottom: 18,
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        padding: 16,
        ...theme.shadows.soft,
    },
    cardLabel: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.body,
        letterSpacing: 0.8,
        marginBottom: 8,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    progressMain: {
        fontSize: 44,
        fontWeight: '800',
        color: theme.colors.heading,
    },
    progressTarget: {
        fontSize: 28,
        fontWeight: '600',
        color: theme.colors.muted,
    },
    progressRemain: {
        fontSize: 34,
        fontWeight: '700',
        color: theme.colors.primary,
    },
    progressTrack: {
        height: 16,
        marginTop: 10,
        borderRadius: 99,
        backgroundColor: theme.colors.inputBorder,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: theme.colors.primary,
    },
    sectionTitle: {
        marginTop: 22,
        marginBottom: 12,
        fontSize: 30,
        fontWeight: '800',
        color: theme.colors.heading,
        letterSpacing: 0.8,
    },
    quickRow: {
        flexDirection: 'row',
        gap: 12,
    },
    quickCard: {
        flex: 1,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 110,
        ...theme.shadows.soft,
    },
    quickCardLight: {
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.inputBorder,
    },
    quickCardPrimary: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    quickText: {
        marginTop: 10,
        color: theme.colors.primary,
        fontSize: 18,
        fontWeight: '700',
    },
    quickTextPrimary: {
        marginTop: 10,
        color: theme.colors.surface,
        fontSize: 18,
        fontWeight: '700',
    },
    customBtn: {
        borderRadius: 14,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        minHeight: 56,
        minWidth: 110,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.primary,
    },
    customBtnText: {
        fontSize: 18,
        color: theme.colors.surface,
        fontWeight: '700',
    },
    customRow: {
        marginTop: 12,
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
    },
    customInput: {
        flex: 1,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        minHeight: 56,
        paddingHorizontal: 14,
        color: theme.colors.heading,
        fontSize: 16,
        backgroundColor: theme.colors.surface,
    },
    logsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    viewAll: {
        fontSize: 18,
        color: theme.colors.primary,
        fontWeight: '700',
        marginTop: 18,
    },
    logCard: {
        marginTop: 10,
        backgroundColor: theme.colors.surface,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        paddingVertical: 12,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        ...theme.shadows.soft,
    },
    logIconWrap: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.accentBlue,
    },
    logTextWrap: {
        flex: 1,
        marginLeft: 10,
    },
    logAmount: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.heading,
    },
    logDesc: {
        marginTop: 2,
        color: theme.colors.body,
        fontSize: 16,
    },
    logTime: {
        color: theme.colors.muted,
        fontSize: 16,
        fontWeight: '600',
    },
    emptyLogCard: {
        marginTop: 10,
        backgroundColor: theme.colors.surface,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        paddingVertical: 18,
        paddingHorizontal: 14,
        ...theme.shadows.soft,
    },
    emptyLogText: {
        fontSize: 15,
        color: theme.colors.body,
        textAlign: 'center',
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
