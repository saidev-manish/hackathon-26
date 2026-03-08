import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../Button';
import Input from '../../Input';
import { Activity } from 'lucide-react';

const WorkoutLog = ({ onClose }) => {
    const { currentUser } = useAuth();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const [intensity, setIntensity] = useState('Medium');

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            await addDoc(collection(db, 'workoutLogs'), {
                userId: currentUser.uid,
                type: data.type,
                duration: Number(data.duration),
                intensity,
                timestamp: new Date()
            });
            onClose();
        } catch (error) {
            console.error("Error logging workout:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px', color: 'var(--text-main)' }}>
                Workout Details
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <Activity size={24} color="var(--primary-purple)" />
                <h4 style={{ margin: 0, color: 'var(--text-main)' }}>Activity</h4>
            </div>

            <Input
                label="Workout Type"
                placeholder="e.g. Yoga, Running, HIIT"
                error={errors.type}
                {...register("type", { required: "Please enter workout type" })}
            />

            <Input
                label="Duration (minutes)"
                type="number"
                placeholder="e.g. 30"
                error={errors.duration}
                {...register("duration", { required: "Please enter duration", min: 1 })}
            />

            <div style={{ marginTop: '24px', marginBottom: '16px' }}>
                <label style={{ fontWeight: 500, color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Intensity</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {['Low', 'Medium', 'High'].map((level) => (
                        <button
                            key={level}
                            type="button"
                            onClick={() => setIntensity(level)}
                            style={{
                                flex: 1,
                                padding: '8px',
                                borderRadius: '12px',
                                border: '1px solid ' + (intensity === level ? 'var(--primary-purple)' : '#E5E7EB'),
                                background: intensity === level ? 'rgba(106, 62, 161, 0.1)' : 'white',
                                color: intensity === level ? 'var(--primary-purple)' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: intensity === level ? 600 : 400
                            }}
                        >
                            {level}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ marginTop: '24px' }}>
                <Button type="submit" fullWidth disabled={loading}>
                    {loading ? 'Saving...' : 'Save Workout'}
                </Button>
            </div>
        </form>
    );
};

export default WorkoutLog;
