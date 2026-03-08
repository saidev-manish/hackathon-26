import { motion } from 'framer-motion';
import { Calendar, Activity, Moon, Utensils, Smile, Droplet } from 'lucide-react';

const QuickActionCallback = ({ icon: Icon, label, color, onClick, delay }) => (
    <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay * 0.1 }}
        whileHover={{ scale: 1.05, boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        style={{
            background: 'white',
            border: 'none',
            borderRadius: '20px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            width: '100%'
        }}
    >
        <div style={{
            background: color,
            padding: '12px',
            borderRadius: '50%',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <Icon size={24} />
        </div>
        <span style={{ fontSize: '14px', fontWeight: '500', color: '#4B5563' }}>{label}</span>
    </motion.button>
);

const QuickActions = ({ onAction }) => {
    const actions = [
        { id: 'period', label: 'Log Period', icon: Droplet, color: '#FF9A9E' },
        { id: 'symptoms', label: 'Symptoms', icon: Activity, color: '#A18CD1' },
        { id: 'mood', label: 'Mood', icon: Smile, color: '#FBC2EB' },
        { id: 'diet', label: 'Diet', icon: Utensils, color: '#84FAB0' },
        { id: 'sleep', label: 'Sleep', icon: Moon, color: '#8FD3F4' },
        { id: 'workout', label: 'Workout', icon: Calendar, color: '#FFD1FF' }, // Using Calendar as placeholder for Workout if Activity is taken
    ];

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
            gap: '16px',
            marginTop: '24px'
        }}>
            {actions.map((action, index) => (
                <QuickActionCallback
                    key={action.id}
                    {...action}
                    delay={index}
                    onClick={() => onAction(action.id)}
                />
            ))}
        </div>
    );
};

export default QuickActions;
