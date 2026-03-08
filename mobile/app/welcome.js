import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '../styles/theme';
import { useLanguage } from '../contexts/LanguageContext';
import p1Image from '../assets/p1.png';

export default function WelcomeScreen() {
    const router = useRouter();
    const { t } = useLanguage();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}> 
                <View style={styles.card}>
                    <Text style={styles.emoji}></Text>
                    <Text style={styles.title}>{t('welcomePulseCare')}</Text>
                    <Text style={styles.subtitle}>{t('welcomeSubtitle')}</Text>
                </View>

                <View style={styles.logoSection}>
                    <Image
                        source={p1Image}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                <TouchableOpacity style={styles.nextButton} onPress={() => router.push('/education-video')}>
                    <Text style={styles.nextText}>{t('next')}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.backgroundGradientStart,
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 24,
        paddingBottom: 36,
    },
    card: {
        marginTop: 60,
        backgroundColor: theme.colors.surface,
        borderRadius: 32,
        padding: 32,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.colors.secondary,
        ...theme.shadows.soft,
    },
    emoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    title: {
        fontSize: 32,
        lineHeight: 42,
        fontWeight: '800',
        textAlign: 'center',
        color: theme.colors.heading,
        letterSpacing: 0.5,
    },
    subtitle: {
        marginTop: 16,
        fontSize: 20,
        lineHeight: 28,
        fontWeight: '700',
        color: theme.colors.primary,
        textAlign: 'center',
        letterSpacing: 0.3,
    },
    nextButton: {
        height: 58,
        borderRadius: 20,
        backgroundColor: theme.colors.primaryDark,
        alignItems: 'center',
        justifyContent: 'center',
        ...theme.shadows.soft,
    },
    nextText: {
        color: theme.colors.surface,
        fontSize: 18,
        fontWeight: '700',
    },
    logoSection: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 24,
    },
    logo: {
        width: 140,
        height: 140,
        borderRadius: 70,
        overflow: 'hidden',
        borderWidth: 4,
        borderColor: '#5A189A',
        ...theme.shadows.soft,
    },
});
