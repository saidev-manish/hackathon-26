import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../Button';
import Input from '../../Input';
import { Moon, Star } from 'lucide-react';

const SleepLog = ({ onClose }) => {
    const { currentUser } = useAuth();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const [quality, setQuality] = useState('Neutral');

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            await addDoc(collection(db, 'sleepLogs'), {
                userId: currentUser.uid,
                hours: Number(data.hours),
                quality,
                timestamp: new Date()
            });
            onClose();
        } catch (error) {
            console.error("Error logging sleep:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px', color: 'var(--text-main)' }}>
                Sleep Tracking
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <Moon size={24} color="var(--primary-purple)" />
                <h4 style={{ margin: 0, color: 'var(--text-main)' }}>Duration</h4>
            </div>

            <Input
                label="Hours slept"
                type="number"
                step="0.5"
                placeholder="e.g. 7.5"
                error={errors.hours}
                {...register("hours", { required: "Please enter hours slept", min: 0, max: 24 })}
            />

            <div style={{ marginTop: '24px', marginBottom: '16px' }}>
                <label style={{ fontWeight: 500, color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Quality</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {['Poor', 'Neutral', 'Good', 'Excellent'].map((q) => (
                        <button
                            key={q}
                            type="button"
                            onClick={() => setQuality(q)}
                            style={{
                                flex: 1,
                                padding: '8px',
                                borderRadius: '12px',
                                border: '1px solid ' + (quality === q ? 'var(--primary-purple)' : '#E5E7EB'),
                                background: quality === q ? 'rgba(106, 62, 161, 0.1)' : 'white',
                                color: quality === q ? 'var(--primary-purple)' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: quality === q ? 600 : 400
                            }}
                        >
                            {q}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ marginTop: '24px' }}>
                <Button type="submit" fullWidth disabled={loading}>
                    {loading ? 'Saving...' : 'Save Sleep Log'}
                </Button>
            </div>
        </form>
    );
};

export default SleepLog;
