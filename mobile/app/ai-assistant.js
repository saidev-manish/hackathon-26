import React, { useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Sparkles, Send } from 'lucide-react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { theme } from '../styles/theme';

const GEMINI_MODEL = 'gemini-1.5-flash';
const GEMINI_API_KEY = 'AIzaSyDSmevLBf4anQwna5Ts1ejYUdX4LBpXbk4';

export default function AIAssistantScreen() {
    const router = useRouter();
    const { t } = useLanguage();
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 'welcome',
            role: 'assistant',
            text: 'Hi, I am your AI PCOD/PCOS helper. Ask me about symptoms, cycle care, food, or workouts.',
        },
    ]);

    const getAssistantReply = async (userText) => {
        if (!GEMINI_API_KEY) {
            throw new Error('Gemini API key is missing.');
        }

        const historyForGemini = messages
            .filter((entry) => entry.role === 'user' || entry.role === 'assistant')
            .filter((entry) => entry.text !== userText)
            .slice(-10)
            .map((entry) => ({
                role: entry.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: entry.text }],
            }));

        const userPrompt = {
            role: 'user',
            parts: [{ text: userText }],
        };

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    systemInstruction: {
                        parts: [{
                            text: 'You are a supportive women health assistant focused on PCOD/PCOS. Give practical, safe, concise advice. Do not diagnose. For severe symptoms, advise seeing a gynecologist.',
                        }],
                    },
                    contents: [...historyForGemini, userPrompt],
                    generationConfig: {
                        temperature: 0.6,
                        maxOutputTokens: 450,
                    },
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data?.error?.message || 'Gemini request failed');
        }

        const text = data?.candidates?.[0]?.content?.parts
            ?.map((part) => part?.text || '')
            .join('')
            ?.trim();

        return text || 'I could not generate a reply right now. Please try again.';
    };

    const sendMessage = async (presetText) => {
        const text = (presetText ?? input).trim();
        if (!text || loading) return;

        const userMsg = { id: `${Date.now()}-u`, role: 'user', text };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const reply = await getAssistantReply(text);
            const botMsg = {
                id: `${Date.now()}-a`,
                role: 'assistant',
                text: reply,
            };
            setMessages((prev) => [...prev, botMsg]);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                {
                    id: `${Date.now()}-e`,
                    role: 'assistant',
                    text: error?.message || 'Unable to respond right now. Please try again.',
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={20} color={theme.colors.heading} />
                </TouchableOpacity>
                <View style={styles.headerTitleWrap}>
                    <Sparkles size={16} color={theme.colors.primary} />
                    <Text style={styles.headerTitle}>{t('aiHelper') || 'AI Helper'}</Text>
                </View>
                <View style={styles.backButton} />
            </View>

            <ScrollView contentContainerStyle={styles.chatContent}>
                {messages.map((msg) => (
                    <View
                        key={msg.id}
                        style={[
                            styles.bubble,
                            msg.role === 'user' ? styles.userBubble : styles.assistantBubble,
                        ]}
                    >
                        <Text style={msg.role === 'user' ? styles.userText : styles.assistantText}>{msg.text}</Text>
                    </View>
                ))}
                {loading && (
                    <View style={[styles.bubble, styles.assistantBubble, styles.loaderBubble]}>
                        <ActivityIndicator size="small" color={theme.colors.primary} />
                    </View>
                )}
            </ScrollView>

            <View style={styles.inputRow}>
                <TextInput
                    style={styles.input}
                    placeholder={t('askPcosQuestion') || 'Ask about PCOS/PCOD...'}
                    placeholderTextColor={theme.colors.muted}
                    value={input}
                    onChangeText={setInput}
                    multiline
                />
                <TouchableOpacity style={styles.sendButton} onPress={() => sendMessage()} disabled={loading}>
                    <Send size={16} color={theme.colors.surface} />
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.inputBorder,
        backgroundColor: theme.colors.surface,
    },
    backButton: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitleWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: theme.colors.heading,
    },
    chatContent: {
        paddingHorizontal: 14,
        paddingBottom: 12,
        gap: 10,
    },
    bubble: {
        maxWidth: '85%',
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    assistantBubble: {
        alignSelf: 'flex-start',
        backgroundColor: theme.colors.card,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: theme.colors.primary,
    },
    assistantText: {
        color: theme.colors.body,
        fontSize: 14,
        lineHeight: 20,
    },
    userText: {
        color: theme.colors.surface,
        fontSize: 14,
        lineHeight: 20,
    },
    loaderBubble: {
        minHeight: 42,
        justifyContent: 'center',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: theme.colors.inputBorder,
        backgroundColor: theme.colors.surface,
    },
    input: {
        flex: 1,
        minHeight: 44,
        maxHeight: 120,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: theme.colors.heading,
        backgroundColor: theme.colors.background,
    },
    sendButton: {
        width: 42,
        height: 42,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.primary,
    },
});
