import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Calendar, Activity, Moon, Utensils, Smile, Droplet } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const cardWidth = (width - 56) / 3; // 3 columns with gap and padding

const QuickActionItem = ({ id, label, color, icon: Icon, onClick }) => (
    <TouchableOpacity
        style={styles.card}
        onPress={() => onClick(id)}
        activeOpacity={0.7}
    >
        <View style={[styles.iconContainer, { backgroundColor: color }]}>
            <Icon size={24} color="white" />
        </View>
        <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
);

const QuickActions = ({ onAction }) => {
    const actions = [
        { id: 'period', label: 'Log Period', icon: Droplet, color: '#FF9A9E' },
        { id: 'symptoms', label: 'Symptoms', icon: Activity, color: '#A18CD1' },
        { id: 'mood', label: 'Mood', icon: Smile, color: '#FBC2EB' },
        { id: 'diet', label: 'Diet', icon: Utensils, color: '#84FAB0' },
        { id: 'sleep', label: 'Sleep', icon: Moon, color: '#8FD3F4' },
        { id: 'workout', label: 'Workout', icon: Calendar, color: '#FFD1FF' },
    ];

    return (
        <View style={styles.container}>
            {actions.map((action) => (
                <QuickActionItem
                    key={action.id}
                    {...action}
                    onClick={onAction}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 16,
        justifyContent: 'space-between',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 16,
        width: cardWidth,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    iconContainer: {
        padding: 12,
        borderRadius: 50,
        marginBottom: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        fontSize: 12,
        fontWeight: '500',
        color: '#4B5563',
        textAlign: 'center',
    },
});

export default QuickActions;
