import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../styles/theme';
import PcosBottomNav from '../../components/PcosBottomNav';

export default function PcosSettingsScreen() {
    const { currentUser } = useAuth();
    const router = useRouter();

    useEffect(() => {
        let active = true;

        const enforcePcosRoute = async () => {
            if (!currentUser?.uid) return;
            const careType = await AsyncStorage.getItem(`careType:${currentUser.uid}`);
            if (!active) return;

            if (careType === 'period') {
                router.replace('/period-dashboard');
                return;
            }

            if (careType !== 'pcos') {
                router.replace('/care-type');
            }
        };

        enforcePcosRoute().catch((error) => {
            console.error('Failed to enforce PCOS settings route', error);
        });

        return () => {
            active = false;
        };
    }, [currentUser?.uid, router]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.screenBody}>
                <View style={styles.content}>
                    <Text style={styles.title}>PCOS Settings</Text>
                    <Text style={styles.subtitle}>This is a separate settings screen for PCOS flow.</Text>
                </View>
                <PcosBottomNav active="settings" />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    screenBody: {
        flex: 1,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingBottom: 86,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: theme.colors.heading,
    },
    subtitle: {
        marginTop: 8,
        fontSize: 14,
        color: theme.colors.body,
        textAlign: 'center',
    },
});
