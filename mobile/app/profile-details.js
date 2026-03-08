import  { useMemo, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    ActivityIndicator,
    Platform,
    Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { theme } from '../styles/theme';

export default function ProfileDetailsScreen() {
    const router = useRouter();
    const { currentUser } = useAuth();
    const { t } = useLanguage();

    const [fullName, setFullName] = useState('');
    const [age, setAge] = useState('');
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [phone, setPhone] = useState('');
    const [dobText, setDobText] = useState('2000-01-01');
    const [showDobPicker, setShowDobPicker] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const dobLabel = useMemo(() => dobText, [dobText]);
    const profileCacheKey = currentUser?.uid ? `profileCompleted:${currentUser.uid}` : null;
    const profileDataCacheKey = currentUser?.uid ? `profileData:${currentUser.uid}` : null;

    const withTimeout = (promise, timeoutMs = 1800) => {
        return Promise.race([
            promise,
            new Promise((resolve) => setTimeout(() => resolve(null), timeoutMs)),
        ]);
    };

    const applyProfileToForm = (profileData) => {
        if (!profileData) return;
        setFullName(profileData.fullName ? String(profileData.fullName) : '');
        setAge(profileData.age !== undefined && profileData.age !== null ? String(profileData.age) : '');
        setWeight(profileData.weight !== undefined && profileData.weight !== null ? String(profileData.weight) : '');
        setHeight(profileData.height !== undefined && profileData.height !== null ? String(profileData.height) : '');
        setPhone(profileData.phone ? String(profileData.phone) : '');
        setDobText(profileData.dateOfBirth ? String(profileData.dateOfBirth) : '2000-01-01');
    };

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
            console.error('Profile save (background) failed:', err);
        }
    };

    useEffect(() => {
        let isMounted = true;
        let failSafeTimer;

        const checkProfileCompletion = async () => {
            if (!currentUser) {
                if (isMounted) setLoading(false);
                return;
            }

            try {
                if (isMounted) setLoading(true);
                failSafeTimer = setTimeout(() => {
                    if (isMounted) setLoading(false);
                }, 2200);

                if (currentUser?.uid && profileDataCacheKey) {
                    const pendingProfileData = await AsyncStorage.getItem(profileDataCacheKey);
                    if (pendingProfileData) {
                        const parsed = JSON.parse(pendingProfileData);
                        if (isMounted) applyProfileToForm(parsed);
                        syncProfileToFirestore(currentUser.uid, parsed);
                    }
                }

                if (profileDataCacheKey) {
                    const cachedProfileData = await AsyncStorage.getItem(profileDataCacheKey);
                    if (cachedProfileData && isMounted) {
                        applyProfileToForm(JSON.parse(cachedProfileData));
                    }
                }

                if (profileCacheKey) {
                    const cachedCompleted = await AsyncStorage.getItem(profileCacheKey);
                    if (cachedCompleted === 'true') {
                        if (isMounted) {
                            router.replace('/care-type');
                        }
                        return;
                    }
                }

                const userDoc = await withTimeout(getDoc(doc(db, 'users', currentUser.uid)), 1800);

                if (userDoc?.exists && userDoc.exists()) {
                    const userData = userDoc.data();
                    if (isMounted) {
                        applyProfileToForm(userData);
                    }

                    const hasRequiredFields = Boolean(
                        userData.fullName && userData.age && userData.phone && userData.weight && userData.height
                    );
                    const isCompleted = userData.profileCompleted === true || hasRequiredFields;

                    if (profileDataCacheKey) {
                        await AsyncStorage.setItem(profileDataCacheKey, JSON.stringify(userData));
                    }

                    if (isCompleted) {
                        if (profileCacheKey) {
                            await AsyncStorage.setItem(profileCacheKey, 'true');
                        }
                        if (userData.profileCompleted !== true) {
                            await setDoc(
                                doc(db, 'users', currentUser.uid),
                                { profileCompleted: true, profileCompletedAt: serverTimestamp() },
                                { merge: true }
                            );
                        }
                        if (isMounted) {
                            router.replace('/care-type');
                        }
                        return;
                    }
                }
                if (isMounted) setLoading(false);
            } catch (err) {
                console.error('Error checking profile:', err);
                if (isMounted) setLoading(false);
            } finally {
                if (failSafeTimer) clearTimeout(failSafeTimer);
            }
        };

        checkProfileCompletion();

        return () => {
            isMounted = false;
            if (failSafeTimer) clearTimeout(failSafeTimer);
        };
    }, [currentUser, profileCacheKey, profileDataCacheKey, router]);

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const parseDobDate = () => {
        if (!dobText) return new Date(2000, 0, 1);
        const parsed = new Date(dobText);
        if (Number.isNaN(parsed.getTime())) return new Date(2000, 0, 1);
        return parsed;
    };

    const onDobChange = (_, selectedDate) => {
        if (Platform.OS === 'android') {
            setShowDobPicker(false);
        }
        if (selectedDate) {
            setDobText(formatDate(selectedDate));
        }
    };

    const handleContinue = async () => {
        if (!currentUser) {
            router.replace('/care-type');
            return;
        }

        const fullNameTrim = fullName.trim();
        const ageTrim = age.trim();
        const weightTrim = weight.trim();
        const heightTrim = height.trim();
        const phoneTrim = phone.trim();

        if (!fullNameTrim || !ageTrim || !weightTrim || !heightTrim || !phoneTrim) {
            setError(t('fillAllProfileFields'));
            return;
        }

        const ageNum = Number(ageTrim);
        const weightNum = Number(weightTrim);
        const heightNum = Number(heightTrim);

        if (isNaN(ageNum) || ageNum <= 0) { setError(t('invalidAge')); return; }
        if (isNaN(weightNum) || weightNum <= 0) { setError(t('invalidWeight')); return; }
        if (isNaN(heightNum) || heightNum <= 0) { setError(t('invalidHeight')); return; }

        try {
            setSaving(true);
            setError('');

            const profilePayload = {
                fullName: fullNameTrim,
                age: ageNum,
                dateOfBirth: dobText.trim() || '2000-01-01',
                weight: weightNum,
                height: heightNum,
                phone: phoneTrim,
                profileCompleted: true,
            };

            if (profileCacheKey) {
                await AsyncStorage.setItem(profileCacheKey, 'true');
            }
            if (profileDataCacheKey) {
                await AsyncStorage.setItem(profileDataCacheKey, JSON.stringify(profilePayload));
            }

            router.replace('/care-type');

            syncProfileToFirestore(currentUser.uid, profilePayload);
        } catch (err) {
            console.error(err);
            setError(t('profileSaveFailed'));
            setSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <>
                    <View style={styles.headerRow}>
                        <View style={{ width: 60 }} />
                        <Text style={styles.headerTitle}>{t('profileDetails')}</Text>
                        <TouchableOpacity onPress={() => router.replace('/care-type')}>
                            <Text style={styles.skipTop}>{t('skip')}</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.content}>
                        <View style={styles.card}>
                            <Text style={styles.title}>{t('tellUsAboutYou')} </Text>
                            <Text style={styles.subtitle}>{t('personalizeJourney')}</Text>

                            {error ? <Text style={styles.error}>{error}</Text> : null}

                            <TextInput style={styles.input} placeholder={t('fullName')} placeholderTextColor={theme.colors.muted} value={fullName} onChangeText={setFullName} />
                            <TextInput style={styles.input} placeholder={t('age')} placeholderTextColor={theme.colors.muted} keyboardType="numeric" value={age} onChangeText={setAge} />

                            <Pressable style={styles.input} onPress={() => setShowDobPicker(true)}>
                                <Text style={styles.inputText}>{dobText || t('dateOfBirthFormat')}</Text>
                            </Pressable>

                            {showDobPicker && (
                                <View style={styles.dobPickerWrap}>
                                    <DateTimePicker
                                        value={parseDobDate()}
                                        mode="date"
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        onChange={onDobChange}
                                        maximumDate={new Date()}
                                    />
                                    {Platform.OS === 'ios' && (
                                        <TouchableOpacity style={styles.pickerDoneButton} onPress={() => setShowDobPicker(false)}>
                                            <Text style={styles.pickerDoneText}>{t('done')}</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}

                            <TextInput style={styles.input} placeholder={t('weightKg')} placeholderTextColor={theme.colors.muted} keyboardType="numeric" value={weight} onChangeText={setWeight} />
                            <TextInput style={styles.input} placeholder={t('heightCm')} placeholderTextColor={theme.colors.muted} keyboardType="numeric" value={height} onChangeText={setHeight} />
                            <TextInput style={styles.input} placeholder={t('phoneNumber')} placeholderTextColor={theme.colors.muted} keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
                        </View>
                    </ScrollView>

                    <View style={styles.bottomActions}>
                        <TouchableOpacity style={styles.skipButton} onPress={() => router.replace('/care-type')}>
                            <Text style={styles.skipText}>{t('skip')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.continueButton} onPress={handleContinue} disabled={saving}>
                            {saving ? <ActivityIndicator color={theme.colors.surface} /> : <Text style={styles.continueText}>{t('continue')}</Text>}
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10 },
    headerTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.heading },
    skipTop: { color: theme.colors.secondaryText, fontSize: 14, fontWeight: '700' },
    content: { padding: 20, paddingBottom: 8 },
    card: { borderRadius: 24, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.inputBorder, padding: 16, gap: 12, ...theme.shadows.soft },
    title: { fontSize: 24, fontWeight: '700', color: theme.colors.heading },
    subtitle: { fontSize: 13, color: theme.colors.body, marginBottom: 4 },
    error: { fontSize: 12, color: theme.colors.secondaryText, backgroundColor: theme.colors.accentPink, borderRadius: 10, padding: 10 },
    input: { height: 48, borderRadius: 14, borderWidth: 1, borderColor: theme.colors.inputBorder, backgroundColor: theme.colors.surface, paddingHorizontal: 14, justifyContent: 'center', color: theme.colors.heading },
    inputText: { color: theme.colors.heading, fontSize: 15 },
    dobPickerWrap: { borderRadius: 14, borderWidth: 1, borderColor: theme.colors.inputBorder, backgroundColor: theme.colors.surface, padding: 8 },
    pickerDoneButton: { alignSelf: 'flex-end', borderRadius: 8, backgroundColor: theme.colors.primary, paddingHorizontal: 12, paddingVertical: 8, marginTop: 4 },
    pickerDoneText: { color: theme.colors.surface, fontWeight: '700', fontSize: 12 },
    bottomActions: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, borderTopColor: theme.colors.inputBorder, backgroundColor: theme.colors.background },
    skipButton: { flex: 1, height: 52, borderRadius: 16, backgroundColor: theme.colors.secondary, alignItems: 'center', justifyContent: 'center' },
    skipText: { color: theme.colors.secondaryText, fontWeight: '700', fontSize: 16 },
    continueButton: { flex: 1, height: 52, borderRadius: 16, backgroundColor: theme.colors.primaryDark, alignItems: 'center', justifyContent: 'center', ...theme.shadows.soft },
    continueText: { color: theme.colors.surface, fontWeight: '700', fontSize: 16 },
});
