import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../Button';
import Input from '../../Input';
import { Droplets, Flame } from 'lucide-react';

const DietLog = ({ onClose }) => {
    const { currentUser } = useAuth();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            await addDoc(collection(db, 'dietLogs'), {
                userId: currentUser.uid,
                waterIntake: Number(data.water), // in Liters or Glasses
                calories: Number(data.calories),
                timestamp: new Date()
            });
            onClose();
        } catch (error) {
            console.error("Error logging diet:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px', color: 'var(--text-main)' }}>
                Diet & Hydration
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <Droplets size={24} color="var(--primary-purple)" />
                <h4 style={{ margin: 0, color: 'var(--text-main)' }}>Water Intake</h4>
            </div>

            <Input
                label="Water (Glasses)"
                type="number"
                placeholder="e.g. 8"
                error={errors.water}
                {...register("water", { required: "Please enter water intake", min: 0 })}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', marginTop: '24px' }}>
                <Flame size={24} color="#EF4444" />
                <h4 style={{ margin: 0, color: 'var(--text-main)' }}>Calories</h4>
            </div>

            <Input
                label="Calories (Kcal)"
                type="number"
                placeholder="e.g. 2000"
                error={errors.calories}
                {...register("calories", { min: 0 })}
            />

            <div style={{ marginTop: '24px' }}>
                <Button type="submit" fullWidth disabled={loading}>
                    {loading ? 'Saving...' : 'Save Diet Log'}
                </Button>
            </div>
        </form>
    );
};

export default DietLog;
