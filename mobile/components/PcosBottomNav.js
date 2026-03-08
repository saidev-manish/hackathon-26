import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { House, Dumbbell, Salad, Settings, Droplets } from 'lucide-react-native';
import { theme } from '../styles/theme';

export default function PcosBottomNav({ active = 'home', routeOverrides = {} }) {
    const router = useRouter();

    const defaultRoutes = {
        home: '/pcos-empty',
        hydration: '/pcos-hydration',
        exercise: '/pcos-exercise',
        diet: '/pcos-diet',
        settings: '/pcos-settings',
    };

    const navItems = [
        { key: 'home', label: 'Home', icon: House, route: '/pcos-empty' },
        { key: 'hydration', label: 'Hydration', icon: Droplets, route: '/pcos-hydration' },
        { key: 'exercise', label: 'Exercise', icon: Dumbbell, route: '/pcos-exercise' },
        { key: 'diet', label: 'Diet', icon: Salad, route: '/pcos-diet' },
        { key: 'settings', label: 'Settings', icon: Settings, route: '/pcos-settings' },
    ].map((item) => ({
        ...item,
        route: routeOverrides[item.key] || defaultRoutes[item.key] || item.route,
    }));

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
                        onPress={() => {
                            if (isActive) return;
                            router.replace(item.route);
                        }}
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
