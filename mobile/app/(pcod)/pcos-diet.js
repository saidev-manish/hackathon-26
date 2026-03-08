import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Plus, Download } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../styles/theme';
import PcosBottomNav from '../../components/PcosBottomNav';
import { estimateMacros, getPlanWeeklyMacros } from '../../utils/nutritionDb';

// â”€â”€â”€ constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const PLAN_MEALS = [
    { day: 'Monday', breakfast: 'Oats with milk, 1 apple, 5 almonds', lunch: 'Brown rice, dal, spinach curry, cucumber salad', dinner: '2 rotis, mixed vegetable curry, small bowl yogurt' },
    { day: 'Tuesday', breakfast: 'Vegetable upma + 1 boiled egg (or sprouts)', lunch: 'Millet roti, chickpea curry, carrot-cucumber salad', dinner: 'Vegetable soup, paneer stir-fry with vegetables' },
    { day: 'Wednesday', breakfast: 'Banana-spinach-milk-chia smoothie', lunch: 'Quinoa or brown rice + grilled chicken or tofu + broccoli/beans', dinner: '2 wheat rotis, lentil curry, tomato salad' },
    { day: 'Thursday', breakfast: 'Ragi porridge with banana and walnut', lunch: 'Brown rice, rajma curry, sautÃ©ed greens, salad', dinner: '2 multigrain rotis, mixed vegetable sabzi, curd' },
    { day: 'Friday', breakfast: 'Besan chilla (2) with mint chutney + green tea', lunch: 'Quinoa pulao with mixed vegetables + raita', dinner: 'Grilled fish or tofu + stir-fried vegetables + soup' },
    { day: 'Saturday', breakfast: 'Oats idli (3â€“4) with sambar + coconut chutney', lunch: 'Millet khichdi with ghee + cucumber raita', dinner: '2 rotis, dal tadka, steamed broccoli' },
    { day: 'Sunday', breakfast: 'Vegetable poha with peanuts + 1 fruit', lunch: 'Brown rice, mixed dal, palak sabzi, salad', dinner: 'Paneer tikka (baked) + roti + vegetable soup' },
];

// Weekly targets (grams)
const WEEKLY_TARGET = { carbs: 1750, protein: 490, fat: 350 };

// â”€â”€â”€ helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function dateKey(offsetDays = 0) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

// Get keys for Monâ€“Sun of the current ISO week
function thisWeekKeys() {
    const now = new Date();
    const day = now.getDay(); // 0=Sun
    const mondayOffset = day === 0 ? -6 : 1 - day;
    return Array.from({ length: 7 }, (_, i) => dateKey(mondayOffset + i));
}

// â”€â”€â”€ component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function PcosDietScreen() {
    const { currentUser } = useAuth();
    const router = useRouter();
    const [showFoodModal, setShowFoodModal] = useState(false);
    const [foodInput, setFoodInput] = useState('');
    const [dietLogs, setDietLogs] = useState([]);      // today's logs
    const [weekLogs, setWeekLogs] = useState({});       // { dateKey: [...log] }
    const [exporting, setExporting] = useState(false);

    const todayKey = useMemo(() => dateKey(), []);
    const weekKeys = useMemo(() => thisWeekKeys(), []);

    const storageKey = useCallback(
        (dk) => currentUser?.uid ? `pcosDietLogs:${currentUser.uid}:${dk}` : null,
        [currentUser?.uid]
    );

    // â”€â”€ route guard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    useEffect(() => {
        let active = true;
        const enforce = async () => {
            if (!currentUser?.uid) return;
            const careType = await AsyncStorage.getItem(`careType:${currentUser.uid}`);
            if (!active) return;
            if (careType === 'period') { router.replace('/period-dashboard'); return; }
            if (careType !== 'pcos') { router.replace('/care-type'); }
        };
        enforce().catch((e) => console.error('PCOS diet guard', e));
        return () => { active = false; };
    }, [currentUser?.uid, router]);

    // â”€â”€ load today's logs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    useEffect(() => {
        let active = true;
        const load = async () => {
            const sk = storageKey(todayKey);
            if (!sk) return;
            try {
                const saved = await AsyncStorage.getItem(sk);
                if (!active || !saved) return;
                const parsed = JSON.parse(saved);
                setDietLogs(Array.isArray(parsed) ? parsed : []);
            } catch (e) { console.error('load today logs', e); }
        };
        load();
        return () => { active = false; };
    }, [storageKey, todayKey]);

    // â”€â”€ load week's logs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    useEffect(() => {
        let active = true;
        const loadWeek = async () => {
            const result = {};
            await Promise.all(
                weekKeys.map(async (dk) => {
                    const sk = storageKey(dk);
                    if (!sk) return;
                    try {
                        const saved = await AsyncStorage.getItem(sk);
                        result[dk] = saved ? JSON.parse(saved) : [];
                    } catch { result[dk] = []; }
                })
            );
            if (active) setWeekLogs(result);
        };
        loadWeek();
        return () => { active = false; };
    }, [storageKey, weekKeys]);

    // â”€â”€ save today â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const saveTodayLogs = useCallback(async (nextLogs) => {
        const sk = storageKey(todayKey);
        if (!sk) return;
        try { await AsyncStorage.setItem(sk, JSON.stringify(nextLogs)); }
        catch (e) { console.error('save logs', e); }
    }, [storageKey, todayKey]);

    // â”€â”€ add food entry â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const handleAddFood = useCallback(() => {
        const meal = foodInput.trim();
        if (!meal) { Alert.alert('Add meal', 'Please enter what you ate.'); return; }
        const now = new Date();
        const entry = {
            id: `${now.getTime()}`,
            meal,
            time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            ...estimateMacros(meal),
        };
        setDietLogs((prev) => {
            const next = [entry, ...prev].slice(0, 30);
            saveTodayLogs(next);
            setWeekLogs((w) => ({ ...w, [todayKey]: next }));
            return next;
        });
        setFoodInput('');
        setShowFoodModal(false);
    }, [foodInput, saveTodayLogs, todayKey]);

    // â”€â”€ compute weekly macros (plan + user logs) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const weeklyMacros = useMemo(() => {
        const planMacros = getPlanWeeklyMacros(); // [{day, carbs, protein, fat}]
        return DAYS.map((day, i) => {
            const dk = weekKeys[i];
            const userLogs = weekLogs[dk] || [];
            const userCarbs = userLogs.reduce((s, l) => s + (l.carbs || 0), 0);
            const userProtein = userLogs.reduce((s, l) => s + (l.protein || 0), 0);
            const userFat = userLogs.reduce((s, l) => s + (l.fat || 0), 0);
            const plan = planMacros[i] || { carbs: 0, protein: 0, fat: 0 };
            return {
                day,
                dateKey: dk,
                carbs: plan.carbs + userCarbs,
                protein: plan.protein + userProtein,
                fat: plan.fat + userFat,
                userLogged: userLogs.length,
            };
        });
    }, [weekKeys, weekLogs]);

    const weeklyTotals = useMemo(() => weeklyMacros.reduce(
        (acc, d) => ({ carbs: acc.carbs + d.carbs, protein: acc.protein + d.protein, fat: acc.fat + d.fat }),
        { carbs: 0, protein: 0, fat: 0 }
    ), [weeklyMacros]);

    // â”€â”€ Excel export â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const exportExcel = useCallback(async () => {
        setExporting(true);
        try {
            const wb = XLSX.utils.book_new();

            // Sheet 1 - Weekly Macro Summary
            const summaryData = [
                ['Day', 'Carbohydrates (g)', 'Protein (g)', 'Fat (g)', 'User Logs Count'],
                ...weeklyMacros.map((d) => [d.day, d.carbs, d.protein, d.fat, d.userLogged]),
                [],
                ['WEEKLY TOTAL', weeklyTotals.carbs, weeklyTotals.protein, weeklyTotals.fat, ''],
                ['WEEKLY TARGET', WEEKLY_TARGET.carbs, WEEKLY_TARGET.protein, WEEKLY_TARGET.fat, ''],
            ];
            const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
            ws1['!cols'] = [{ wch: 14 }, { wch: 22 }, { wch: 14 }, { wch: 10 }, { wch: 18 }];
            XLSX.utils.book_append_sheet(wb, ws1, 'Weekly Macros');

            // Sheet 2 - Plan Meals
            const planData = [
                ['Day', 'Breakfast', 'Lunch', 'Dinner'],
                ...PLAN_MEALS.map((m) => [m.day, m.breakfast, m.lunch, m.dinner]),
            ];
            const ws2 = XLSX.utils.aoa_to_sheet(planData);
            ws2['!cols'] = [{ wch: 12 }, { wch: 40 }, { wch: 40 }, { wch: 38 }];
            XLSX.utils.book_append_sheet(wb, ws2, 'Diet Plan');

            // Sheet 3 - User Food Logs (this week)
            const logRows = [['Day', 'Date', 'Food Entry', 'Time', 'Est. Carbs (g)', 'Est. Protein (g)', 'Est. Fat (g)']];
            DAYS.forEach((day, i) => {
                const dk = weekKeys[i];
                const logs = weekLogs[dk] || [];
                logs.forEach((l) => logRows.push([day, dk, l.meal, l.time, l.carbs || 0, l.protein || 0, l.fat || 0]));
            });
            const ws3 = XLSX.utils.aoa_to_sheet(logRows);
            ws3['!cols'] = [{ wch: 12 }, { wch: 12 }, { wch: 36 }, { wch: 10 }, { wch: 16 }, { wch: 16 }, { wch: 14 }];
            XLSX.utils.book_append_sheet(wb, ws3, 'Food Logs');

            // Convert workbook array to base64 manually (reliable in React Native)
            const rawArray = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
            const bytes = new Uint8Array(rawArray);
            let binary = '';
            for (let i = 0; i < bytes.byteLength; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            const base64 = btoa(binary);

            // Write file to cache
            const fileUri = `${FileSystem.cacheDirectory}pcos_diet_report_${todayKey}.xlsx`;
            await FileSystem.writeAsStringAsync(fileUri, base64, {
                encoding: FileSystem.EncodingType.Base64,
            });

            // Open share/save sheet
            const canShare = await Sharing.isAvailableAsync();
            if (canShare) {
                await Sharing.shareAsync(fileUri, {
                    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    dialogTitle: 'Save PCOS Diet Report',
                    UTI: 'com.microsoft.excel.xlsx',
                });
            }

            // Success popup
            Alert.alert(
                'Report Downloaded!',
                `Your PCOS Diet Report has been saved successfully.\n\nFile: pcos_diet_report_${todayKey}.xlsx`,
                [{ text: 'Great!', style: 'default' }]
            );
        } catch (e) {
            console.error('Excel export failed', e);
            Alert.alert('Export Failed', `Could not generate the report.\n\nError: ${e.message}`);
        } finally {
            setExporting(false);
        }
    }, [weeklyMacros, weeklyTotals, weekLogs, weekKeys, todayKey]);

    // â”€â”€ progress bar helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const MacroBar = useCallback(({ label, value, target, color }) => {
        const pct = Math.min(1, value / target);
        return (
            <View style={styles.macroBarWrap}>
                <View style={styles.macroBarHeader}>
                    <Text style={styles.macroBarLabel}>{label}</Text>
                    <Text style={styles.macroBarValue}>{value}g <Text style={styles.macroBarTarget}>/ {target}g</Text></Text>
                </View>
                <View style={styles.macroTrack}>
                    <View style={[styles.macroFill, { width: `${Math.round(pct * 100)}%`, backgroundColor: color }]} />
                </View>
            </View>
        );
    }, []);

    // â”€â”€â”€ render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.screenBody}>
                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={styles.title}>PCOS Diet Plan</Text>
                    <Text style={styles.subtitle}>1-week meal guidance for 2-3 months period delay</Text>

                    {/* â”€â”€ Weekly Macro Progress â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                    <View style={styles.card}>
                        <View style={styles.reportHeader}>
                            <Text style={styles.cardTitle}>Weekly Nutrition Report</Text>
                            <TouchableOpacity
                                style={[styles.exportBtn, exporting && styles.exportBtnDisabled]}
                                onPress={exportExcel}
                                disabled={exporting}
                            >
                                <Download size={15} color={theme.colors.surface} />
                                <Text style={styles.exportBtnText}>{exporting ? 'Generating...' : 'Excel'}</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.reportNote}>Plan macros + your food logs combined</Text>

                        <MacroBar label="Carbohydrates" value={weeklyTotals.carbs} target={WEEKLY_TARGET.carbs} color="#6366F1" />
                        <MacroBar label="Protein" value={weeklyTotals.protein} target={WEEKLY_TARGET.protein} color="#10B981" />
                        <MacroBar label="Fat" value={weeklyTotals.fat} target={WEEKLY_TARGET.fat} color="#F59E0B" />
                    </View>

                    {/* â”€â”€ Per-Day Breakdown â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                    <Text style={styles.sectionLabel}>Daily Breakdown (this week)</Text>
                    {weeklyMacros.map((d) => (
                        <View key={d.day} style={styles.dayCard}>
                            <View style={styles.dayCardHeader}>
                                <Text style={styles.dayCardDay}>{d.day}</Text>
                                <Text style={styles.dayCardLogged}>{d.userLogged} logged</Text>
                            </View>
                            <View style={styles.macroPills}>
                                <View style={[styles.pill, { backgroundColor: '#EDE9FE' }]}>
                                    <Text style={styles.pillLabel}>Carbs</Text>
                                    <Text style={[styles.pillValue, { color: '#6366F1' }]}>{d.carbs}g</Text>
                                </View>
                                <View style={[styles.pill, { backgroundColor: '#D1FAE5' }]}>
                                    <Text style={styles.pillLabel}>Protein</Text>
                                    <Text style={[styles.pillValue, { color: '#10B981' }]}>{d.protein}g</Text>
                                </View>
                                <View style={[styles.pill, { backgroundColor: '#FEF3C7' }]}>
                                    <Text style={styles.pillLabel}>Fat</Text>
                                    <Text style={[styles.pillValue, { color: '#F59E0B' }]}>{d.fat}g</Text>
                                </View>
                            </View>
                        </View>
                    ))}

                    {/* â”€â”€ Meal Plan â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                    <Text style={styles.sectionLabel}>7-Day Meal Plan</Text>
                    {PLAN_MEALS.map(({ day, breakfast, lunch, dinner }) => (
                        <View key={day} style={styles.card}>
                            <Text style={styles.cardTitle}>{day}</Text>
                            <Text style={styles.cardText}>Breakfast: {breakfast}</Text>
                            <Text style={styles.cardText}>Lunch: {lunch}</Text>
                            <Text style={styles.cardText}>Dinner: {dinner}</Text>
                        </View>
                    ))}

                    {/* â”€â”€ Today's Food Logs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Today's Food Logs</Text>
                        {dietLogs.length === 0 ? (
                            <Text style={styles.cardText}>No meals logged yet. Tap + to add what you ate.</Text>
                        ) : (
                            dietLogs.map((log) => (
                                <View key={log.id} style={styles.logRow}>
                                    <View style={styles.logMain}>
                                        <Text style={styles.logMeal}>{log.meal}</Text>
                                        <Text style={styles.logMacros}>C {log.carbs || 0}g  P {log.protein || 0}g  F {log.fat || 0}g</Text>
                                    </View>
                                    <Text style={styles.logTime}>{log.time}</Text>
                                </View>
                            ))
                        )}
                    </View>
                </ScrollView>

                <TouchableOpacity style={styles.fab} activeOpacity={0.9} onPress={() => setShowFoodModal(true)}>
                    <Plus size={24} color={theme.colors.surface} />
                </TouchableOpacity>

                <PcosBottomNav active="diet" />

                <Modal visible={showFoodModal} transparent animationType="fade" onRequestClose={() => setShowFoodModal(false)}>
                    <View style={styles.modalBackdrop}>
                        <View style={styles.modalCard}>
                            <Text style={styles.modalTitle}>What did you eat?</Text>
                            <Text style={styles.modalHint}>Macros (carbs/protein/fat) will be estimated automatically.</Text>
                            <TextInput
                                value={foodInput}
                                onChangeText={setFoodInput}
                                placeholder="Example: Oats + almonds + apple"
                                placeholderTextColor={theme.colors.muted}
                                style={styles.modalInput}
                                multiline
                            />
                            <View style={styles.modalActions}>
                                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowFoodModal(false)}>
                                    <Text style={styles.cancelText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.saveBtn} onPress={handleAddFood}>
                                    <Text style={styles.saveText}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    screenBody: { flex: 1 },
    content: { paddingTop: 20, paddingHorizontal: 20, paddingBottom: 100, gap: 12 },
    title: { fontSize: 26, fontWeight: '700', color: theme.colors.heading, textAlign: 'center' },
    subtitle: { marginTop: 2, fontSize: 13, color: theme.colors.body, textAlign: 'center' },
    sectionLabel: { fontSize: 16, fontWeight: '700', color: theme.colors.heading, marginTop: 4 },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        ...theme.shadows.soft,
    },
    reportHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
    exportBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: theme.colors.primary,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 7,
    },
    exportBtnDisabled: { opacity: 0.6 },
    exportBtnText: { color: theme.colors.surface, fontSize: 13, fontWeight: '700' },
    reportNote: { fontSize: 11, color: theme.colors.muted, marginBottom: 12 },
    macroBarWrap: { marginBottom: 10 },
    macroBarHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    macroBarLabel: { fontSize: 13, fontWeight: '600', color: theme.colors.heading },
    macroBarValue: { fontSize: 13, fontWeight: '700', color: theme.colors.heading },
    macroBarTarget: { fontWeight: '400', color: theme.colors.muted },
    macroTrack: { height: 10, borderRadius: 99, backgroundColor: theme.colors.inputBorder, overflow: 'hidden' },
    macroFill: { height: '100%', borderRadius: 99 },
    dayCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: 14,
        padding: 12,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        ...theme.shadows.soft,
    },
    dayCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    dayCardDay: { fontSize: 14, fontWeight: '700', color: theme.colors.heading },
    dayCardLogged: { fontSize: 11, color: theme.colors.muted },
    macroPills: { flexDirection: 'row', gap: 8 },
    pill: { flex: 1, borderRadius: 10, paddingVertical: 6, alignItems: 'center' },
    pillLabel: { fontSize: 10, color: theme.colors.body },
    pillValue: { fontSize: 14, fontWeight: '700', marginTop: 2 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.heading, marginBottom: 8 },
    cardText: { fontSize: 13, color: theme.colors.body, lineHeight: 20, marginBottom: 4 },
    logRow: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: theme.colors.inputBorder,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 8,
    },
    logMain: { flex: 1 },
    logMeal: { color: theme.colors.heading, fontSize: 13, fontWeight: '600' },
    logMacros: { marginTop: 2, color: theme.colors.muted, fontSize: 11 },
    logTime: { color: theme.colors.muted, fontSize: 12, fontWeight: '600', marginTop: 2 },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 92,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...theme.shadows.soft,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.32)',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    modalCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        padding: 16,
        ...theme.shadows.soft,
    },
    modalTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.heading, marginBottom: 4 },
    modalHint: { fontSize: 12, color: theme.colors.muted, marginBottom: 10 },
    modalInput: {
        minHeight: 86,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: theme.colors.heading,
        fontSize: 14,
        textAlignVertical: 'top',
        backgroundColor: theme.colors.card,
    },
    modalActions: { marginTop: 12, flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
    cancelBtn: {
        minWidth: 82, minHeight: 42, borderRadius: 12,
        borderWidth: 1, borderColor: theme.colors.inputBorder,
        alignItems: 'center', justifyContent: 'center',
    },
    saveBtn: {
        minWidth: 82, minHeight: 42, borderRadius: 12,
        backgroundColor: theme.colors.primary,
        alignItems: 'center', justifyContent: 'center',
    },
    cancelText: { color: theme.colors.body, fontSize: 14, fontWeight: '600' },
    saveText: { color: theme.colors.surface, fontSize: 14, fontWeight: '700' },
});

