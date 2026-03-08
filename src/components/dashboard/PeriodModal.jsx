import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../Button';
import Input from '../Input';
import { X } from 'lucide-react';

const PeriodModal = ({ isOpen, onClose, onSave, embedded = false }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ startDate, endDate });
        onClose();
    };

    const content = (
        <div style={{ width: '100%' }}>
            {!embedded && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ margin: 0, fontSize: '20px' }}>Log Period</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                        <X size={24} />
                    </button>
                </div>
            )}
            {embedded && (
                <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px', color: 'var(--text-main)' }}>
                    Log Period
                </h3>
            )}

            <form onSubmit={handleSubmit}>
                <Input
                    label="Start Date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                />
                <Input
                    label="End Date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                />
                <div style={{ marginTop: '24px' }}>
                    <Button type="submit" fullWidth>Save Log</Button>
                </div>
            </form>
        </div>
    );

    if (embedded) return content;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0,0,0,0.5)',
                            zIndex: 40,
                            backdropFilter: 'blur(4px)'
                        }}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        style={{
                            position: 'fixed',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            background: 'white',
                            padding: '30px',
                            borderRadius: '24px',
                            width: '90%',
                            maxWidth: '400px',
                            zIndex: 50,
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                        }}
                    >
                        {content}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default PeriodModal;
