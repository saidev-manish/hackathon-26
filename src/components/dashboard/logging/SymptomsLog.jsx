import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../Button';
import { Smile, Frown, AlertCircle } from 'lucide-react';

const SymptomsLog = ({ onClose }) => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);

    // Severity levels: 0 (None) to 3 (Severe)
    const [symptoms, setSymptoms] = useState({
        cramps: 0,
        acne: 0,
        headache: 0,
        fatigue: 0,
        bloating: 0
    });

    const handleSeverityChange = (symptom, value) => {
        setSymptoms(prev => ({ ...prev, [symptom]: value }));
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            await addDoc(collection(db, 'symptomLogs'), {
                userId: currentUser.uid,
                symptoms,
                timestamp: new Date()
            });
            onClose();
        } catch (error) {
            console.error("Error logging symptoms:", error);
        } finally {
            setLoading(false);
        }
    };

    const renderSeveritySelector = (key, label) => (
        <div style={{ marginBottom: '20px' }} key={key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontWeight: 500, color: 'var(--text-main)' }}>{label}</label>
                <span style={{ color: 'var(--primary-purple)', fontWeight: 600 }}>
                    {['None', 'Mild', 'Moderate', 'Severe'][symptoms[key]]}
                </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
                {[0, 1, 2, 3].map((level) => (
                    <button
                        key={level}
                        type="button"
                        onClick={() => handleSeverityChange(key, level)}
                        style={{
                            flex: 1,
                            padding: '8px',
                            borderRadius: '12px',
                            border: 'none',
                            background: symptoms[key] === level ? 'var(--primary-purple)' : '#F3F4F6',
                            color: symptoms[key] === level ? 'white' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            fontSize: '14px'
                        }}
                    >
                        {level === 0 ? 'None' : level}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div>
            <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px', color: 'var(--text-main)' }}>
                How are you feeling?
            </h3>

            {renderSeveritySelector('cramps', 'Cramps')}
            {renderSeveritySelector('headache', 'Headache')}
            {renderSeveritySelector('fatigue', 'Fatigue')}
            {renderSeveritySelector('acne', 'Acne')}
            {renderSeveritySelector('bloating', 'Bloating')}

            <div style={{ marginTop: '24px' }}>
                <Button onClick={handleSubmit} fullWidth disabled={loading}>
                    {loading ? 'Saving...' : 'Save Symptoms'}
                </Button>
            </div>
        </div>
    );
};

export default SymptomsLog;
