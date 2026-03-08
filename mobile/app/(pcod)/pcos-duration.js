import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { theme } from '../../styles/theme';

const DURATION_OPTIONS = [
    { id: '2-3_months', label: '2-3 months' },
    { id: '4-5_months', label: '4-5 months' },
    { id: '5_plus_months', label: '5 months above' },
];

export default function PCOSDurationScreen() {
    const router = useRouter();
    const { currentUser } = useAuth();
    const { t } = useLanguage();

    const [error, setError] = useState('');

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

        enforcePcosRoute().catch((routeError) => {
            console.error('Failed to enforce PCOS duration route', routeError);
        });

        return () => {
            active = false;
        };
    }, [currentUser?.uid, router]);

    const saveDurationSelection = async (selectedDuration) => {
        try {
            setError('');

            if (currentUser?.uid) {
                const durationKey = `pcosDuration:${currentUser.uid}`;
                await AsyncStorage.setItem(durationKey, selectedDuration);

                setDoc(
                    doc(db, 'users', currentUser.uid),
                    {
                        pcosDuration: selectedDuration,
                        pcosDurationSelectedAt: serverTimestamp(),
                    },
                    { merge: true }
                ).catch((err) => console.error('Background duration sync error:', err));
            }
        } catch (err) {
            console.error('Failed to save duration option:', err);
            setError('Failed to save selection');
        }
    };

    const handleOptionPress = async (optionId) => {
        await saveDurationSelection(optionId);

        if (optionId === '2-3_months') {
            router.replace('/pcos-duration-2-3');
            return;
        }

        if (optionId === '4-5_months') {
            router.replace('/pcos-duration-4-5');
            return;
        }

        router.replace('/pcos-duration-5-plus');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.headerSection}>
                    <Text style={styles.title}>{t('pcosCare') || 'PCOS/PCOD Care'}</Text>
                    <Text style={styles.subtitle}>Select how long you have been experiencing this</Text>
                </View>

                <View style={styles.optionsContainer}>
                    {DURATION_OPTIONS.map((option, index) => {
                        return (
                            <TouchableOpacity
                                key={option.id}
                                style={styles.optionCard}
                                activeOpacity={0.85}
                                onPress={() => handleOptionPress(option.id)}
                            >
                                <Text style={styles.optionNumber}>Option {index + 1}</Text>
                                <Text style={styles.optionLabel}>
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>
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
        paddingVertical: 24,
    },
    headerSection: {
        marginTop: 12,
        marginBottom: 28,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: theme.colors.heading,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 17,
        color: theme.colors.body,
        lineHeight: 24,
    },
    optionsContainer: {
        gap: 14,
        marginTop: 8,
    },
    optionCard: {
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        borderWidth: 2,
        borderColor: theme.colors.inputBorder,
        paddingVertical: 28,
        paddingHorizontal: 20,
        minHeight: 120,
        justifyContent: 'center',
        ...theme.shadows.soft,
    },
    optionCardActive: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.primaryLight,
    },
    optionNumber: {
        fontSize: 14,
        color: theme.colors.muted,
        marginBottom: 10,
        fontWeight: '600',
    },
    optionLabel: {
        fontSize: 24,
        color: theme.colors.heading,
        fontWeight: '700',
    },
    optionLabelActive: {
        color: theme.colors.primary,
    },
    errorText: {
        marginTop: 16,
        fontSize: 13,
        color: theme.colors.accentPink,
        fontWeight: '600',
    },
});
