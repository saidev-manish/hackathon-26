import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Image
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useRouter, Link, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { LogIn, Mail, Lock, Phone } from 'lucide-react-native';
import { theme } from '../styles/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
    const { currentUser, login, loginWithGoogle, continueAsGuest } = useAuth();
    const { t } = useLanguage();
    const router = useRouter();
    const { accountEmail } = useLocalSearchParams();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (accountEmail && typeof accountEmail === 'string') {
            setEmail(accountEmail);
        }
    }, [accountEmail]);

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        try {
            setError('');
            setLoading(true);
            await login(email, password);
            // Navigate to home after successful login - index.js will route based on auth state
            router.replace('/');
        } catch (err) {
            setError('Failed to login. Please check your credentials.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setError('');
            setLoading(true);
            const result = await loginWithGoogle();
            if (result?.cancelled) {
                setLoading(false);
                return;
            }
            // Navigate to home after successful Google login - index.js will route based on auth state
            router.replace('/');
        } catch (err) {
            if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
                setLoading(false);
                return;
            }
            setError('Failed to login with Google. Please try again.');
            console.error(err);
            setLoading(false);
        }
    };

    const handleGuestLogin = async () => {
        try {
            setError('');
            setLoading(true);
            await continueAsGuest();
            router.replace('/');
        } catch (err) {
            console.error(err);
            setError('Failed to continue as guest. Please try again.');
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <LinearGradient
                    colors={theme.gradients.page}
                    style={styles.background}
                />

                <View style={styles.card}>
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <LogIn size={28} color={theme.colors.primary} />
                        </View>
                        <Text style={styles.title}>{t('welcome  ')}</Text>
                        <Text style={styles.subtitle}>{t('signInToSpace')}</Text>
                    </View>

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>{t('email')}</Text>
                        <View style={styles.inputWrapper}>
                            <Mail size={18} color={theme.colors.muted} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="name@example.com"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>{t('password')}</Text>
                        <View style={styles.inputWrapper}>
                            <Lock size={18} color={theme.colors.muted} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="••••••"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={theme.colors.surface} />
                        ) : (
                            <Text style={styles.loginButtonText}>{t('signIn')}</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>{t('or') || 'OR'}</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <TouchableOpacity
                        style={styles.googleButton}
                        onPress={handleGoogleLogin}
                        disabled={loading}
                    >
                        <View style={styles.googleIconContainer}>
                            <Text style={styles.googleIconText}>G</Text>
                        </View>
                        <Text style={styles.googleButtonText}>{t('continueWithGoogle') || 'Continue with Google'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.guestButton}
                        onPress={handleGuestLogin}
                        disabled={loading}
                    >
                        <Text style={styles.guestButtonText}>{t('continueAsGuest') || 'Continue as Guest'}</Text>
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>{t('alreadyAccount')} </Text>
                        <Link href="/signup" asChild>
                            <TouchableOpacity>
                                <Text style={styles.linkText}>{t('signUp')}</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: '100%',
        opacity: 0.2,
    },
    card: {
        padding: 32,
        borderRadius: 32,
        backgroundColor: theme.colors.card,
        ...theme.shadows.soft,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoContainer: {
        width: 64,
        height: 64,
        backgroundColor: theme.colors.accentPink,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: theme.colors.heading,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: theme.colors.body,
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.body,
        marginBottom: 8,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        paddingHorizontal: 16,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: 52,
        fontSize: 16,
        color: theme.colors.heading,
    },
    errorText: {
        color: theme.colors.secondaryText,
        backgroundColor: theme.colors.accentPink,
        padding: 12,
        borderRadius: 12,
        marginBottom: 20,
        textAlign: 'center',
        fontSize: 14,
    },
    savedAccountsBox: {
        marginBottom: 18,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        backgroundColor: theme.colors.surface,
        padding: 12,
        gap: 8,
    },
    savedAccountsTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.colors.heading,
    },
    savedAccountRow: {
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
        backgroundColor: theme.colors.card,
    },
    savedAccountName: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.colors.heading,
    },
    savedAccountEmail: {
        marginTop: 2,
        fontSize: 11,
        color: theme.colors.body,
    },
    loginButton: {
        backgroundColor: theme.colors.primaryDark,
        borderRadius: 16,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
        ...theme.shadows.soft,
    },
    loginButtonText: {
        color: theme.colors.surface,
        fontSize: 16,
        fontWeight: '700',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: theme.colors.inputBorder,
    },
    dividerText: {
        marginHorizontal: 12,
        color: theme.colors.muted,
        fontSize: 12,
        fontWeight: '600',
    },
    googleButton: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        marginBottom: 12,
        ...theme.shadows.soft,
    },
    googleIconContainer: {
        width: 24,
        height: 24,
        backgroundColor: theme.colors.card,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    googleIconText: {
        fontSize: 14,
        fontWeight: '900',
        color: '#4285F4',
    },
    googleButtonText: {
        color: theme.colors.body,
        fontSize: 16,
        fontWeight: '600',
    },
    guestButton: {
        backgroundColor: theme.colors.secondary,
        borderRadius: 16,
        height: 52,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        marginBottom: 12,
    },
    guestButtonText: {
        color: theme.colors.secondaryText,
        fontSize: 15,
        fontWeight: '700',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    footerText: {
        color: theme.colors.body,
        fontSize: 14,
    },
    linkText: {
        color: theme.colors.primary,
        fontSize: 14,
        fontWeight: '700',
    },
});
