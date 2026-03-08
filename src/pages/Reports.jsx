import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import MoodChart from '../components/charts/MoodChart';
import CycleHistoryChart from '../components/charts/CycleHistoryChart';
import SymptomChart from '../components/charts/SymptomChart';

const Reports = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [moodData, setMoodData] = useState([]);
    const [cycleData, setCycleData] = useState([]);
    const [symptomData, setSymptomData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser) return;

            try {
                // 1. Fetch Moods
                const moodRef = collection(db, 'moodLogs');
                const moodQ = query(moodRef, where('userId', '==', currentUser.uid), orderBy('timestamp', 'asc'));
                const moodSnapshot = await getDocs(moodQ);
                setMoodData(moodSnapshot.docs.map(doc => doc.data()));

                // 2. Fetch Cycles
                const periodRef = collection(db, 'periodHistory');
                const periodQ = query(periodRef, where('userId', '==', currentUser.uid), orderBy('startDate', 'asc'));
                const periodSnapshot = await getDocs(periodQ);
                setCycleData(periodSnapshot.docs.map(doc => doc.data()));

                // 3. Fetch Symptoms
                const symptomRef = collection(db, 'symptomLogs');
                const symptomQ = query(symptomRef, where('userId', '==', currentUser.uid), orderBy('timestamp', 'asc'));
                const symptomSnapshot = await getDocs(symptomQ);
                setSymptomData(symptomSnapshot.docs.map(doc => doc.data()));

            } catch (error) {
                console.error("Error fetching report data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUser]);

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', paddingBottom: '80px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <button
                    onClick={() => navigate('/dashboard')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '16px', color: 'var(--text-secondary)' }}
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 style={{ margin: 0, fontSize: '24px', color: 'var(--text-main)', fontWeight: 700 }}>
                    Health Insights
                </h1>
            </div>

            {loading ? (
                <div className="flex-center" style={{ height: '200px', color: 'var(--text-secondary)' }}>Loading charts...</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <MoodChart data={moodData} />
                    <CycleHistoryChart data={cycleData} />
                    <SymptomChart data={symptomData} />
                </div>
            )}
        </div>
    );
};

export default Reports;
