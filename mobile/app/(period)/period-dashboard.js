import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions, TouchableOpacity, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../styles/theme';
import { ChevronLeft, ChevronRight, Menu, X, Brain, Zap, Hand } from 'lucide-react-native';
import PeriodBottomNav from '../../components/PeriodBottomNav';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MAX_SELECTED_DATES = 5;
const DAY_MS = 24 * 60 * 60 * 1000;

function sortUniqueDays(days) {
    return [...new Set(days)].sort((a, b) => a - b);
}

function estimatePeriodLength(days) {
    if (!days.length) return 0;
    const sortedDays = sortUniqueDays(days);
    let contiguousFromStart = 1;
    for (let index = 1; index < sortedDays.length; index += 1) {
        if (sortedDays[index] === sortedDays[index - 1] + 1) {
            contiguousFromStart += 1;
        } else {
            break;
        }
    }
    const baseLength = contiguousFromStart >= 2 ? contiguousFromStart : sortedDays.length;
    return Math.min(7, Math.max(3, baseLength));
}

function getSafeCycleLength(year, januaryStartDay, februaryStartDay) {
    const januaryStartUtc = Date.UTC(year, 0, januaryStartDay);
    const februaryStartUtc = Date.UTC(year, 1, februaryStartDay);
    const rawCycleLength = Math.round((februaryStartUtc - januaryStartUtc) / DAY_MS);
    if (rawCycleLength < 21 || rawCycleLength > 35) {
        return 28;
    }
    const dampedCycleLength = 28 + Math.round((rawCycleLength - 28) * 0.5);
    return Math.max(27, Math.min(30, dampedCycleLength));
}

function getAutoSelectedRange(day, daysInMonth, rangeSize = MAX_SELECTED_DATES) {
    const safeStart = Math.max(1, Math.min(day, daysInMonth));
    const safeEnd = Math.min(daysInMonth, safeStart + rangeSize - 1);
    const selectedDays = [];
    for (let currentDay = safeStart; currentDay <= safeEnd; currentDay += 1) {
        selectedDays.push(currentDay);
    }
    return selectedDays;
}

function getMonthRows(year, monthIndex) {
    const firstDay = new Date(year, monthIndex, 1).getDay();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const cells = [];
    for (let index = 0; index < firstDay; index += 1) { cells.push(null); }
    for (let day = 1; day <= daysInMonth; day += 1) { cells.push(day); }
    while (cells.length % 7 !== 0) { cells.push(null); }
    const rows = [];
    for (let index = 0; index < cells.length; index += 7) {
        rows.push(cells.slice(index, index + 7));
    }
    return rows;
}

export default function PeriodDashboardScreen() {
    const { currentUser } = useAuth();
    const router = useRouter();
    const { width } = useWindowDimensions();
    const scrollRef = useRef(null);
    const [activeMonth, setActiveMonth] = useState(0);
    const [selectedPeriodDays, setSelectedPeriodDays] = useState({ 0: [], 1: [] });
    const [selectionWarning, setSelectionWarning] = useState('');
    const year = new Date().getFullYear();
    const [showMenu, setShowMenu] = useState(false);

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
            console.error('Failed to enforce period dashboard route', error);
        });
        return () => { active = false; };
    }, [currentUser?.uid, router]);

    const monthsData = useMemo(
        () => MONTHS.map((monthName, monthIndex) => ({
            monthName,
            rows: getMonthRows(year, monthIndex),
        })),
        [year]
    );

    const onScroll = (event) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const monthIndex = Math.round(offsetX / width);
        setActiveMonth(Math.max(0, Math.min(11, monthIndex)));
    };

    const goToMonth = (nextMonthIndex) => {
        const safeIndex = Math.max(0, Math.min(11, nextMonthIndex));
        setActiveMonth(safeIndex);
        scrollRef.current?.scrollTo({ x: safeIndex * width, animated: true });
    };

    const goPrevMonth = () => goToMonth(activeMonth - 1);
    const goNextMonth = () => goToMonth(activeMonth + 1);

    const prediction = useMemo(() => {
        const januaryDays = sortUniqueDays(selectedPeriodDays[0]);
        const februaryDays = sortUniqueDays(selectedPeriodDays[1]);

        if (!januaryDays.length || !februaryDays.length) {
            return { predictedByMonth: {}, hasPrediction: false };
        }

        const januaryStartDay = januaryDays[0];
        const februaryStartDay = februaryDays[0];
        const januaryPeriodLength = estimatePeriodLength(januaryDays);
        const februaryPeriodLength = estimatePeriodLength(februaryDays);
        const avgPeriodLength = Math.round((januaryPeriodLength + februaryPeriodLength) / 2);
        const cycleLengthDays = getSafeCycleLength(year, januaryStartDay, februaryStartDay);

        const predictedByMonth = {};
        for (let monthIndex = 2; monthIndex <= 11; monthIndex += 1) {
            predictedByMonth[monthIndex] = [];
        }

        const firstPredictedStartDate = new Date(year, 1, februaryStartDay);
        firstPredictedStartDate.setDate(firstPredictedStartDate.getDate() + cycleLengthDays);

        if (firstPredictedStartDate.getFullYear() !== year) {
            return { predictedByMonth, hasPrediction: false };
        }

        let cycleStartDate = new Date(firstPredictedStartDate);
        while (cycleStartDate.getFullYear() === year && cycleStartDate.getMonth() <= 11) {
            for (let index = 0; index < avgPeriodLength; index += 1) {
                const nextDate = new Date(cycleStartDate);
                nextDate.setDate(cycleStartDate.getDate() + index);
                const monthIndex = nextDate.getMonth();
                if (nextDate.getFullYear() === year && monthIndex >= 2 && monthIndex <= 11) {
                    predictedByMonth[monthIndex].push(nextDate.getDate());
                }
            }
            const nextCycleStart = new Date(cycleStartDate);
            nextCycleStart.setDate(nextCycleStart.getDate() + cycleLengthDays);
            cycleStartDate = nextCycleStart;
        }

        for (let monthIndex = 2; monthIndex <= 11; monthIndex += 1) {
            predictedByMonth[monthIndex] = [...new Set(predictedByMonth[monthIndex])].sort((a, b) => a - b);
        }

        const hasPrediction = Object.values(predictedByMonth).some((days) => days.length > 0);
        return { predictedByMonth, hasPrediction };
    }, [selectedPeriodDays, year]);

    const onDayPress = (monthIndex, day) => {
        if (!day) return;
        if (monthIndex !== 0 && monthIndex !== 1) return;
        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
        const autoSelectedDays = getAutoSelectedRange(day, daysInMonth, MAX_SELECTED_DATES);
        if (autoSelectedDays.length < MAX_SELECTED_DATES) {
            setSelectionWarning(`Only ${autoSelectedDays.length} day(s) are available from this date in ${MONTHS[monthIndex]}.`);
        } else {
            setSelectionWarning('');
        }
        setSelectedPeriodDays((prev) => ({ ...prev, [monthIndex]: autoSelectedDays }));
    };

    const GAMES = [
        { label: 'Memory Match', icon: Brain, route: '/games/memory-match', color: '#6366F1', bg: '#EDE9FE' },
        { label: 'Reflex Test',  icon: Zap,   route: '/games/reflex-test',  color: '#F59E0B', bg: '#FEF3C7' },
        { label: 'Tap Rush 10s', icon: Hand,  route: '/games/tap-rush',     color: '#10B981', bg: '#D1FAE5' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            {/* Hamburger drawer */}
            <Modal
                visible={showMenu}
                transparent
                animationType="fade"
                onRequestClose={() => setShowMenu(false)}
            >
                <Pressable style={styles.drawerBackdrop} onPress={() => setShowMenu(false)}>
                    <Pressable style={styles.drawer} onPress={() => {}}>
                        <View style={styles.drawerHeader}>
                            <Text style={styles.drawerTitle}>Menu</Text>
                            <TouchableOpacity onPress={() => setShowMenu(false)} hitSlop={10}>
                                <X size={22} color={theme.colors.heading} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.drawerSection}>Mini Games</Text>
                        {GAMES.map(({ label, icon: Icon, route, color, bg }) => (
                            <TouchableOpacity
                                key={route}
                                style={styles.drawerItem}
                                activeOpacity={0.8}
                                onPress={() => { setShowMenu(false); router.push(route); }}
                            >
                                <View style={[styles.gameIconBox, { backgroundColor: bg }]}>
                                    <Icon size={20} color={color} />
                                </View>
                                <Text style={styles.drawerItemLabel}>{label}</Text>
                                <ChevronRight size={16} color={theme.colors.muted} />
                            </TouchableOpacity>
                        ))}
                    </Pressable>
                </Pressable>
            </Modal>

            <View style={styles.content}>
                {/* Top bar */}
                <View style={styles.topBar}>
                    <TouchableOpacity style={styles.hamburger} onPress={() => setShowMenu(true)} activeOpacity={0.8}>
                        <Menu size={24} color={theme.colors.heading} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Period Calendar</Text>
                    <View style={styles.hamburgerPlaceholder} />
                </View>
                <Text style={styles.subtitle}>{monthsData[activeMonth].monthName} {year}</Text>
                <Text style={styles.hintText}>
                    Select all period dates in January and February. Predicted dates are highlighted from March to December.
                </Text>
                <Text style={styles.limitText}>
                    Maximum {MAX_SELECTED_DATES} dates can be selected per month.
                </Text>
                {selectionWarning ? <Text style={styles.warningText}>{selectionWarning}</Text> : null}
                {prediction.hasPrediction ? (
                    <Text style={styles.predictionText}>
                        Predicted period dates are highlighted for the upcoming months.
                    </Text>
                ) : null}

                <ScrollView
                    ref={scrollRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={onScroll}
                    scrollEventThrottle={16}
                    style={styles.pager}
                    contentContainerStyle={styles.pagerContent}
                >
                    {monthsData.map((month, monthIndex) => (
                        <View key={month.monthName} style={[styles.monthPage, { width }]}>
                            <View style={styles.calendarCard}>
                                <View style={styles.weekRow}>
                                    {WEEK_DAYS.map((day) => (
                                        <Text key={day} style={styles.weekDay}>{day}</Text>
                                    ))}
                                </View>
                                {month.rows.map((row, rowIndex) => (
                                    <View key={`${month.monthName}-row-${rowIndex}`} style={styles.daysRow}>
                                        {row.map((cell, cellIndex) => (
                                            <TouchableOpacity
                                                key={`${month.monthName}-cell-${rowIndex}-${cellIndex}`}
                                                style={styles.dayCell}
                                                activeOpacity={0.8}
                                                disabled={!cell || (monthIndex !== 0 && monthIndex !== 1)}
                                                onPress={() => onDayPress(monthIndex, cell)}
                                            >
                                                <View
                                                    style={[
                                                        styles.dayCircle,
                                                        selectedPeriodDays[monthIndex]?.includes(cell) && styles.dayCircleSelected,
                                                        monthIndex >= 2 && prediction.predictedByMonth[monthIndex]?.includes(cell) && styles.dayCirclePredicted,
                                                    ]}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.dayText,
                                                            selectedPeriodDays[monthIndex]?.includes(cell) && styles.dayTextSelected,
                                                            monthIndex >= 2 && prediction.predictedByMonth[monthIndex]?.includes(cell) && styles.dayTextPredicted,
                                                        ]}
                                                    >
                                                        {cell || ''}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                ))}
                            </View>
                        </View>
                    ))}
                </ScrollView>

                <View style={styles.arrowControls}>
                    <TouchableOpacity
                        style={[styles.arrowButton, activeMonth === 0 && styles.arrowButtonDisabled]}
                        onPress={goPrevMonth}
                        disabled={activeMonth === 0}
                        activeOpacity={0.8}
                    >
                        <ChevronLeft size={22} color={activeMonth === 0 ? theme.colors.muted : theme.colors.heading} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.arrowButton, activeMonth === 11 && styles.arrowButtonDisabled]}
                        onPress={goNextMonth}
                        disabled={activeMonth === 11}
                        activeOpacity={0.8}
                    >
                        <ChevronRight size={22} color={activeMonth === 11 ? theme.colors.muted : theme.colors.heading} />
                    </TouchableOpacity>
                </View>

                <PeriodBottomNav active="home" />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    content: { flex: 1, paddingTop: 8, paddingBottom: 86 },
    topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
    hamburger: { width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.inputBorder, alignItems: 'center', justifyContent: 'center', ...theme.shadows.soft },
    hamburgerPlaceholder: { width: 40 },
    title: { fontSize: 22, fontWeight: '700', color: theme.colors.heading, textAlign: 'center', flex: 1 },
    drawerBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', flexDirection: 'row' },
    drawer: { width: 270, height: '100%', backgroundColor: theme.colors.surface, paddingTop: 56, paddingHorizontal: 20, paddingBottom: 30, shadowColor: '#000', shadowOffset: { width: 2, height: 0 }, shadowOpacity: 0.18, shadowRadius: 12, elevation: 10 },
    drawerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    drawerTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.heading },
    drawerSection: { fontSize: 11, fontWeight: '700', color: theme.colors.muted, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 },
    drawerItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.inputBorder },
    gameIconBox: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    drawerItemLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: theme.colors.heading },
    subtitle: { fontSize: 18, fontWeight: '600', color: theme.colors.body, textAlign: 'center', marginTop: 8, marginBottom: 8 },
    hintText: { fontSize: 12, color: theme.colors.muted, textAlign: 'center', marginBottom: 4, paddingHorizontal: 20 },
    limitText: { fontSize: 12, color: theme.colors.body, textAlign: 'center', marginBottom: 6 },
    warningText: { fontSize: 12, color: theme.colors.accentPink, textAlign: 'center', marginBottom: 6, fontWeight: '700' },
    predictionText: { fontSize: 13, color: theme.colors.primary, textAlign: 'center', marginBottom: 10, fontWeight: '700' },
    pager: { flex: 1 },
    pagerContent: { alignItems: 'stretch' },
    monthPage: { paddingHorizontal: 16 },
    calendarCard: { backgroundColor: theme.colors.surface, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 10, borderWidth: 1, borderColor: theme.colors.inputBorder, ...theme.shadows.soft },
    weekRow: { flexDirection: 'row', marginBottom: 8 },
    weekDay: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '700', color: theme.colors.muted },
    daysRow: { flexDirection: 'row', marginBottom: 6 },
    dayCell: { flex: 1, height: 40, alignItems: 'center', justifyContent: 'center' },
    dayCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    dayCircleSelected: { backgroundColor: theme.colors.primary },
    dayCirclePredicted: { backgroundColor: theme.colors.accentPink },
    dayText: { fontSize: 15, color: theme.colors.heading, fontWeight: '600' },
    dayTextSelected: { color: theme.colors.surface, fontWeight: '700' },
    dayTextPredicted: { color: theme.colors.surface, fontWeight: '700' },
    arrowControls: { position: 'absolute', right: 16, bottom: 94, flexDirection: 'row', gap: 10 },
    arrowButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.inputBorder, ...theme.shadows.soft },
    arrowButtonDisabled: { opacity: 0.6 },
});
