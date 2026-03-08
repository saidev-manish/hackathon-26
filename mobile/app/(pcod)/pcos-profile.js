import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { theme } from '../../styles/theme';

export default function PCOSProfileScreen() {
    const router = useRouter();
    const { currentUser } = useAuth();
    const { t } = useLanguage();

    const [fullName, setFullName] = useState('');
    const [age, setAge] = useState('');
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [lastPeriodDate, setLastPeriodDate] = useState('');
    const [error, setError] = useState('');

    const profileCacheKey = currentUser?.uid ? `profileCompleted:${currentUser.uid}` : null;
    const profileDataCacheKey = currentUser?.uid ? `profileData:${currentUser.uid}` : null;

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
        enforcePcosRoute().catch((err) => {
            console.error('Failed to enforce PCOS profile route', err);
        });
        return () => { active = false; };
    }, [currentUser?.uid, router]);

    const syncProfileToFirestore = async (uid, profileData) => {
        try {
            await setDoc(
                doc(db, 'users', uid),
                {
                    uid,
                    ...profileData,
                    profileCompleted: true,
                    profileCompletedAt: serverTimestamp(),
                },
                { merge: true }
            );
            if (profileDataCacheKey) {
                await AsyncStorage.removeItem(profileDataCacheKey);
            }
        } catch (err) {
            console.error('Profile save failed:', err);
        }
    };

    const handleContinue = async () => {
        if (!currentUser) {
            router.replace('/pcos-duration');
            return;
        }
        const fullNameTrim = fullName.trim();
        const ageTrim = age.trim();
        const weightTrim = weight.trim();
        const heightTrim = height.trim();

        if (!fullNameTrim || !ageTrim || !weightTrim || !heightTrim) {
            setError(t('fillAllProfileFields') || 'Please fill all fields');
            return;
        }

        const ageNum = Number(ageTrim);
        const weightNum = Number(weightTrim);
        const heightNum = Number(heightTrim);

        if (isNaN(ageNum) || ageNum <= 0) {
            setError(t('invalidAge') || 'Please enter a valid age');
            return;
        }
        if (isNaN(weightNum) || weightNum <= 0) {
            setError(t('invalidWeight') || 'Please enter a valid weight');
            return;
        }
        if (isNaN(heightNum) || heightNum <= 0) {
            setError(t('invalidHeight') || 'Please enter a valid height');
            return;
        }

        try {
            setError('');
            const profilePayload = {
                fullName: fullNameTrim,
                age: ageNum,
                weight: weightNum,
                height: heightNum,
                lastPeriodDate: lastPeriodDate.trim() || '2000-01-01',
                profileCompleted: true,
            };
            if (profileCacheKey) {
                await AsyncStorage.setItem(profileCacheKey, 'true');
            }
            if (profileDataCacheKey) {
                await AsyncStorage.setItem(profileDataCacheKey, JSON.stringify(profilePayload));
            }
            router.replace('/pcos-duration');
            syncProfileToFirestore(currentUser.uid, profilePayload);
        } catch (err) {
            console.error(err);
            setError(t('profileSaveFailed') || 'Failed to save profile');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerRow}>
                <View style={{ width: 60 }} />
                <Text style={styles.headerTitle}>{t('pcosCareProfile') || 'PCOS Care Profile'}</Text>
                <TouchableOpacity onPress={() => router.replace('/pcos-empty')}>
                    <Text style={styles.skipTop}>{t('skip')}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.title}>{t('pcosProfileTitle') || 'Tell us about you'} </Text>
                    <Text style={styles.subtitle}>{t('pcosProfileSubtitle') || 'Help us personalize your PCOS care journey'}</Text>

                    {error ? <Text style={styles.error}>{error}</Text> : null}

                    <TextInput
                        style={styles.input}
                        placeholder={t('fullName') || 'Full Name'}
                        placeholderTextColor={theme.colors.muted}
                        value={fullName}
                        onChangeText={setFullName}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder={t('age') || 'Age'}
                        placeholderTextColor={theme.colors.muted}
                        keyboardType="numeric"
                        value={age}
                        onChangeText={setAge}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder={t('weightKg') || 'Weight (kg)'}
                        placeholderTextColor={theme.colors.muted}
                        keyboardType="numeric"
                        value={weight}
                        onChangeText={setWeight}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder={t('heightCm') || 'Height (cm)'}
                        placeholderTextColor={theme.colors.muted}
                        keyboardType="numeric"
                        value={height}
                        onChangeText={setHeight}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder={t('lastPeriodDate') || 'Last Period Date (YYYY-MM-DD)'}
                        placeholderTextColor={theme.colors.muted}
                        value={lastPeriodDate}
                        onChangeText={setLastPeriodDate}
                    />
                </View>
            </ScrollView>

            <View style={styles.bottomActions}>
                <TouchableOpacity
                    style={styles.skipButton}
                    onPress={() => router.replace('/pcos-empty')}
                >
                    <Text style={styles.skipText}>{t('skip')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.continueButton}
                    onPress={handleContinue}
                >
                    <Text style={styles.continueText}>{t('continue')}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10 },
    headerTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.heading },
    skipTop: { color: theme.colors.secondaryText, fontSize: 14, fontWeight: '700' },
    content: { padding: 20, paddingBottom: 8 },
    card: { borderRadius: 24, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.inputBorder, padding: 16, gap: 12, ...theme.shadows.soft },
    title: { fontSize: 24, fontWeight: '700', color: theme.colors.heading },
    subtitle: { fontSize: 13, color: theme.colors.body, marginBottom: 4 },
    error: { fontSize: 12, color: '#fff', backgroundColor: theme.colors.accentPink, borderRadius: 10, padding: 10 },
    input: { height: 48, borderRadius: 14, borderWidth: 1, borderColor: theme.colors.inputBorder, backgroundColor: theme.colors.surface, paddingHorizontal: 14, justifyContent: 'center', color: theme.colors.heading },
    datePickerWrap: { borderRadius: 14, borderWidth: 1, borderColor: theme.colors.inputBorder, backgroundColor: theme.colors.surface, padding: 8 },
    pickerDoneButton: { alignSelf: 'flex-end', borderRadius: 8, backgroundColor: theme.colors.primary, paddingHorizontal: 12, paddingVertical: 8, marginTop: 4 },
    pickerDoneText: { color: theme.colors.surface, fontWeight: '700', fontSize: 12 },
    bottomActions: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, borderTopColor: theme.colors.inputBorder, backgroundColor: theme.colors.background },
    skipButton: { flex: 1, height: 52, borderRadius: 16, backgroundColor: theme.colors.secondary, alignItems: 'center', justifyContent: 'center' },
    skipText: { color: theme.colors.secondaryText, fontWeight: '700', fontSize: 16 },
    continueButton: { flex: 1, height: 52, borderRadius: 16, backgroundColor: theme.colors.primaryDark, alignItems: 'center', justifyContent: 'center', ...theme.shadows.soft },
    continueText: { color: theme.colors.surface, fontWeight: '700', fontSize: 16 },
});
