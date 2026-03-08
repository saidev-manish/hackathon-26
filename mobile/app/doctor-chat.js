import React, { useMemo, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Send } from 'lucide-react-native';
import { theme } from '../styles/theme';

export default function DoctorChatScreen() {
    const router = useRouter();
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        {
            id: 'd-1',
            sender: 'doctor',
            text: 'Hi, I’m Dr. Sarah Chen. Tell me what symptoms or concerns you want help with today.',
        },
    ]);

    const canSend = useMemo(() => input.trim().length > 0, [input]);

    const onSend = () => {
        const text = input.trim();
        if (!text) return;

        const userMsg = { id: `u-${Date.now()}`, sender: 'user', text };
        const doctorReply = {
            id: `d-${Date.now() + 1}`,
            sender: 'doctor',
            text: 'Thanks for sharing. I received your message and will guide you step by step.',
        };

        setMessages((prev) => [...prev, userMsg, doctorReply]);
        setInput('');
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.8}>
                        <ArrowLeft size={20} color={theme.colors.heading} />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>Dr. Sarah Chen</Text>
                        <Text style={styles.headerSub}>Private Chat</Text>
                    </View>
                </View>

                <ScrollView contentContainerStyle={styles.messagesContent}>
                    {messages.map((message) => (
                        <View
                            key={message.id}
                            style={[
                                styles.messageBubble,
                                message.sender === 'user' ? styles.userBubble : styles.doctorBubble,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.messageText,
                                    message.sender === 'user' ? styles.userMessageText : styles.doctorMessageText,
                                ]}
                            >
                                {message.text}
                            </Text>
                        </View>
                    ))}
                </ScrollView>

                <View style={styles.inputRow}>
                    <TextInput
                        style={styles.input}
                        placeholder="Type your message..."
                        placeholderTextColor={theme.colors.muted}
                        value={input}
                        onChangeText={setInput}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
                        onPress={onSend}
                        disabled={!canSend}
                        activeOpacity={0.8}
                    >
                        <Send size={18} color={theme.colors.buttonTextLight} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    flex: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.inputBorder,
        backgroundColor: theme.colors.surface,
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.card,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: theme.colors.heading,
    },
    headerSub: {
        fontSize: 12,
        color: theme.colors.primary,
        marginTop: 2,
    },
    messagesContent: {
        paddingHorizontal: 14,
        paddingVertical: 16,
        gap: 10,
        paddingBottom: 24,
    },
    messageBubble: {
        maxWidth: '85%',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    doctorBubble: {
        alignSelf: 'flex-start',
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: theme.colors.primary,
    },
    messageText: {
        fontSize: 14,
        lineHeight: 20,
    },
    doctorMessageText: {
        color: theme.colors.body,
    },
    userMessageText: {
        color: theme.colors.buttonTextLight,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: theme.colors.inputBorder,
        backgroundColor: theme.colors.surface,
        gap: 10,
    },
    input: {
        flex: 1,
        minHeight: 44,
        maxHeight: 120,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: theme.colors.heading,
        backgroundColor: theme.colors.card,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.primary,
    },
    sendButtonDisabled: {
        opacity: 0.45,
    },
});
