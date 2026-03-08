import React, { useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotification } from '../contexts/NotificationContext';
import { useRouter } from 'expo-router';
import { ArrowLeft, Trash2, CheckCheck, Bell, MessageSquare } from 'lucide-react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { theme } from '../styles/theme';

export default function NotificationsScreen() {
    const { notifications, markAllAsRead, clearNotifications } = useNotification();
    const { t } = useLanguage();
    const router = useRouter();

    useEffect(() => {
        // Mark as read when opening the screen
        markAllAsRead();
    }, []);

    const renderItem = ({ item }) => (
        <View style={[styles.notificationItem, !item.read && styles.unreadItem]}>
            <View style={styles.iconContainer}>
                <MessageSquare size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.contentContainer}>
                <Text style={styles.notifTitle}>{item.title}</Text>
                <Text style={styles.notifBody}>{item.body}</Text>
                <Text style={styles.notifDate}>
                    {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(item.date).toLocaleDateString()}
                </Text>
            </View>
            {!item.read && <View style={styles.unreadDot} />}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={theme.colors.heading} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('notifications') || 'Notifications'}</Text>
                <TouchableOpacity onPress={clearNotifications} style={styles.clearButton}>
                    <Trash2 size={20} color={theme.colors.secondaryText} />
                </TouchableOpacity>
            </View>

            {notifications.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconBg}>
                        <Bell size={48} color={theme.colors.muted} />
                    </View>
                    <Text style={styles.emptyTitle}>{t('noNotificationsYet')}</Text>
                    <Text style={styles.emptySubtitle}>
                        {t('notificationsEmptySubtitle')}
                    </Text>
                    <TouchableOpacity
                        style={styles.backHomeBtn}
                        onPress={() => router.replace('/dashboard')}
                    >
                        <Text style={styles.backHomeText}>{t('returnToDashboard')}</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
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
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.inputBorder,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.heading,
    },
    clearButton: {
        padding: 4,
    },
    listContent: {
        padding: 20,
    },
    notificationItem: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        ...theme.shadows.soft,
        alignItems: 'center',
    },
    unreadItem: {
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.primary,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: theme.colors.card,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    contentContainer: {
        flex: 1,
    },
    notifTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.heading,
        marginBottom: 4,
    },
    notifBody: {
        fontSize: 14,
        color: theme.colors.body,
        lineHeight: 20,
        marginBottom: 6,
    },
    notifDate: {
        fontSize: 12,
        color: theme.colors.muted,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.primary,
        marginLeft: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyIconBg: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        ...theme.shadows.soft,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.heading,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: theme.colors.body,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
    },
    backHomeBtn: {
        backgroundColor: theme.colors.primaryDark,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 16,
    },
    backHomeText: {
        color: theme.colors.surface,
        fontSize: 16,
        fontWeight: '600',
    }
});
