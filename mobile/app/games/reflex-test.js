import React, { useRef, useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../styles/theme';

export default function ReflexTestScreen() {
    const router = useRouter();
    const [status, setStatus] = useState('idle');
    const [result, setResult] = useState(null);
    const timerRef = useRef(null);
    const startRef = useRef(0);

    useEffect(() => () => timerRef.current && clearTimeout(timerRef.current), []);

    const startGame = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setResult(null);
        setStatus('wait');
        const waitMs = 1200 + Math.floor(Math.random() * 1800);
        timerRef.current = setTimeout(() => {
            startRef.current = Date.now();
            setStatus('go');
        }, waitMs);
    };

    const handleTap = () => {
        if (status === 'go') {
            setResult(Date.now() - startRef.current);
            setStatus('done');
            return;
        }

        if (status === 'wait') {
            if (timerRef.current) clearTimeout(timerRef.current);
            setStatus('early');
        }
    };

    const statusText =
        status === 'idle' ? 'Press Start' :
            status === 'wait' ? 'Wait for GREEN' :
                status === 'go' ? 'TAP NOW!' :
                    status === 'early' ? 'Too early! Try again.' : `${result} ms`;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Reflex Test</Text>
                <Text style={styles.subtitle}>Test your reaction speed.</Text>

                <TouchableOpacity
                    style={[
                        styles.reactionArea,
                        status === 'go' ? styles.areaGo : styles.areaWait,
                    ]}
                    onPress={handleTap}
                >
                    <Text style={styles.reactionText}>{statusText}</Text>
                </TouchableOpacity>

                <View style={styles.row}>
                    <TouchableOpacity style={styles.secondaryButton} onPress={startGame}>
                        <Text style={styles.secondaryText}>Start</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
                        <Text style={styles.secondaryText}>Back</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    content: { flex: 1, padding: 20, justifyContent: 'center', gap: 14 },
    title: { fontSize: 28, fontWeight: '800', color: theme.colors.heading, textAlign: 'center' },
    subtitle: { fontSize: 14, color: theme.colors.body, textAlign: 'center' },
    reactionArea: {
        borderRadius: 18,
        minHeight: 220,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        ...theme.shadows.soft,
    },
    areaWait: { backgroundColor: theme.colors.accentPink },
    areaGo: { backgroundColor: theme.colors.accentGreen },
    reactionText: { fontSize: 22, fontWeight: '800', color: theme.colors.heading, textAlign: 'center', paddingHorizontal: 16 },
    row: { flexDirection: 'row', gap: 10 },
    secondaryButton: {
        flex: 1,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.surface,
    },
    secondaryText: { fontSize: 14, fontWeight: '700', color: theme.colors.primary },
});
