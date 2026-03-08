import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import ErrorBoundary from '../components/ErrorBoundary';

export default function RootLayout() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <LanguageProvider>
                    <NotificationProvider>
                        <Stack screenOptions={{ headerShown: false }}>
                            <Stack.Screen name="index" />
                            <Stack.Screen name="login" />
                            <Stack.Screen name="signup" />
                            <Stack.Screen name="welcome" />
                            <Stack.Screen name="pcos-welcome" />
                            <Stack.Screen name="pcos-duration" />
                            <Stack.Screen name="pcos-duration-2-3" />
                            <Stack.Screen name="pcos-duration-4-5" />
                            <Stack.Screen name="pcos-duration-5-plus" />
                            <Stack.Screen name="pcos-diet-5-plus" />
                            <Stack.Screen name="pcos-exercise-5-plus" />
                            <Stack.Screen name="pcos-hydration-5-plus" />
                            <Stack.Screen name="pcos-weekly-food-5-plus" />
                            <Stack.Screen name="pcos-sos-5-plus" />
                            <Stack.Screen name="pcos-empty" />
                            <Stack.Screen name="pcos-wearable-devices" />
                            <Stack.Screen name="pcos-hydration" />
                            <Stack.Screen name="pcos-hydration-4-5" />
                            <Stack.Screen name="pcos-exercise" />
                            <Stack.Screen name="pcos-exercise-4-5" />
                            <Stack.Screen name="pcos-diet-4-5" />
                            <Stack.Screen name="pcos-diet" />
                            <Stack.Screen name="pcos-settings" />
                            <Stack.Screen name="period-dashboard" />
                            <Stack.Screen name="period-sleep" />
                            <Stack.Screen name="period-wellness" />
                            <Stack.Screen name="period-community" />
                            <Stack.Screen name="period-settings" />
                            <Stack.Screen name="dashboard-pcos-profile" />
                            <Stack.Screen name="education-video" />
                            <Stack.Screen name="profile-details" />
                            <Stack.Screen name="ai-assistant" />
                            <Stack.Screen name="doctor-chat" />
                            <Stack.Screen name="logging-hub" />
                            <Stack.Screen name="logging/[type]" />
                            <Stack.Screen name="games/tap-rush" />
                            <Stack.Screen name="games/memory-match" />
                            <Stack.Screen name="games/reflex-test" />
                            <Stack.Screen name="care-type" />
                            <Stack.Screen name="notifications" />
                            <Stack.Screen name="+not-found" />
                        </Stack>
                    </NotificationProvider>
                </LanguageProvider>
            </AuthProvider>
        </ErrorBoundary>
    );
}
