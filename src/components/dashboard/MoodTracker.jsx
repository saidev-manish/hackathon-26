import { useState } from 'react';
import { motion } from 'framer-motion';

const moods = [
    { emoji: '😖', label: 'Terrible', value: 1, color: '#FFB7B2' },
    { emoji: '😞', label: 'Bad', value: 2, color: '#FFDAC1' },
    { emoji: '😐', label: 'Okay', value: 3, color: '#E2F0CB' },
    { emoji: '🙂', label: 'Good', value: 4, color: '#B5EAD7' },
    { emoji: '🤩', label: 'Great', value: 5, color: '#C7CEEA' },
];

const MoodTracker = ({ onSave }) => {
    const [selectedMood, setSelectedMood] = useState(null);

    const handleMoodSelect = (mood) => {
        setSelectedMood(mood.value);
        onSave(mood);
    };

    return (
        <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '24px',
            marginTop: '24px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '18px', color: '#1F2937' }}>How are you feeling today?</h3>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '10px'
            }}>
                {moods.map((mood) => (
                    <motion.button
                        key={mood.value}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleMoodSelect(mood)}
                        style={{
                            background: selectedMood === mood.value ? mood.color : '#F3F4F6',
                            border: selectedMood === mood.value ? `2px solid ${mood.color}` : 'none',
                            borderRadius: '16px',
                            padding: '12px',
                            flex: 1,
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        <span style={{ fontSize: '24px' }}>{mood.emoji}</span>
                        <span style={{ fontSize: '12px', color: '#4B5563' }}>{mood.label}</span>
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default MoodTracker;
