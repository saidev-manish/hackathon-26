import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ children, onClick, type = 'button', variant = 'primary', disabled, fullWidth = false }) => {
    const baseStyle = {
        padding: '12px 24px',
        borderRadius: '12px',
        fontWeight: 600,
        fontSize: '14px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        width: fullWidth ? '100%' : 'auto',
        opacity: disabled ? 0.7 : 1,
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
    };

    const variants = {
        primary: {
            background: 'var(--btn-gradient)',
            color: 'white',
            boxShadow: '0 4px 12px rgba(123, 75, 183, 0.3)',
            borderRadius: '16px'
        },
        outline: {
            background: 'transparent',
            border: '1px solid var(--primary-purple)',
            color: 'var(--primary-purple)',
            borderRadius: '16px'
        },
        text: {
            background: 'transparent',
            color: 'var(--text-secondary)',
            padding: '8px'
        }
    };

    return (
        <motion.button
            whileTap={!disabled ? { scale: 0.98 } : {}}
            whileHover={!disabled ? { scale: 1.02, filter: 'brightness(1.05)' } : {}}
            type={type}
            onClick={onClick}
            disabled={disabled}
            style={{
                ...baseStyle,
                ...variants[variant],
                ...(disabled && { background: '#D1D5DB', transform: 'none' })
            }}
        >
            {children}
        </motion.button>
    );
};

export default Button;
