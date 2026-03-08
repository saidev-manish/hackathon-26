import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useLanguage } from '../../contexts/LanguageContext';
import { theme } from '../../styles/theme';

export default function PCOSWelcomeScreen() {
    const router = useRouter();
    const { t } = useLanguage();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.centerSection}>
                    <Text style={styles.emoji}>💜</Text>
                    <Text style={styles.mainMessage}>{t('pcosWelcomeMessage') || "Don't worry, we are with you"}</Text>
                    <Text style={styles.subMessage}>{t('pcosWelcomeSubtitle') || 'Your personalized PCOS care journey starts here'}</Text>
                </View>

                <View style={styles.featuresSection}>
                    <View style={styles.featureItem}>
                        <Text style={styles.featureIcon}>📊</Text>
                        <Text style={styles.featureText}>{t('trackProgress') || 'Track your progress'}</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <Text style={styles.featureIcon}>💡</Text>
                        <Text style={styles.featureText}>{t('getInsights') || 'Get personalized insights'}</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <Text style={styles.featureIcon}>🎯</Text>
                        <Text style={styles.featureText}>{t('achieveGoals') || 'Achieve your wellness goals'}</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.continueButton}
                    onPress={() => router.replace('/dashboard-pcos-profile')}
                >
                    <Text style={styles.continueText}>{t('getStarted') || 'Get Started'}</Text>
                </TouchableOpacity>
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
    centerSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
    },
    emoji: {
        fontSize: 80,
        marginBottom: 24,
    },
    mainMessage: {
        fontSize: 32,
        fontWeight: '700',
        color: theme.colors.heading,
        textAlign: 'center',
        marginBottom: 12,
        lineHeight: 40,
    },
    subMessage: {
        fontSize: 15,
        color: theme.colors.body,
        textAlign: 'center',
        lineHeight: 22,
    },
    featuresSection: {
        marginVertical: 32,
        gap: 16,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        ...theme.shadows.soft,
    },
    featureIcon: {
        fontSize: 28,
        marginRight: 12,
    },
    featureText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.heading,
    },
    continueButton: {
        height: 56,
        borderRadius: 16,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        ...theme.shadows.soft,
    },
    continueText: {
        color: theme.colors.surface,
        fontWeight: '700',
        fontSize: 16,
    },
});
