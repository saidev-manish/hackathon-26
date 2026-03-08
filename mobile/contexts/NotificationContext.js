import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import Constants from 'expo-constants';
import { db } from '../firebase/config';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const NotificationContext = createContext();
const REMINDER_SETTINGS_KEY = 'reminderSettings';
const REMINDER_NOTIFICATION_IDS_KEY = 'reminderNotificationIds';
const isExpoGo = Constants.executionEnvironment === 'storeClient';
const notificationsAvailable = Platform.OS !== 'web' && !isExpoGo;

let Notifications = null;
if (notificationsAvailable) {
    Notifications = require('expo-notifications');
}

if (notificationsAvailable && Notifications) {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
        }),
    });
}

export const NotificationProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [fcmToken, setFcmToken] = useState(null);
    const [notificationPermission, setNotificationPermission] = useState('undetermined');
    const [reminders, setReminders] = useState({
        hydration: false,
        yoga: false,
        period: false
    });
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const notificationListener = useRef();
    const responseListener = useRef();

    const ensureAndroidChannel = async () => {
        if (!notificationsAvailable || !Notifications || Platform.OS !== 'android') return;
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    };

    const getReminderNotificationIds = async () => {
        try {
            const raw = await AsyncStorage.getItem(REMINDER_NOTIFICATION_IDS_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            console.error('Failed to read reminder notification IDs', e);
            return {};
        }
    };

    const setReminderNotificationIds = async (nextIds) => {
        try {
            await AsyncStorage.setItem(REMINDER_NOTIFICATION_IDS_KEY, JSON.stringify(nextIds));
        } catch (e) {
            console.error('Failed to save reminder notification IDs', e);
        }
    };

    // Define all functions BEFORE useEffect calls
    const loadSettings = async () => {
        try {
            const savedSettings = await AsyncStorage.getItem(REMINDER_SETTINGS_KEY);
            if (savedSettings) setReminders(JSON.parse(savedSettings));

            const savedNotifications = await AsyncStorage.getItem('notificationHistory');
            if (savedNotifications) {
                const parsed = JSON.parse(savedNotifications);
                setNotifications(parsed);
                setUnreadCount(parsed.filter(n => !n.read).length);
            }
        } catch (e) {
            console.error("Failed to load settings or notifications", e);
        }
    };

    const getToken = async () => {
        if (!notificationsAvailable || !Notifications) return null;
        try {
            await ensureAndroidChannel();

            const projectId =
                Constants?.expoConfig?.extra?.eas?.projectId ||
                Constants?.easConfig?.projectId;

            const token = projectId
                ? (await Notifications.getExpoPushTokenAsync({ projectId })).data
                : (await Notifications.getExpoPushTokenAsync()).data;

            setFcmToken(token);
            return token;
        } catch (e) {
            console.error("Failed to get push token", e);
            return null;
        }
    };

    const checkPermission = async () => {
        if (!notificationsAvailable || !Notifications) return 'undetermined';
        const { status } = await Notifications.getPermissionsAsync();
        setNotificationPermission(status);
        if (status === 'granted') {
            await getToken();
        }
        return status;
    };

    const addNotificationToHistory = async (notification) => {
        const newNotif = {
            id: notification.request.identifier,
            title: notification.request.content.title,
            body: notification.request.content.body,
            date: new Date().toISOString(),
            read: false,
            data: notification.request.content.data
        };

        setNotifications(prev => {
            const updated = [newNotif, ...prev].slice(0, 50); // Keep last 50
            AsyncStorage.setItem('notificationHistory', JSON.stringify(updated));
            return updated;
        });
        setUnreadCount(prev => prev + 1);
    };

    const saveTokenToFirestore = async (token) => {
        if (!currentUser) return;
        if (!token) return;
        try {
            await setDoc(doc(db, 'users', currentUser.uid), {
                fcmToken: token,
                updatedAt: serverTimestamp()
            }, { merge: true });
        } catch (e) {
            console.error("Error saving token:", e);
        }
    };

    // NOW use these functions in useEffect
    useEffect(() => {
        loadSettings();

        if (notificationsAvailable && Notifications) {
            checkPermission();

            notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
                console.log('Notification received:', notification);
                addNotificationToHistory(notification);
            });

            responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
                console.log('Notification response:', response);
                // Optional: navigate to specific screen if needed
            });
        }

        return () => {
            if (notificationsAvailable && Notifications) {
                notificationListener.current && notificationListener.current.remove();
                responseListener.current && responseListener.current.remove();
            }
        };
    }, []);

    useEffect(() => {
        if (currentUser && fcmToken) {
            saveTokenToFirestore(fcmToken);
        }
    }, [currentUser, fcmToken]);

    const requestPermission = async () => {
        if (!notificationsAvailable || !Notifications) return 'denied';
        const { status } = await Notifications.requestPermissionsAsync();
        setNotificationPermission(status);
        if (status === 'granted') {
            await getToken();
        }
        return status;
    };

    const toggleReminder = async (type) => {
        const newReminders = { ...reminders, [type]: !reminders[type] };
        setReminders(newReminders);
        await AsyncStorage.setItem(REMINDER_SETTINGS_KEY, JSON.stringify(newReminders));

        if (notificationsAvailable && Notifications) {
            if (newReminders[type]) {
                await scheduleNotification(type);
            } else {
                await cancelNotification(type);
            }
        }
    };

    const scheduleNotification = async (type) => {
        await ensureAndroidChannel();
        await cancelNotification(type);

        let scheduledId = null;

        if (type === 'hydration') {
            scheduledId = await Notifications.scheduleNotificationAsync({
                content: {
                    title: "Time to hydrate! 💧",
                    body: "Stay healthy and keep your PCOD/POCS symptoms in check by drinking water.",
                    sound: true,
                    priority: Notifications.AndroidNotificationPriority.MAX,
                },
                trigger: {
                    type: 'timeInterval',
                    seconds: 300,
                    repeats: true,
                    channelId: 'default'
                },
            });
        } else if (type === 'yoga') {
            scheduledId = await Notifications.scheduleNotificationAsync({
                content: {
                    title: "Yoga Time Session 🧘",
                    body: "Gentle movement every 5 mins to stay active.",
                    sound: true,
                    priority: Notifications.AndroidNotificationPriority.MAX,
                },
                trigger: {
                    type: 'timeInterval',
                    seconds: 300,
                    repeats: true,
                    channelId: 'default'
                },
            });
        } else if (type === 'period') {
            scheduledId = await Notifications.scheduleNotificationAsync({
                content: {
                    title: "Cycle Check-in 🌸",
                    body: "How are you feeling today? Log your symptoms.",
                    sound: true,
                    priority: Notifications.AndroidNotificationPriority.MAX,
                },
                trigger: {
                    type: 'timeInterval',
                    seconds: 300,
                    repeats: true,
                    channelId: 'default'
                },
            });
        }

        if (scheduledId) {
            const existing = await getReminderNotificationIds();
            await setReminderNotificationIds({ ...existing, [type]: [scheduledId] });
        }
    };

    const cancelNotification = async (type) => {
        if (!notificationsAvailable || !Notifications) return;

        const existing = await getReminderNotificationIds();
        const ids = existing[type] || [];

        if (ids.length) {
            await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
        }

        await setReminderNotificationIds({ ...existing, [type]: [] });
    };

    const triggerTestNotification = async (type = 'test') => {
        if (!notificationsAvailable || !Notifications) {
            alert(type === 'test' ? "Instant Real-time Alert! 🔔" : `Smart Reminder: ${type.toUpperCase()} 🌸`);
            return;
        }
        await ensureAndroidChannel();
        await Notifications.scheduleNotificationAsync({
            content: {
                title: type === 'test' ? "Instant Real-time Alert! 🔔" : `Smart Reminder: ${type.toUpperCase()} 🌸`,
                body: "This notification is appearing in your System Bar right now! 🎐",
                sound: true,
                priority: Notifications.AndroidNotificationPriority.MAX,
            },
            trigger: Platform.OS === 'android' ? { channelId: 'default' } : null,
        });
    };

    const triggerHydrationNow = async () => {
        if (!notificationsAvailable || !Notifications) {
            alert('Drink water now 💧 Stay hydrated!');
            return;
        }

        await ensureAndroidChannel();
        await Notifications.scheduleNotificationAsync({
            content: {
                title: 'Drink Water Now 💧',
                body: 'Take a glass of water now to support your health.',
                sound: true,
                priority: Notifications.AndroidNotificationPriority.MAX,
            },
            trigger: Platform.OS === 'android' ? { channelId: 'default' } : null,
        });
    };

    const markAllAsRead = async () => {
        setNotifications(prev => {
            const updated = prev.map(n => ({ ...n, read: true }));
            AsyncStorage.setItem('notificationHistory', JSON.stringify(updated));
            return updated;
        });
        setUnreadCount(0);
    };

    const clearNotifications = async () => {
        setNotifications([]);
        setUnreadCount(0);
        await AsyncStorage.removeItem('notificationHistory');
    };

    return (
        <NotificationContext.Provider value={{
            fcmToken,
            notificationPermission,
            reminders,
            notifications,
            unreadCount,
            requestPermission,
            toggleReminder,
            triggerTestNotification,
            triggerHydrationNow,
            markAllAsRead,
            clearNotifications
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);
