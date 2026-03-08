import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, ArrowRight, Check, X } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';

const Signup = () => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const { signup, loginWithGoogle } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const password = watch("password", "");

    // Password Validation Checks
    const hasMinLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);

    async function onSubmit(data) {
        try {
            setError('');
            setLoading(true);

            // Separate auth data from user profile data
            const { email, password, confirmPassword, ...profileData } = data;
            profileData.age = Number(profileData.age);

            await signup(email, password, profileData);
            navigate('/dashboard');
        } catch (err) {
            setError('Failed to create an account. ' + err.message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const handleGoogleLogin = async () => {
        try {
            setError('');
            setLoading(true);
            const result = await loginWithGoogle();
            if (!result) {
                return;
            }
            navigate('/dashboard');
        } catch (err) {
            setError('Failed to sign up with Google.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'relative',
            minHeight: '100vh',
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px'
        }}>
            {/* Abstract Background Shapes */}
            <div style={{
                position: 'absolute',
                top: '-15%',
                right: '-10%',
                width: '700px',
                height: '700px',
                background: 'linear-gradient(135deg, rgba(224, 195, 252, 0.4) 0%, rgba(142, 197, 252, 0.4) 100%)',
                borderRadius: '50%',
                filter: 'blur(80px)',
                pointerEvents: 'none'
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-15%',
                left: '-10%',
                width: '600px',
                height: '600px',
                background: 'linear-gradient(135deg, rgba(255, 154, 158, 0.3) 0%, rgba(254, 207, 239, 0.3) 100%)',
                borderRadius: '50%',
                filter: 'blur(80px)',
                pointerEvents: 'none'
            }} />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                    background: 'rgba(255, 255, 255, 0.85)',
                    padding: '40px',
                    borderRadius: '32px',
                    width: '100%',
                    maxWidth: '500px',
                    boxShadow: 'var(--shadow-soft)',
                    backdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255, 255, 255, 0.8)',
                    position: 'relative',
                    zIndex: 10,
                    margin: '20px 0'
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    {/* Auth Tabs */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '24px',
                        marginBottom: '24px',
                        borderBottom: '2px solid rgba(0,0,0,0.05)',
                        paddingBottom: '0'
                    }}>
                        <Link
                            to="/login"
                            style={{
                                paddingBottom: '12px',
                                borderBottom: '2px solid transparent',
                                color: 'var(--text-secondary)',
                                fontWeight: 500,
                                textDecoration: 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            Sign In
                        </Link>
                        <div style={{ paddingBottom: '12px', borderBottom: '2px solid var(--primary-purple)', color: 'var(--primary-purple)', fontWeight: 600, cursor: 'default' }}>
                            Sign Up
                        </div>
                    </div>

                    <h2 style={{ fontSize: '28px', color: 'var(--text-main)', marginBottom: '8px', fontWeight: '700' }}>Create Account</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Join PulseCare for a healthier journey</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        style={{
                            background: '#FEE2E2',
                            color: '#B91C1C',
                            padding: '12px',
                            borderRadius: '16px',
                            marginBottom: '24px',
                            fontSize: '14px',
                            textAlign: 'center',
                            border: '1px solid #FECACA'
                        }}
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                    <Input
                        label="Full Name"
                        placeholder="Jane Doe"
                        error={errors.name}
                        {...register("name", { required: "Name is required" })}
                    />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Input
                            label="Age"
                            type="number"
                            placeholder="25"
                            error={errors.age}
                            {...register("age", {
                                required: "Age is required",
                                min: { value: 10, message: "Invalid age" },
                                max: { value: 120, message: "Invalid age" }
                            })}
                        />

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-main)', fontWeight: 500, fontSize: '14px' }}>
                                Language
                            </label>
                            <div style={{ position: 'relative' }}>
                                <select
                                    {...register("language")}
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px',
                                        borderRadius: '16px',
                                        border: '1px solid transparent',
                                        outline: 'none',
                                        fontSize: '15px',
                                        background: '#FFFFFF',
                                        color: 'var(--text-main)',
                                        appearance: 'none',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="en">English</option>
                                    <option value="es">Spanish</option>
                                    <option value="fr">French</option>
                                    <option value="hi">Hindi</option>
                                </select>
                                <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)' }}>
                                    ▼
                                </div>
                            </div>
                        </div>
                    </div>

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

                    <Input
                        label="Password"
                        type="password"
                        placeholder="••••••"
                        error={errors.password}
                        {...register("password", {
                            required: "Password is required",
                            minLength: {
                                value: 8,
                                message: "Password must be at least 8 characters"
                            },
                            validate: {
                                hasNumber: (value) => /\d/.test(value) || "Must contain a number",
                                hasUpperCase: (value) => /[A-Z]/.test(value) || "Must contain an uppercase letter"
                            }
                        })}
                    />

                    {/* Password Strength Indicators */}
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: hasMinLength ? 'var(--success-color)' : 'inherit' }}>
                            {hasMinLength ? <Check size={12} /> : <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#E5E7EB' }} />} 8+ chars
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: hasNumber ? 'var(--success-color)' : 'inherit' }}>
                            {hasNumber ? <Check size={12} /> : <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#E5E7EB' }} />} 1 number
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: hasUpperCase ? 'var(--success-color)' : 'inherit' }}>
                            {hasUpperCase ? <Check size={12} /> : <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#E5E7EB' }} />} 1 uppercase
                        </div>
                    </div>

                    <Input
                        label="Confirm Password"
                        type="password"
                        placeholder="••••••"
                        error={errors.confirmPassword}
                        {...register("confirmPassword", {
                            required: "Please confirm your password",
                            validate: value => value === password || "Passwords do not match"
                        })}
                    />

                    <div style={{ marginBottom: '24px', background: '#F9FAFB', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-main)' }}>Do you have PCOD/PCOS?</span>
                        <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '50px', height: '28px' }}>
                            <input type="checkbox" {...register("hasPCOS")} style={{ opacity: 0, width: 0, height: 0 }} />
                            <span className="slider round" style={{
                                position: 'absolute',
                                cursor: 'pointer',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: '#E5E7EB',
                                transition: '.4s',
                                borderRadius: '34px',
                            }}>
                                <span style={{
                                    position: 'absolute',
                                    content: "",
                                    height: '22px',
                                    width: '22px',
                                    left: '3px',
                                    bottom: '3px',
                                    backgroundColor: 'white',
                                    transition: '.4s',
                                    borderRadius: '50%',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }} className="slider-thumb"></span>
                            </span>
                            <style>{`
                                input:checked + .slider {
                                    background-color: var(--primary-purple);
                                }
                                input:checked + .slider .slider-thumb {
                                    transform: translateX(22px);
                                }
                            `}</style>
                        </label>
                    </div>

                    <Button type="submit" fullWidth disabled={loading}>
                        {loading ? 'Creating Account...' : (
                            <>
                                Sign Up <UserPlus size={18} />
                            </>
                        )}
                    </Button>

                    <div style={{ display: 'flex', alignItems: 'center', margin: '30px 0' }}>
                        <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }}></div>
                        <span style={{ padding: '0 16px', fontSize: '14px', color: '#9CA3AF' }}>OR</span>
                        <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }}></div>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            background: '#FFFFFF',
                            border: '1px solid #E5E7EB',
                            borderRadius: '16px',
                            fontSize: '15px',
                            fontWeight: '600',
                            color: 'var(--text-main)',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                        }}
                    >
                        <img
                            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                            alt="Google"
                            style={{ width: '22px', height: '22px' }}
                        />
                        Continue with Google
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default Signup;
