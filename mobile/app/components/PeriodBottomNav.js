import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Home, Wind, UsersRound, Settings } from 'lucide-react-native';
import { theme } from '../../styles/theme';

export default function PeriodBottomNav({ active = 'home' }) {
    const router = useRouter();

    const navItems = [
        { key: 'home', label: 'Home', icon: Home, route: '/period-dashboard' },
        { key: 'wellness', label: 'Wellness', icon: Wind, route: '/period-wellness' },
        { key: 'community', label: 'Community', icon: UsersRound, route: '/period-community' },
        { key: 'settings', label: 'Settings', icon: Settings, route: '/period-settings' },
    ];

    return (
        <View style={styles.bottomNav}>
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = active === item.key;
                return (
                    <TouchableOpacity
                        key={item.key}
                        style={styles.navItem}
                        activeOpacity={0.8}
                        onPress={() => router.replace(item.route)}
                    >
                        <Icon size={22} color={isActive ? theme.colors.primary : theme.colors.muted} />
                        <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{item.label}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    bottomNav: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 74,
        borderTopWidth: 1,
        borderTopColor: theme.colors.inputBorder,
        backgroundColor: theme.colors.surface,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingBottom: 6,
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        minWidth: 58,
    },
    navLabel: {
        fontSize: 11,
        color: theme.colors.muted,
        fontWeight: '600',
    },
    navLabelActive: {
        color: theme.colors.primary,
    },
});
