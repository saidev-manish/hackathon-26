import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { theme } from '../styles/theme';
import { Heart, Activity } from 'lucide-react-native';

export default function CareTypeScreen() {
    const router = useRouter();
    const { currentUser } = useAuth();
    const { t } = useLanguage();

    const [selectedCareType, setSelectedCareType] = useState(null);
    const [error, setError] = useState('');

    const saveCareType = async (careType) => {
        if (!currentUser) {
            setError(t('userNotFound') || 'User not found');
            return;
        }

        try {
            setError('');
            setSelectedCareType(careType);

            const careTypeKey = `careType:${currentUser.uid}`;
            
            // Save to AsyncStorage immediately
            await AsyncStorage.setItem(careTypeKey, careType);

            // Navigate immediately without waiting for Firestore
            if (careType === 'pcos') {
                router.replace('/pcos-duration');
            } else {
                router.replace('/period-dashboard');
            }

            // Sync to Firestore in background (non-blocking)
            setDoc(
                doc(db, 'users', currentUser.uid),
                {
                    careType,
                    careTypeSelectedAt: serverTimestamp(),
                },
                { merge: true }
            ).catch((err) => console.error('Background Firestore sync error:', err));
        } catch (err) {
            console.error('Error saving care type:', err);
            setError(t('saveFailed') || 'Failed to save selection');
        }
    };

    const handleCareTypeSelect = (careType) => {
        setSelectedCareType(careType);
        saveCareType(careType);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.headerSection}>
                    <Text style={styles.title}>{t('selectCareType') || 'What brings you here?'}</Text>
                    <Text style={styles.subtitle}>{t('careTypeDescription') || 'Choose the care path that fits your needs'}</Text>
                </View>

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <View style={styles.cardsContainer}>
                    {/* PCOS/PCOD Care Card */}
                    <TouchableOpacity
                        style={[
                            styles.careCard,
                            selectedCareType === 'pcos' && styles.careCardActive,
                        ]}
                        onPress={() => handleCareTypeSelect('pcos')}
                        activeOpacity={0.85}
                    >
                        <View style={styles.iconContainer}>
                            <Activity size={40} color={theme.colors.primary} />
                        </View>
                        <Text style={styles.careCardTitle}>{t('pcosCare') || 'PCOS/PCOD Care'}</Text>
                        <Text style={styles.careCardDescription}>
                            {t('pcosCareDesc') || 'Manage PCOS/PCOD symptoms and track your wellness journey'}
                        </Text>
                    </TouchableOpacity>

                    {/* Period Care Card */}
                    <TouchableOpacity
                        style={[
                            styles.careCard,
                            selectedCareType === 'period' && styles.careCardActive,
                        ]}
                        onPress={() => handleCareTypeSelect('period')}
                        activeOpacity={0.85}
                    >
                        <View style={styles.iconContainer}>
                            <Heart size={40} color={theme.colors.accentPink} />
                        </View>
                        <Text style={styles.careCardTitle}>{t('periodCare') || 'Period Care'}</Text>
                        <Text style={styles.careCardDescription}>
                            {t('periodCareDesc') || 'Track your cycle and manage period-related wellness'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.footerText}>
                    {t('careTypeFooter') || 'You can change this later in your settings'}
                </Text>
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
        justifyContent: 'space-between',
    },
    headerSection: {
        marginBottom: 32,
        marginTop: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: theme.colors.heading,
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 15,
        color: theme.colors.body,
        lineHeight: 22,
    },
    error: {
        fontSize: 12,
        color: '#fff',
        backgroundColor: theme.colors.accentPink,
        borderRadius: 10,
        padding: 10,
        marginBottom: 16,
        overflow: 'hidden',
    },
    cardsContainer: {
        gap: 16,
        marginVertical: 24,
    },
    careCard: {
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        borderWidth: 2,
        borderColor: theme.colors.inputBorder,
        padding: 20,
        alignItems: 'center',
        ...theme.shadows.soft,
        transition: 'all 300ms ease',
    },
    careCardActive: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.primaryLight,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: theme.colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
    careCardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.heading,
        marginBottom: 8,
        textAlign: 'center',
    },
    careCardDescription: {
        fontSize: 13,
        color: theme.colors.body,
        textAlign: 'center',
        lineHeight: 19,
    },
    loadingIndicator: {
        marginTop: 12,
    },
    footerText: {
        fontSize: 12,
        color: theme.colors.muted,
        textAlign: 'center',
        marginTop: 16,
    },
});
