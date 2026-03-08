import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Bell, Globe, Trash2, LogOut } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import { updateProfile, deleteUser } from 'firebase/auth';

const Settings = () => {
    const { currentUser, logout } = useAuth();
    const { language, changeLanguage, t } = useLanguage();
    const { requestPermission, notificationPermission, triggerTestNotification, fcmToken, reminders, toggleReminder } = useNotification();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [displayName, setDisplayName] = useState(currentUser?.displayName || "");
    const [notifications, setNotifications] = useState({
        email: true,
        push: false
    });

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await updateProfile(currentUser, { displayName });
            alert(t('profileUpdateSuccess'));
        } catch (error) {
            console.error("Error updating profile:", error);
            alert(t('profileUpdateFail'));
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm(t('deleteConfirm'))) {
            try {
                await deleteUser(currentUser);
                navigate('/signup');
            } catch (error) {
                console.error("Error deleting account:", error);
                alert(t('deleteAccountFail'));
            }
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error(t('logoutFail'), error);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', paddingBottom: '80px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <button
                    onClick={() => navigate('/dashboard')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '16px', color: 'var(--text-secondary)' }}
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 style={{ margin: 0, fontSize: '24px', color: 'var(--text-main)', fontWeight: 700 }}>
                    {t('settings')}
                </h1>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Profile Section */}
                <section style={{ background: 'white', padding: '24px', borderRadius: '24px', boxShadow: 'var(--shadow-soft)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <User size={24} color="var(--primary-purple)" />
                        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>{t('profile')}</h2>
                    </div>
                    <form onSubmit={handleUpdateProfile}>
                        <Input
                            label={t('displayName')}
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                        />
                        <div style={{ marginTop: '16px' }}>
                            <Button type="submit" disabled={loading}>{t('updateProfile')}</Button>
                        </div>
                    </form>
                </section>

                {/* Notifications Section */}
                <section style={{ background: 'white', padding: '24px', borderRadius: '24px', boxShadow: 'var(--shadow-soft)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <Bell size={24} color="var(--primary-purple)" />
                        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>{t('notifications')}</h2>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <span style={{ color: 'var(--text-main)' }}>{t('emailNotifications')}</span>
                        <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '50px', height: '28px' }}>
                            <input
                                type="checkbox"
                                checked={notifications.email}
                                onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                                style={{ opacity: 0, width: 0, height: 0 }}
                            />
                            <div className="slider round" style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#E5E7EB', transition: '.4s', borderRadius: '34px' }}>
                                <span style={{ position: 'absolute', content: "", height: '22px', width: '22px', left: notifications.email ? 'calc(100% - 25px)' : '3px', bottom: '3px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                            </div>
                            <style>{`
                                input:checked + .slider { background-color: var(--primary-purple); }
                            `}</style>
                        </label>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-main)' }}>{t('pushNotifications')}</span>
                        <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '50px', height: '28px' }}>
                            <input
                                type="checkbox"
                                checked={notifications.push || notificationPermission === 'granted'}
                                onChange={async (e) => {
                                    if (e.target.checked) {
                                        await requestPermission();
                                        setNotifications({ ...notifications, push: true });
                                    } else {
                                        setNotifications({ ...notifications, push: false });
                                    }
                                }}
                                style={{ opacity: 0, width: 0, height: 0 }}
                            />
                            <div className="slider round" style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#E5E7EB', transition: '.4s', borderRadius: '34px' }}>
                                <span style={{ position: 'absolute', content: "", height: '22px', width: '22px', left: (notifications.push || notificationPermission === 'granted') ? 'calc(100% - 25px)' : '3px', bottom: '3px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                            </div>
                        </label>
                    </div>
                    {notificationPermission === 'granted' && (
                        <div style={{ marginTop: '16px' }}>
                            <Button
                                onClick={triggerTestNotification}
                                style={{
                                    fontSize: '14px',
                                    padding: '8px 16px',
                                    background: '#F3F4F6',
                                    color: 'var(--primary-purple)',
                                    marginBottom: '8px'
                                }}
                            >
                                🔔 Send Test Notification
                            </Button>
                            {!fcmToken && (
                                <p style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px' }}>
                                    (Token not generated. Check console for missing VAPID key)
                                </p>
                            )}
                        </div>
                    )}
                </section>

                {/* Smart Reminders Section */}
                <section style={{ background: 'white', padding: '24px', borderRadius: '24px', boxShadow: 'var(--shadow-soft)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <Bell size={24} color="var(--primary-purple)" />
                        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Smart Reminders</h2>
                    </div>

                    {/* Hydration */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div>
                            <span style={{ display: 'block', color: 'var(--text-main)', fontWeight: 500 }}>💧 Hydration</span>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Remind every 30 mins</span>
                            <button
                                onClick={() => triggerTestNotification('hydration')}
                                style={{
                                    border: 'none',
                                    background: 'none',
                                    color: 'var(--primary-purple)',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    padding: '0',
                                    marginLeft: '8px'
                                }}
                            >
                                Test This
                            </button>
                        </div>
                        <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '50px', height: '28px' }}>
                            <input
                                type="checkbox"
                                checked={reminders.hydration}
                                onChange={async (e) => {
                                    if (e.target.checked && notificationPermission !== 'granted') {
                                        await requestPermission();
                                    }
                                    if (Notification.permission === 'granted' || !e.target.checked) {
                                        toggleReminder('hydration');
                                    }
                                }}
                                style={{ opacity: 0, width: 0, height: 0 }}
                            />
                            <div className="slider round" style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#E5E7EB', transition: '.4s', borderRadius: '34px' }}>
                                <span style={{ position: 'absolute', content: "", height: '22px', width: '22px', left: reminders.hydration ? 'calc(100% - 25px)' : '3px', bottom: '3px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                            </div>
                        </label>
                    </div>

                    {/* Yoga */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div>
                            <span style={{ display: 'block', color: 'var(--text-main)', fontWeight: 500 }}>🧘 Yoga Session</span>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Daily at 7:00 AM</span>
                            <button
                                onClick={() => triggerTestNotification('yoga')}
                                style={{
                                    border: 'none',
                                    background: 'none',
                                    color: 'var(--primary-purple)',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    padding: '0',
                                    marginLeft: '8px'
                                }}
                            >
                                Test This
                            </button>
                        </div>
                        <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '50px', height: '28px' }}>
                            <input
                                type="checkbox"
                                checked={reminders.yoga}
                                onChange={async (e) => {
                                    if (e.target.checked && notificationPermission !== 'granted') {
                                        await requestPermission();
                                    }
                                    if (Notification.permission === 'granted' || !e.target.checked) {
                                        toggleReminder('yoga');
                                    }
                                }}
                                style={{ opacity: 0, width: 0, height: 0 }}
                            />
                            <div className="slider round" style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#E5E7EB', transition: '.4s', borderRadius: '34px' }}>
                                <span style={{ position: 'absolute', content: "", height: '22px', width: '22px', left: reminders.yoga ? 'calc(100% - 25px)' : '3px', bottom: '3px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                            </div>
                        </label>
                    </div>

                    {/* Period Prediction */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <span style={{ display: 'block', color: 'var(--text-main)', fontWeight: 500 }}>📅 Cycle Prediction</span>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>1 day before period</span>
                            <button
                                onClick={() => triggerTestNotification('period')}
                                style={{
                                    border: 'none',
                                    background: 'none',
                                    color: 'var(--primary-purple)',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    padding: '0',
                                    marginLeft: '8px'
                                }}
                            >
                                Test This
                            </button>
                        </div>
                        <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '50px', height: '28px' }}>
                            <input
                                type="checkbox"
                                checked={reminders.period}
                                onChange={async (e) => {
                                    if (e.target.checked && notificationPermission !== 'granted') {
                                        await requestPermission();
                                    }
                                    if (Notification.permission === 'granted' || !e.target.checked) {
                                        toggleReminder('period');
                                    }
                                }}
                                style={{ opacity: 0, width: 0, height: 0 }}
                            />
                            <div className="slider round" style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#E5E7EB', transition: '.4s', borderRadius: '34px' }}>
                                <span style={{ position: 'absolute', content: "", height: '22px', width: '22px', left: reminders.period ? 'calc(100% - 25px)' : '3px', bottom: '3px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                            </div>
                        </label>
                    </div>
                </section>

                {/* Language Section */}
                <section style={{ background: 'white', padding: '24px', borderRadius: '24px', boxShadow: 'var(--shadow-soft)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <Globe size={24} color="var(--primary-purple)" />
                        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>{t('language')}</h2>
                    </div>
                    <select
                        value={language}
                        onChange={(e) => changeLanguage(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '12px',
                            border: '1px solid #E5E7EB',
                            outline: 'none',
                            fontSize: '15px'
                        }}
                    >
                        <option value="en">English</option>
                        <option value="hi">Hindi (हिंदी)</option>
                        <option value="te">Telugu (తెలుగు)</option>
                    </select>
                </section>

                {/* Account Actions */}
                <section style={{ background: 'white', padding: '24px', borderRadius: '24px', boxShadow: 'var(--shadow-soft)' }}>
                    <h2 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: 600, color: 'var(--text-main)' }}>{t('account')}</h2>

                    <button
                        onClick={handleLogout}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            background: '#F3F4F6',
                            color: 'var(--text-main)',
                            border: 'none',
                            width: '100%',
                            padding: '16px',
                            borderRadius: '16px',
                            fontSize: '16px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            marginBottom: '12px'
                        }}
                    >
                        <LogOut size={20} />
                        {t('logOut')}
                    </button>

                    <button
                        onClick={handleDeleteAccount}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            background: '#FEE2E2',
                            color: '#B91C1C',
                            border: 'none',
                            width: '100%',
                            padding: '16px',
                            borderRadius: '16px',
                            fontSize: '16px',
                            fontWeight: 500,
                            cursor: 'pointer'
                        }}
                    >
                        <Trash2 size={20} />
                        {t('deleteAccount')}
                    </button>
                </section>
            </div>
        </div>
    );
};

export default Settings;
