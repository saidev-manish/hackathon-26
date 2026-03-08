import { createContext, useContext, useState, useEffect } from 'react';
import { messaging } from '../firebase/config';
import { getToken, onMessage } from 'firebase/messaging';
import { useAuth } from './AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const NotificationContext = createContext();

export const useNotification = () => {
    return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [fcmToken, setFcmToken] = useState(null);
    const [notificationPermission, setNotificationPermission] = useState('default');
    const [reminders, setReminders] = useState(() => {
        const saved = localStorage.getItem('reminderSettings');
        return saved ? JSON.parse(saved) : {
            hydration: false,
            yoga: false,
            period: false
        };
    });

    useEffect(() => {
        localStorage.setItem('reminderSettings', JSON.stringify(reminders));
    }, [reminders]);

    // Hydration Reminder (Every 30 mins)
    useEffect(() => {
        if (!reminders.hydration) return;

        const interval = setInterval(() => {
            if (Notification.permission === 'granted') {
                new Notification("💧 Water Time!", {
                    body: "Stay hydrated! Take a sip of water.",
                    icon: '/logo192.png'
                });
            }
        }, 30 * 60 * 1000); // 30 minutes

        return () => clearInterval(interval);
    }, [reminders.hydration]);

    // Yoga Reminder (Daily at 7:00 AM)
    useEffect(() => {
        if (!reminders.yoga) return;

        const checkYogaTime = () => {
            const now = new Date();
            if (now.getHours() === 7 && now.getMinutes() === 0) {
                if (Notification.permission === 'granted') {
                    new Notification("🧘 Yoga Session", {
                        body: "Good morning! Time for your yoga session.",
                        icon: '/logo192.png'
                    });
                }
            }
        };

        const interval = setInterval(checkYogaTime, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [reminders.yoga]);

    // Period Prediction (Mock Logic for Demo)
    useEffect(() => {
        if (!reminders.period) return;

        // In a real app, we'd fetch the last period date from Firestore
        // For this demo, we'll just set a dummy check
        const checkPeriod = () => {
            // Logic to check date would go here
        };

        // Run once on load
        checkPeriod();
    }, [reminders.period]);

    const toggleReminder = (type) => {
        setReminders(prev => ({
            ...prev,
            [type]: !prev[type]
        }));
    };

    const requestPermission = async () => {
        try {
            const permission = await Notification.requestPermission();
            setNotificationPermission(permission);

            if (permission === 'granted') {
                // Get Token
                const token = await getToken(messaging, {
                    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
                });
                console.log('FCM Token:', token);
                setFcmToken(token);

                // Save token to user profile in Firestore if logged in
                if (currentUser && token) {
                    await updateDoc(doc(db, "users", currentUser.uid), {
                        fcmToken: token
                    });
                }
            }
        } catch (error) {
            console.error("Error requesting notification permission:", error);
        }
    };

    useEffect(() => {
        if (messaging) {
            const unsubscribe = onMessage(messaging, (payload) => {
                console.log('Message received. ', payload);
                // Customize notification handling here if needed
                new Notification(payload.notification.title, {
                    body: payload.notification.body,
                    icon: '/logo192.png'
                });
            });

            return () => unsubscribe();
        }
    }, []);

    const triggerTestNotification = (type = 'default') => {
        if (Notification.permission === 'granted') {
            let title = "Test Notification 🌸";
            let body = "This is how PulseCare notifications will appear!";

            if (type === 'hydration') {
                title = "💧 Water Time!";
                body = "Stay hydrated! Take a sip of water.";
            } else if (type === 'yoga') {
                title = "🧘 Yoga Session";
                body = "Good morning! Time for your yoga session.";
            } else if (type === 'period') {
                title = "📅 Cycle Alert";
                body = "Your period is predicted to start tomorrow.";
            }

            new Notification(title, {
                body: body,
                icon: '/logo192.png'
            });
        } else {
            alert("Please enable notifications first!");
        }
    };

    const value = {
        fcmToken,
        requestPermission,
        notificationPermission,
        triggerTestNotification,
        reminders,
        toggleReminder
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
