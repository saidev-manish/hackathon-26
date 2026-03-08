import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Modal, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../styles/theme';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MessageSquare, Bluetooth } from 'lucide-react-native';

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

export default function PCOSDurationFivePlusScreen() {
    const router = useRouter();
    const { currentUser } = useAuth();
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
            console.error('Failed to enforce PCOS duration 5+ route', error);
        });

        return () => {
            active = false;
        };
    }, [currentUser?.uid, router]);

    const openPrivateChat = () => {
        router.push('/doctor-chat');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.headerRow}>
                    <Text style={styles.sectionTitle}>Ask an Expert</Text>
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={styles.wearableButton}
                            onPress={() => router.push('/pcos-wearable-devices')}
                            activeOpacity={0.85}
                        >
                            <Bluetooth size={18} color={theme.colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={0.8}>
                            <Text style={styles.viewAllText}>View All</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.card}>
                    <View style={styles.profileRow}>
                        <View style={styles.avatarCircle}>
                            <Text style={styles.avatarText}>AP</Text>
                        </View>

                        <View style={styles.profileInfo}>
                            <View style={styles.nameRow}>
                                <Text style={styles.nameText}>Dr. arthi  praveen</Text>
                                <View style={styles.onlineBadge}>
                                    <Text style={styles.onlineText}>ONLINE NOW</Text>
                                </View>
                            </View>
                            <Text style={styles.specialtyText}>Endocrinologist • PCOS Specialist</Text>
                        </View>
                    </View>

                    <Text style={styles.quoteText}>
                        "Managing PCOS is a journey. I’m here to help you navigate insulin resistance and cycle regularity."
                    </Text>

                    <View style={styles.statusDot} />

                    <TouchableOpacity style={styles.chatButton} onPress={openPrivateChat} activeOpacity={0.9}>
                        <MessageSquare size={20} color={theme.colors.heading} />
                        <Text style={styles.chatButtonText}>Start Private Chat</Text>
                    </TouchableOpacity>
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

                <View style={styles.moduleWrap}>
                    <Text style={styles.moduleTitle}>Supportive Lifestyle Guidance</Text>

                    <TouchableOpacity
                        style={styles.moduleCard}
                        activeOpacity={0.9}
                        onPress={() => router.push('/pcos-diet-5-plus')}
                    >
                        <Text style={styles.moduleCardTitle}>Hormone Support Diet</Text>
                        <Text style={styles.moduleCardSubtitle}>Foods to support insulin resistance and inflammation management.</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.moduleCard}
                        activeOpacity={0.9}
                        onPress={() => router.push('/pcos-exercise-5-plus')}
                    >
                        <Text style={styles.moduleCardTitle}>Gentle Exercise Suggestions</Text>
                        <Text style={styles.moduleCardSubtitle}>Walking, light yoga, stretching, and stress-friendly movement.</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.moduleCard}
                        activeOpacity={0.9}
                        onPress={() => router.push('/pcos-hydration-5-plus')}
                    >
                        <Text style={styles.moduleCardTitle}>Hydration Tracker</Text>
                        <Text style={styles.moduleCardSubtitle}>Daily 3.5-4 L guidance with 2-hour reminder concept.</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.moduleCard}
                        activeOpacity={0.9}
                        onPress={() => router.push('/pcos-weekly-food-5-plus')}
                    >
                        <Text style={styles.moduleCardTitle}>Weekly Food Entry & Report</Text>
                        <Text style={styles.moduleCardSubtitle}>Add weekly intake and view nutrient trends and health predictions.</Text>
                    </TouchableOpacity>

                    
                </View>
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
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
        gap: 14,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
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
    },
    sectionTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: theme.colors.heading,
    },
    viewAllText: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.primary,
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: 24,
        padding: 18,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        ...theme.shadows.soft,
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarCircle: {
        width: 78,
        height: 78,
        borderRadius: 39,
        backgroundColor: theme.colors.accentBlue,
        borderWidth: 3,
        borderColor: theme.colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.secondaryText,
    },
    profileInfo: {
        flex: 1,
        marginLeft: 12,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
    },
    nameText: {
        fontSize: 22,
        fontWeight: '700',
        color: theme.colors.heading,
    },
    onlineBadge: {
        backgroundColor: theme.colors.accentGreen,
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    onlineText: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.primary,
    },
    specialtyText: {
        marginTop: 6,
        fontSize: 16,
        color: theme.colors.body,
    },
    quoteText: {
        marginTop: 16,
        fontSize: 15,
        lineHeight: 24,
        color: theme.colors.body,
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginTop: 14,
        marginBottom: 16,
        backgroundColor: theme.colors.primary,
        opacity: 0.85,
    },
    chatButton: {
        height: 56,
        borderRadius: 16,
        backgroundColor: theme.colors.accentBlue,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    chatButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.heading,
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
    moduleWrap: {
        gap: 10,
        marginTop: 4,
    },
    moduleTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: theme.colors.heading,
    },
    moduleCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        paddingHorizontal: 14,
        paddingVertical: 12,
        ...theme.shadows.soft,
    },
    moduleCardTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: theme.colors.heading,
    },
    moduleCardSubtitle: {
        marginTop: 3,
        fontSize: 13,
        color: theme.colors.body,
        lineHeight: 19,
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
