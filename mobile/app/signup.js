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
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useRouter, Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { UserPlus, Mail, Lock, User } from 'lucide-react-native';
import { theme } from '../styles/theme';

export default function SignupScreen() {
    const { currentUser, signup, loginWithGoogle } = useAuth();
    const { t } = useLanguage();
    const router = useRouter();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (currentUser) {
            router.replace('/welcome');
        }
    }, [currentUser]);

    const handleSignup = async () => {
        if (!fullName || !email || !password || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            setError('');
            setLoading(true);
            await signup(email, password, { fullName });
            router.replace('/welcome');
        } catch (err) {
            setError('Failed to create account. ' + err.message);
            console.error(err);
        } finally {
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
                            <UserPlus size={28} color={theme.colors.primary} />
                        </View>
                        <Text style={styles.title}>{t('createAccount')}</Text>
                        <Text style={styles.subtitle}>{t('joinCommunity')}</Text>
                    </View>

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>{t('fullName')}</Text>
                        <View style={styles.inputWrapper}>
                            <User size={18} color={theme.colors.muted} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Janardan Rao"
                                value={fullName}
                                onChangeText={setFullName}
                            />
                        </View>
                    </View>

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

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>{t('confirmPassword')}</Text>
                        <View style={styles.inputWrapper}>
                            <Lock size={18} color={theme.colors.muted} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="••••••"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.signupButton}
                        onPress={handleSignup}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={theme.colors.surface} />
                        ) : (
                            <Text style={styles.signupButtonText}>{t('signUp')}</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>{t('or') || 'OR'}</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <TouchableOpacity
                        style={styles.googleButton}
                        onPress={() => loginWithGoogle()}
                        disabled={loading}
                    >
                        <View style={styles.googleIconContainer}>
                            <Text style={styles.googleIconText}>G</Text>
                        </View>
                        <Text style={styles.googleButtonText}>{t('continueWithGoogle') || 'Continue with Google'}</Text>
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>{t('alreadyAccount')} </Text>
                        <Link href="/login" asChild>
                            <TouchableOpacity>
                                <Text style={styles.linkText}>{t('signIn')}</Text>
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
        paddingVertical: 40,
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: '100%',
        opacity: 0.1,
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
    signupButton: {
        backgroundColor: theme.colors.primaryDark,
        borderRadius: 16,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
        ...theme.shadows.soft,
    },
    signupButtonText: {
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
