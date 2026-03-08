import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = ({
    label,
    error,
    icon,
    type = 'text',
    className,
    ...props
}) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === 'password';

    return (
        <div style={{ marginBottom: '16px' }} className={className}>
            {label && (
                <label
                    style={{
                        display: 'block',
                        marginBottom: '6px',
                        color: 'var(--text-main)',
                        fontWeight: 500,
                        fontSize: '14px'
                    }}
                >
                    {label}
                </label>
            )}
            <div style={{ position: 'relative' }}>
                <input
                    type={isPassword ? (showPassword ? 'text' : 'password') : type}
                    style={{
                        width: '100%',
                        padding: '14px 18px',
                        paddingRight: isPassword ? '44px' : '18px',
                        borderRadius: '16px',
                        border: error ? '1px solid var(--error-color)' : '1px solid transparent',
                        outline: 'none',
                        fontSize: '15px',
                        background: '#FFFFFF',
                        color: 'var(--text-main)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                        transition: 'all 0.2s ease',
                        ...((!error) && { ':focus': { boxShadow: '0 0 0 3px var(--secondary-purple)' } })
                    }}
                    onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(179, 157, 219, 0.3)'}
                    onBlur={(e) => e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)'}
                    {...props}
                />

                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                            position: 'absolute',
                            right: '14px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--secondary-purple)',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>
            {error && (
                <span style={{
                    fontSize: '12px',
                    color: 'var(--error-color)',
                    marginTop: '4px',
                    display: 'block'
                }}>
                    {error.message}
                </span>
            )}
        </div>
    );
};

export default Input;
