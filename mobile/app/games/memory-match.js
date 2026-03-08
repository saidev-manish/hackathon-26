import React, { useMemo, useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../styles/theme';

function buildDeck() {
    const base = ['🍎', '🥦', '🥑', '🍊'];
    return [...base, ...base]
        .map((emoji, index) => ({ id: `${emoji}-${index}`, emoji, matched: false }))
        .sort(() => Math.random() - 0.5);
}

export default function MemoryMatchScreen() {
    const router = useRouter();
    const [cards, setCards] = useState(buildDeck);
    const [flipped, setFlipped] = useState([]);
    const [moves, setMoves] = useState(0);
    const [locked, setLocked] = useState(false);

    const matchedCount = useMemo(() => cards.filter((item) => item.matched).length, [cards]);

    const onCardPress = (index) => {
        if (locked || flipped.includes(index) || cards[index].matched) return;

        const next = [...flipped, index];
        setFlipped(next);

        if (next.length === 2) {
            setMoves((prev) => prev + 1);
            const [first, second] = next;
            if (cards[first].emoji === cards[second].emoji) {
                setCards((prev) => prev.map((card, i) => (
                    i === first || i === second ? { ...card, matched: true } : card
                )));
                setFlipped([]);
            } else {
                setLocked(true);
                setTimeout(() => {
                    setFlipped([]);
                    setLocked(false);
                }, 650);
            }
        }
    };

    const resetGame = () => {
        setCards(buildDeck());
        setFlipped([]);
        setMoves(0);
        setLocked(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Memory Match</Text>
                <Text style={styles.subtitle}>Match all pairs in minimum moves.</Text>
                <Text style={styles.progress}>Moves: {moves} • Matched: {matchedCount}/8</Text>

                <View style={styles.grid}>
                    {cards.map((card, index) => {
                        const open = card.matched || flipped.includes(index);
                        return (
                            <TouchableOpacity
                                key={card.id}
                                style={[styles.cell, open && styles.cellOpen]}
                                onPress={() => onCardPress(index)}
                            >
                                <Text style={styles.cellText}>{open ? card.emoji : '?'}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <View style={styles.row}>
                    <TouchableOpacity style={styles.secondaryButton} onPress={resetGame}>
                        <Text style={styles.secondaryText}>Reset</Text>
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
    content: { flex: 1, padding: 20, gap: 12 },
    title: { fontSize: 28, fontWeight: '800', color: theme.colors.heading, textAlign: 'center' },
    subtitle: { fontSize: 14, color: theme.colors.body, textAlign: 'center' },
    progress: { fontSize: 13, fontWeight: '700', color: theme.colors.secondaryText, textAlign: 'center' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
    cell: {
        width: '23%',
        aspectRatio: 1,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.surface,
    },
    cellOpen: { backgroundColor: theme.colors.accentGreen, borderColor: theme.colors.primary },
    cellText: { fontSize: 22, fontWeight: '700', color: theme.colors.heading },
    row: { flexDirection: 'row', gap: 10, marginTop: 'auto' },
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
