import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BedDouble, ChevronLeft, Settings2, TrendingUp } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../styles/theme';
import PeriodBottomNav from '../../components/PeriodBottomNav';

const MOODS = ['', '', '', '', ''];

const WEEK_DATA = [
    { key: 'Mon', hours: 6.1 },
    { key: 'Tue', hours: 6.8 },
    { key: 'Wed', hours: 7.3 },
    { key: 'Thu', hours: 6.5 },
    { key: 'Fri', hours: 0 },
    { key: 'Sat', hours: 5.9 },
    { key: 'Sun', hours: 7.8 },
];

export default function PeriodSleepScreen() {
    const { currentUser } = useAuth();
    const router = useRouter();

    const [selectedMood, setSelectedMood] = useState(2);
    const [smartAlarmOn, setSmartAlarmOn] = useState(true);

    useEffect(() => {
        let active = true;
        const enforcePeriodRoute = async () => {
            if (!currentUser?.uid) return;
            const careType = await AsyncStorage.getItem(`careType:${currentUser.uid}`);
            if (!active) return;
            if (careType === 'pcos') {
                router.replace('/pcos-empty');
                return;
            }
            if (careType !== 'period') {
                router.replace('/care-type');
            }
        };
        enforcePeriodRoute().catch((error) => {
            console.error('Failed to enforce period sleep route', error);
        });
        return () => { active = false; };
    }, [currentUser?.uid, router]);

    const totalSleepLabel = '7h 20m';
    const bedtimeLabel = '10:30 PM';
    const wakeLabel = '05:50 AM';

    const avgHours = useMemo(() => {
        const validDays = WEEK_DATA.filter((item) => item.hours > 0);
        if (!validDays.length) return '0h 00m';
        const total = validDays.reduce((sum, item) => sum + item.hours, 0);
        const avg = total / validDays.length;
        const hours = Math.floor(avg);
        const minutes = Math.round((avg - hours) * 60);
        return `${hours}h ${String(minutes).padStart(2, '0')}m`;
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.screenBody}>
                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.headerRow}>
                        <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.85} onPress={() => router.back()}>
                            <ChevronLeft size={22} color={theme.colors.primary} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Sleep Tracking</Text>
                        <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.85} onPress={() => router.push('/period-settings')}>
                            <Settings2 size={20} color={theme.colors.primary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.sleepCard}>
                        <View style={styles.ringWrap}>
                            <View style={styles.ringOuter}>
                                <View style={styles.ringInner}>
                                    <Text style={styles.totalSleep}>{totalSleepLabel}</Text>
                                    <Text style={styles.totalSleepSub}>Total Sleep</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.timeRow}>
                            <View style={styles.timeCell}>
                                <Text style={styles.timeLabel}>BEDTIME</Text>
                                <Text style={styles.timeValue}>{bedtimeLabel}</Text>
                            </View>
                            <View style={styles.timeDivider} />
                            <View style={styles.timeCell}>
                                <Text style={styles.timeLabel}>WAKE UP</Text>
                                <Text style={styles.timeValue}>{wakeLabel}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>How did you feel?</Text>
                        <Text style={styles.sectionAction}>Great</Text>
                    </View>

                    <View style={styles.moodCard}>
                        {MOODS.map((mood, index) => {
                            const activeMood = index === selectedMood;
                            return (
                                <TouchableOpacity
                                    key={`${mood}-${index}`}
                                    style={[styles.moodBtn, activeMood && styles.moodBtnActive]}
                                    onPress={() => setSelectedMood(index)}
                                    activeOpacity={0.85}
                                >
                                    <Text style={styles.moodText}>{mood}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <View style={styles.trendCard}>
                        <View style={styles.trendTopRow}>
                            <View>
                                <Text style={styles.trendTitle}>Weekly Trend</Text>
                                <Text style={styles.trendSub}>Avg. {avgHours}</Text>
                            </View>
                            <TrendingUp size={22} color={theme.colors.primaryLight} />
                        </View>
                        <View style={styles.chartRow}>
                            {WEEK_DATA.map((item) => (
                                <View key={item.key} style={styles.chartCol}>
                                    <View style={styles.barTrack}>
                                        {item.hours > 0 ? (
                                            <View style={[styles.barFill, { height: `${Math.max(20, Math.min(100, (item.hours / 8) * 100))}%` }]} />
                                        ) : null}
                                    </View>
                                    <Text style={styles.barLabel}>{item.key}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={styles.alarmCard}>
                        <View style={styles.alarmIconBox}>
                            <BedDouble size={20} color={theme.colors.primary} />
                        </View>
                        <View style={styles.alarmInfo}>
                            <Text style={styles.alarmTitle}>Smart Alarm</Text>
                            <Text style={styles.alarmSub}>Wake up window: 5:45 - 6:00 AM</Text>
                        </View>
                        <Switch
                            value={smartAlarmOn}
                            onValueChange={setSmartAlarmOn}
                            trackColor={{ false: theme.colors.secondary, true: theme.colors.primaryLight }}
                            thumbColor={smartAlarmOn ? theme.colors.primary : theme.colors.surface}
                        />
                    </View>
                </ScrollView>
                <PeriodBottomNav active="sleep" />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    screenBody: { flex: 1 },
    content: { padding: 20, paddingBottom: 110, gap: 16 },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
    headerIconBtn: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.inputBorder },
    headerTitle: { fontSize: 38, fontWeight: '700', color: theme.colors.heading },
    sleepCard: { borderRadius: 24, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.inputBorder, padding: 20, ...theme.shadows.soft },
    ringWrap: { alignItems: 'center', marginTop: 6, marginBottom: 16 },
    ringOuter: { width: 210, height: 210, borderRadius: 105, borderWidth: 16, borderColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surface },
    ringInner: { width: 160, height: 160, borderRadius: 80, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.card },
    totalSleep: { fontSize: 42, fontWeight: '800', color: theme.colors.heading },
    totalSleepSub: { marginTop: 4, fontSize: 15, color: theme.colors.body },
    timeRow: { flexDirection: 'row', alignItems: 'center' },
    timeCell: { flex: 1, alignItems: 'center' },
    timeLabel: { fontSize: 12, fontWeight: '700', color: theme.colors.muted, letterSpacing: 1 },
    timeValue: { marginTop: 6, fontSize: 22, fontWeight: '800', color: theme.colors.heading },
    timeDivider: { width: 1, height: 54, backgroundColor: theme.colors.inputBorder },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
    sectionTitle: { fontSize: 36, fontWeight: '700', color: theme.colors.heading },
    sectionAction: { fontSize: 28, fontWeight: '700', color: theme.colors.primary },
    moodCard: { flexDirection: 'row', justifyContent: 'space-between', borderRadius: 20, borderWidth: 1, borderColor: theme.colors.inputBorder, backgroundColor: theme.colors.card, padding: 10 },
    moodBtn: { width: 66, height: 66, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    moodBtnActive: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.inputBorder, ...theme.shadows.soft },
    moodText: { fontSize: 30 },
    trendCard: { borderRadius: 24, padding: 18, backgroundColor: theme.colors.heading, ...theme.shadows.soft },
    trendTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    trendTitle: { fontSize: 34, fontWeight: '800', color: theme.colors.surface },
    trendSub: { marginTop: 4, fontSize: 16, color: theme.colors.primaryLight },
    chartRow: { marginTop: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    chartCol: { alignItems: 'center', width: 42 },
    barTrack: { width: 32, height: 128, borderRadius: 16, backgroundColor: theme.colors.surface, justifyContent: 'flex-end', overflow: 'hidden', opacity: 0.2 },
    barFill: { width: '100%', borderRadius: 16, backgroundColor: theme.colors.primary, opacity: 1 },
    barLabel: { marginTop: 8, fontSize: 14, color: theme.colors.surface, fontWeight: '600' },
    alarmCard: { borderRadius: 20, borderWidth: 1, borderColor: theme.colors.inputBorder, backgroundColor: theme.colors.surface, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8, ...theme.shadows.soft },
    alarmIconBox: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.card },
    alarmInfo: { flex: 1 },
    alarmTitle: { fontSize: 17, fontWeight: '700', color: theme.colors.heading },
    alarmSub: { marginTop: 2, fontSize: 13, color: theme.colors.body },
});
