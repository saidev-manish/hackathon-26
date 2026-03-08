import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import React from 'react';
import ReactDOM from 'react-dom'; // Required for Portal
import PeriodModal from './PeriodModal'; // Reuse existing logic if possible, or wrap it
import SymptomsLog from './logging/SymptomsLog';
import DietLog from './logging/DietLog';
import SleepLog from './logging/SleepLog';
import WorkoutLog from './logging/WorkoutLog';

const LoggingModal = ({ isOpen, onClose, type }) => {
    if (!isOpen) return null;

    const renderContent = () => {
        switch (type) {
            case 'period':
                // We pass onSave from props if needed, but for now PeriodModal handles its own save or we pass a handler
                // The current LoggingModal doesn't have a handleSavePeriod passed to it yet. 
                // We'll need to pass it from Dashboard.
                return <PeriodModal onClose={onClose} isOpen={true} embedded={true} onSave={props.onSavePeriod} />;
            case 'symptoms':
                return <SymptomsLog onClose={onClose} />;
            case 'diet':
                return <DietLog onClose={onClose} />;
            case 'sleep':
                return <SleepLog onClose={onClose} />;
            case 'workout':
                return <WorkoutLog onClose={onClose} />;
            default:
                return <div>Unknown log type</div>;
        }
    };

    return ReactDOM.createPortal(
        <AnimatePresence>
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
                    background: 'rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px'
                }}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        background: 'white',
                        padding: '32px',
                        borderRadius: '24px',
                        width: '100%',
                        maxWidth: '450px',
                        position: 'relative',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}
                >
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            background: '#F3F4F6',
                            border: 'none',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#4B5563'
                        }}
                    >
                        <X size={18} />
                    </button>

                    {renderContent()}

                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
};

export default LoggingModal;
