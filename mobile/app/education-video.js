import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '../styles/theme';
import { useLanguage } from '../contexts/LanguageContext';

export default function EducationVideoScreen() {
  const router = useRouter();
  const { t, language, changeLanguage } = useLanguage();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>🌍</Text>
          <Text style={styles.title}>{t('selectLanguage') || 'Select Language'}</Text>
          <Text style={styles.subtitle}>
            {t('choosePreferredLanguage') || 'Choose your preferred language'}
          </Text>
        </View>

        {/* Language Selection */}
        <View style={styles.languageContainer}>
          <TouchableOpacity
            style={[
              styles.languageCard,
              language === 'en' && styles.languageCardActive,
            ]}
            onPress={() => changeLanguage('en')}
          >
            <Text style={styles.languageIcon}>🇬🇧</Text>
            <Text style={[styles.languageName, language === 'en' && styles.languageNameActive]}>English</Text>
            {language === 'en' && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.languageCard,
              language === 'hi' && styles.languageCardActive,
            ]}
            onPress={() => changeLanguage('hi')}
          >
            <Text style={styles.languageIcon}>🇮🇳</Text>
            <Text style={[styles.languageName, language === 'hi' && styles.languageNameActive]}>हिंदी</Text>
            {language === 'hi' && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.languageCard,
              language === 'te' && styles.languageCardActive,
            ]}
            onPress={() => changeLanguage('te')}
          >
            <Text style={styles.languageIcon}>🇮🇳</Text>
            <Text style={[styles.languageName, language === 'te' && styles.languageNameActive]}>తెలుగు</Text>
            {language === 'te' && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
        </View>

        {/* Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => router.replace('/profile-details')}
          >
            <Text style={styles.skipText}>{t('skip')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => router.replace('/profile-details')}
          >
            <Text style={styles.nextText}>{t('next')}</Text>
          </TouchableOpacity>
        </View>

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
    paddingTop: 40,
    paddingBottom: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  header: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },

  emoji: {
    fontSize: 56,
    marginBottom: 12,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.heading,
    textAlign: 'center',
  },

  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: theme.colors.body,
    textAlign: 'center',
  },

  languageContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    gap: 16,
  },

  languageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.colors.inputBorder,
    padding: 20,
    ...theme.shadows.soft,
  },

  languageCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },

  languageIcon: {
    fontSize: 32,
    marginRight: 16,
  },

  languageName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.heading,
  },

  languageNameActive: {
    color: theme.colors.primary,
  },

  checkmark: {
    fontSize: 24,
    color: theme.colors.primary,
    fontWeight: '700',
  },

  actionRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },

  skipButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: theme.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  skipText: {
    color: theme.colors.secondaryText,
    fontWeight: '700',
    fontSize: 16,
  },

  nextButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: theme.colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.soft,
  },

  nextText: {
    color: theme.colors.surface,
    fontWeight: '700',
    fontSize: 16,
  },
});