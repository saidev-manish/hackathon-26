import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
    Heart,
    AlertCircle,
    Plus,
} from 'lucide-react-native';
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { theme } from '../../styles/theme';
import { analyzeNutrientDeficiency } from '../../utils/insights';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOS_GUIDES = {
    sugar: {
        title: 'Sugar Craving SOS',
        points: [
            'Drink 1–2 glasses of water',
            'Honey in warm water (small quantity)',
            'Dark chocolate (70%+, 1–2 pieces)',
            'Nuts (almonds, peanuts)',
            'PMS phase → Magnesium-rich foods (banana, nuts, seeds)',
            'Ovulation phase → Balanced carbs (rice, roti, vegetables)',
        ],
    },
    stress: {
        title: 'Stress Attack SOS',
        points: [
            '60-Second Breathing Reset (Instant Calm)',
            '4–4–6 Method: Inhale 4 seconds, hold 4 seconds, exhale 6 seconds. Repeat 5 times.',
            'Quick Body Reset',
            'Roll shoulders 10 times',
            'Stretch neck gently',
            'Shake arms for 10 seconds',
            'Our Stress SOS gives instant emotional regulation tools aligned with menstrual cycle phases.',
        ],
    },
};

function toJsDate(value) {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value?.toDate === 'function') return value.toDate();
    if (typeof value === 'number') {
        const fromNumber = new Date(value);
        return Number.isNaN(fromNumber.getTime()) ? null : fromNumber;
    }
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
            const [year, month, day] = trimmed.split('-').map(Number);
            const isoDate = new Date(year, month - 1, day);
            return Number.isNaN(isoDate.getTime()) ? null : isoDate;
        }
        const parsed = new Date(trimmed);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
    return null;
}

export default function DashboardPCOSProfileScreen() {
    const { currentUser } = useAuth();
    const { t, language } = useLanguage();
    const router = useRouter();

    const [profile, setProfile] = useState({
        name: '',
        email: '',
        age: '',
    });
    const [sosVisible, setSosVisible] = useState(false);
    const [selectedSos, setSelectedSos] = useState(null);
    const [nutrientInsight, setNutrientInsight] = useState(null);
    const [periodHistory, setPeriodHistory] = useState([]);

    useEffect(() => {
        loadUserProfile();
        loadPeriodHistory();
    }, [currentUser]);

    const loadUserProfile = async () => {
        if (!currentUser?.uid) return;
        try {
            const userDocRef = doc(db, 'users', currentUser.uid);
            const userSnap = await getDoc(userDocRef);
            if (userSnap.exists()) {
                const data = userSnap.data();
                setProfile({
                    name: data.displayName || data.name || 'User',
                    email: currentUser.email || '',
                    age: data.age || '',
                });
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    };

    const loadPeriodHistory = async () => {
        if (!currentUser?.uid) return;
        try {
            const q = query(
                collection(db, 'periodHistory'),
                where('userId', '==', currentUser.uid),
                orderBy('startDate', 'desc'),
                limit(12)
            );
            const snap = await getDocs(q);
            const history = snap.docs.map(doc => doc.data());
            setPeriodHistory(history);

            // Analyze nutrient deficiency
            const analysis = analyzeNutrientDeficiency(history);
            setNutrientInsight(analysis);
        } catch (error) {
            console.error('Error loading period history:', error);
        }
    };

    const navigateToLogging = (type) => {
        router.push(`/logging/${type}`);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>{t('hello') || 'Hello'}, {profile.name}! 👋</Text>
                        <Text style={styles.subGreeting}>{t('pcosProfileSubtitle') || 'Your personalized health dashboard'}</Text>
                    </View>
                </View>

                {/* Main SOS Card - More Prominent */}
                <TouchableOpacity
                    style={styles.sosPrimary}
                    onPress={() => {
                        setSelectedSos(null);
                        setSosVisible(true);
                    }}
                >
                    <LinearGradient
                        colors={['#FF6B6B', '#FF8E8E']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.sosPrimaryGradient}
                    >
                        <View style={styles.sosPrimaryContent}>
                            <AlertCircle size={32} color="#FFF" />
                            <View style={styles.sosPrimaryText}>
                                <Text style={styles.sosPrimaryTitle}>Need Help?</Text>
                                <Text style={styles.sosPrimarySubtitle}>SOS Support Available</Text>
                            </View>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Nutrient Deficiency Warning Card */}
                {nutrientInsight?.hasDelayWarning && (
                    <View style={styles.nutrientWarningCard}>
                        <View style={styles.nutrientWarningHeader}>
                            <AlertCircle size={20} color="#FF9800" />
                            <Text style={styles.nutrientWarningTitle}>Period Delay Alert</Text>
                        </View>
                        <Text style={styles.nutrientWarningMessage}>{nutrientInsight.message}</Text>
                        <View style={styles.nutrientList}>
                            <Text style={styles.nutrientLabel}>Recommended Nutrients:</Text>
                            {nutrientInsight.recommendedNutrients.map((nutrient, index) => (
                                <Text key={index} style={styles.nutrientItem}>• {nutrient}</Text>
                            ))}
                        </View>
                    </View>
                )}

                {/* Quick Logging Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('quickLog') || 'Quick Log'}</Text>
                    <View style={styles.loggingGrid}>
                        <TouchableOpacity
                            style={styles.logCard}
                            onPress={() => navigateToLogging('symptoms')}
                        >
                            <Text style={styles.logIcon}>🩹</Text>
                            <Text style={styles.logLabel}>{t('symptoms') || 'Symptoms'}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.logCard}
                            onPress={() => navigateToLogging('mood')}
                        >
                            <Text style={styles.logIcon}>😊</Text>
                            <Text style={styles.logLabel}>{t('mood') || 'Mood'}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.logCard}
                            onPress={() => navigateToLogging('sleep')}
                        >
                            <Text style={styles.logIcon}>😴</Text>
                            <Text style={styles.logLabel}>{t('sleep') || 'Sleep'}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.logCard}
                            onPress={() => navigateToLogging('diet')}
                        >
                            <Text style={styles.logIcon}>🥗</Text>
                            <Text style={styles.logLabel}>{t('diet') || 'Diet'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Profile Health Tips */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('healthTips') || 'PCOS Tips'}</Text>
                    <View style={styles.tipsCard}>
                        <Heart size={20} color={theme.colors.primary} />
                        <Text style={styles.tipText}>
                            Consistent tracking helps identify patterns in your symptoms and energy levels.
                        </Text>
                    </View>
                </View>

                {/* Navigation Links */}
                <View style={styles.section}>
                    <TouchableOpacity
                        style={styles.linkButton}
                        onPress={() => router.push('/pcos-diet')}
                    >
                        <Text style={styles.linkButtonText}>{t('viewReports') || 'View Reports'} →</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.linkButton}
                        onPress={() => router.push('/ai-assistant')}
                    >
                        <Text style={styles.linkButtonText}>{t('askAssistant') || 'Ask AI Assistant'} →</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.linkButton}
                        onPress={() => router.push('/pcos-exercise')}
                    >
                        <Text style={styles.linkButtonText}>{t('exploreWellness') || 'Explore Wellness'} →</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* SOS Modal */}
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
                                    <Text style={styles.sosOptionTitle}>1) Sugar Craving</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.sosOption} onPress={() => setSelectedSos('stress')}>
                                    <Text style={styles.sosOptionTitle}>2) Stress Attack</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <ScrollView style={styles.sosGuideWrap} contentContainerStyle={styles.sosGuideContent}>
                                <Text style={styles.sosGuideTitle}>{SOS_GUIDES[selectedSos].title}</Text>
                                {SOS_GUIDES[selectedSos].points.map((point) => (
                                    <Text key={point} style={styles.sosGuidePoint}>• {point}</Text>
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
        padding: 20,
        paddingBottom: 36,
        gap: 24,
    },
    header: {
        gap: 8,
    },
    greeting: {
        fontSize: 28,
        fontWeight: '700',
        color: theme.colors.heading,
    },
    subGreeting: {
        fontSize: 14,
        color: theme.colors.body,
    },

    /* SOS Primary Card */
    sosPrimary: {
        borderRadius: 16,
        overflow: 'hidden',
        ...theme.shadows.soft,
    },
    sosPrimaryGradient: {
        padding: 20,
    },
    sosPrimaryContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    sosPrimaryText: {
        flex: 1,
    },
    sosPrimaryTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFF',
        marginBottom: 4,
    },
    sosPrimarySubtitle: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.85)',
    },

    /* Nutrient Warning Card */
    nutrientWarningCard: {
        backgroundColor: '#FFF3E0',
        borderRadius: 12,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#FF9800',
        gap: 10,
    },
    nutrientWarningHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    nutrientWarningTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#E65100',
    },
    nutrientWarningMessage: {
        fontSize: 13,
        color: '#BF360C',
        lineHeight: 18,
    },
    nutrientList: {
        gap: 6,
        marginTop: 4,
    },
    nutrientLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#E65100',
    },
    nutrientItem: {
        fontSize: 12,
        color: '#BF360C',
        lineHeight: 16,
    },

    /* Section */
    section: {
        gap: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.heading,
    },

    /* Logging Grid */
    loggingGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'space-between',
    },
    logCard: {
        width: '48%',
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
    },
    logIcon: {
        fontSize: 28,
    },
    logLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.heading,
        textAlign: 'center',
    },

    /* Tips Card */
    tipsCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
    },
    tipText: {
        flex: 1,
        fontSize: 13,
        color: theme.colors.body,
        lineHeight: 18,
    },

    /* Link Buttons */
    linkButton: {
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        alignItems: 'center',
        justifyContent: 'center',
    },
    linkButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.primary,
    },

    /* SOS Modal Styles */
    sosOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    sosModalCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: 20,
        padding: 24,
        width: '90%',
        maxHeight: '80%',
    },
    sosModalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.heading,
        marginBottom: 16,
        textAlign: 'center',
    },
    sosOptionWrap: {
        gap: 12,
        marginBottom: 16,
    },
    sosOption: {
        backgroundColor: theme.colors.background,
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
    },
    sosOptionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.heading,
    },
    sosGuideWrap: {
        maxHeight: 300,
        marginBottom: 16,
    },
    sosGuideContent: {
        gap: 12,
    },
    sosGuideTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.primary,
        marginBottom: 8,
    },
    sosGuidePoint: {
        fontSize: 13,
        color: theme.colors.body,
        lineHeight: 18,
    },
    sosBackBtn: {
        marginTop: 16,
        paddingVertical: 10,
        alignItems: 'center',
    },
    sosBackText: {
        fontSize: 13,
        color: theme.colors.primary,
        fontWeight: '600',
    },
    sosCloseBtn: {
        height: 44,
        borderRadius: 12,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sosCloseText: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.surface,
    },
});
