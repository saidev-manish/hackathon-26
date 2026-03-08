import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { ArrowLeft, Send } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';

const ForgotPassword = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { resetPassword } = useAuth();
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function onSubmit(data) {
        try {
            setMessage('');
            setError('');
            setLoading(true);
            await resetPassword(data.email);
            setMessage('Check your inbox for further instructions');
        } catch (err) {
            setError('Failed to reset password. ' + err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="full-screen flex-center" style={{ padding: '20px' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    padding: '40px',
                    borderRadius: '24px',
                    width: '100%',
                    maxWidth: '400px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    backdropFilter: 'blur(10px)'
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '24px', color: 'var(--text-main)', marginBottom: '8px' }}>Password Reset</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Enter your email to receive reset instructions</p>
                </div>

                {error && (
                    <div style={{
                        background: '#FEE2E2',
                        color: '#B91C1C',
                        padding: '12px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        fontSize: '14px'
                    }}>
                        {error}
                    </div>
                )}

                {message && (
                    <div style={{
                        background: '#D1FAE5',
                        color: '#065F46',
                        padding: '12px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        fontSize: '14px'
                    }}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                    <Input
                        label="Email"
                        type="email"
                        placeholder="name@example.com"
                        error={errors.email}
                        {...register("email", {
                            required: "Email is required",
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: "Invalid email address"
                            }
                        })}
                    />

                    <Button type="submit" fullWidth disabled={loading}>
                        {loading ? 'Sending...' : (
                            <>
                                Reset Password <Send size={18} />
                            </>
                        )}
                    </Button>
                </form>

                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    <Link
                        to="/login"
                        style={{
                            color: 'var(--primary-color)',
                            fontWeight: 600,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        <ArrowLeft size={16} /> Back to Login
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
