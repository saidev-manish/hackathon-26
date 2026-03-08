import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../styles/theme';

export default function TapRushScreen() {
    const router = useRouter();
    const [active, setActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(10);
    const [score, setScore] = useState(0);

    useEffect(() => {
        if (!active) return;
        if (timeLeft <= 0) {
            setActive(false);
            return;
        }

        const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
        return () => clearTimeout(timer);
    }, [active, timeLeft]);

    const startGame = () => {
        setScore(0);
        setTimeLeft(10);
        setActive(true);
    };

    const onTap = () => {
        if (!active || timeLeft <= 0) return;
        setScore((prev) => prev + 1);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Tap Rush 10s</Text>
                <Text style={styles.subtitle}>Tap as fast as you can before timer ends.</Text>
                <View style={styles.statsCard}>
                    <Text style={styles.stat}>Time: {timeLeft}s</Text>
                    <Text style={styles.stat}>Score: {score}</Text>
                </View>

                <TouchableOpacity style={styles.primaryButton} onPress={onTap}>
                    <Text style={styles.primaryText}>TAP!</Text>
                </TouchableOpacity>

                <View style={styles.row}>
                    <TouchableOpacity style={styles.secondaryButton} onPress={startGame}>
                        <Text style={styles.secondaryText}>{active ? 'Restart' : 'Start'}</Text>
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
    statsCard: {
        backgroundColor: theme.colors.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        padding: 14,
        gap: 6,
    },
    stat: { fontSize: 16, fontWeight: '700', color: theme.colors.heading, textAlign: 'center' },
    primaryButton: {
        borderRadius: 18,
        backgroundColor: theme.colors.primary,
        minHeight: 140,
        alignItems: 'center',
        justifyContent: 'center',
        ...theme.shadows.soft,
    },
    primaryText: { fontSize: 34, fontWeight: '900', color: theme.colors.surface },
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
