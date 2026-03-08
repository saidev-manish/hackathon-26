import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import Button from '../components/Button';
import { LogOut, Bell, Settings } from 'lucide-react';
import CycleCard from '../components/dashboard/CycleCard';
import QuickActions from '../components/dashboard/QuickActions';
import MoodTracker from '../components/dashboard/MoodTracker';
import LoggingModal from '../components/dashboard/LoggingModal';
import InsightsSection from '../components/dashboard/InsightsSection';
import { analyzeCycleIrregularity, analyzePCOSRisk, analyzeMoodPatterns } from '../utils/insights';

const Dashboard = () => {
    const { currentUser, logout } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [activeLogType, setActiveLogType] = useState(null); // 'period', 'symptoms', 'diet', 'sleep', 'workout'
    const [cycleData, setCycleData] = useState({
        currentDay: 1,
        daysUntilNextPeriod: 28,
        isFertile: false
    });
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

    const [insights, setInsights] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            if (!currentUser) return;
            await fetchCycleData();
            await fetchInsightsData();
        };
        loadData();
    }, [currentUser]);

    const fetchCycleData = async () => {
        if (!currentUser) return;

        try {
            // Fetch last period for Card
            const periodsRef = collection(db, 'periodHistory');
            const q = query(
                periodsRef,
                where('userId', '==', currentUser.uid),
                orderBy('startDate', 'desc'),
                limit(1)
            );

            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const lastPeriod = querySnapshot.docs[0].data();
                calculateCycleStats(new Date(lastPeriod.startDate));
            }
        } catch (error) {
            console.error("Error fetching cycle data:", error);
        }
    };

    const fetchInsightsData = async () => {
        try {
            // 1. Fetch History (Last 6)
            const periodsRef = collection(db, 'periodHistory');
            const periodsQ = query(periodsRef, where('userId', '==', currentUser.uid), orderBy('startDate', 'desc'), limit(6));
            const periodsSnapshot = await getDocs(periodsQ);
            const periodHistory = periodsSnapshot.docs.map(doc => doc.data());

            // 2. Fetch Recent Symptoms (Last 30 days) - Simplified: limit 50 recent logs
            const symptomsRef = collection(db, 'symptomLogs');
            const symptomsQ = query(symptomsRef, where('userId', '==', currentUser.uid), orderBy('timestamp', 'desc'), limit(50));
            const symptomsSnapshot = await getDocs(symptomsQ);
            const symptomLogs = symptomsSnapshot.docs.map(doc => doc.data());

            // 3. Fetch Recent Moods
            const moodRef = collection(db, 'moodLogs');
            const moodQ = query(moodRef, where('userId', '==', currentUser.uid), orderBy('timestamp', 'desc'), limit(50));
            const moodSnapshot = await getDocs(moodQ);
            const moodLogs = moodSnapshot.docs.map(doc => doc.data());

            // Analyze
            const cycleAnalysis = analyzeCycleIrregularity(periodHistory);
            const pcosRisk = analyzePCOSRisk(symptomLogs, cycleAnalysis);
            const moodAnalysis = analyzeMoodPatterns(moodLogs, periodHistory);

            setInsights({ cycleAnalysis, pcosRisk, moodAnalysis });

        } catch (error) {
            console.error("Error calculating insights:", error);
        }
    };

    const calculateCycleStats = (startDate) => {
        const today = new Date();
        const diffTime = Math.abs(today - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Simple 28-day cycle assumption for now
        const cycleLength = 28;
        const daysUntil = cycleLength - (diffDays % cycleLength);

        // Fertile window approx days 11-16
        const currentDay = (diffDays % cycleLength) || 1;
        const isFertile = currentDay >= 11 && currentDay <= 16;

        setCycleData({
            currentDay,
            daysUntilNextPeriod: daysUntil,
            isFertile
        });
    };

    const handleAction = (actionId) => {
        setActiveLogType(actionId);
    };

    const handleSavePeriod = async ({ startDate, endDate }) => {
        try {
            await addDoc(collection(db, 'periodHistory'), {
                userId: currentUser.uid,
                startDate,
                endDate,
                createdAt: new Date().toISOString()
            });
            fetchCycleData(); // Refresh data
        } catch (error) {
            console.error("Error saving period log:", error);
        }
    };

    const handleSaveMood = async (mood) => {
        try {
            await addDoc(collection(db, 'moodLogs'), {
                userId: currentUser.uid,
                mood: mood.value,
                label: mood.label,
                timestamp: new Date().toISOString()
            });
            console.log("Mood saved!");
        } catch (error) {
            console.error("Error saving mood:", error);
        }
    };

    async function handleLogout() {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    }

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', paddingBottom: '80px' }}>
            {/* Dashboard Content */}
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px',
                background: 'white',
                padding: '24px',
                borderRadius: '24px',
                boxShadow: 'var(--shadow-soft)'
            }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '26px', color: 'var(--text-main)', fontWeight: 700 }}>
                        {t('hi')}, {currentUser?.displayName || currentUser?.email?.split('@')[0]} <span style={{ fontSize: '24px' }}>🌸</span>
                    </h1>
                    <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '15px' }}>
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                        style={{
                            background: notificationsEnabled ? '#FEE2E2' : '#F3F4F6',
                            border: 'none',
                            borderRadius: '16px',
                            width: '44px',
                            height: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: notificationsEnabled ? '#EF4444' : '#6B7280',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Bell size={20} />
                    </button>
                    <button
                        onClick={() => navigate('/settings')}
                        style={{
                            background: 'white',
                            border: '1px solid #E5E7EB',
                            borderRadius: '16px',
                            width: '44px',
                            height: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#6B7280',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Settings size={20} />
                    </button>
                </div>
            </header>

            <CycleCard {...cycleData} />

            <InsightsSection insights={insights} />

            <div style={{ marginTop: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--text-main)', fontWeight: 600 }}>{t('quickActions')}</h3>
                    <div>
                        <button
                            onClick={() => navigate('/reports')}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--primary-purple)',
                                fontWeight: 600,
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            {t('viewReports')} &rarr;
                        </button>
                        <button
                            onClick={() => navigate('/education')}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-secondary)',
                                fontWeight: 500,
                                cursor: 'pointer',
                                fontSize: '14px',
                                marginLeft: '16px'
                            }}
                        >
                            {t('learn')} &rarr;
                        </button>
                    </div>
                </div>
                <QuickActions onAction={handleAction} />
            </div>

            <MoodTracker onSave={handleSaveMood} />

            <LoggingModal
                isOpen={!!activeLogType}
                type={activeLogType}
                onClose={() => setActiveLogType(null)}
                onSavePeriod={handleSavePeriod}
            />
        </div>
    );
};

export default Dashboard;
