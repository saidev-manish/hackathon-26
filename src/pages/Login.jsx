import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Phone, Mail, ArrowRight, Check } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';

const Login = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { login, loginWithGoogle } = useAuth();
    const { t } = useLanguage();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Phone Auth State
    const [authMethod, setAuthMethod] = useState('email'); // 'email' or 'phone'
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [verificationId, setVerificationId] = useState(null);
    const [phoneStep, setPhoneStep] = useState('input'); // 'input' or 'verify'

    // Initialize Recaptcha
    useEffect(() => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': (response) => {
                    // reCAPTCHA solved, allow signInWithPhoneNumber.
                },
                'expired-callback': () => {
                    // Response expired. Ask user to solve reCAPTCHA again.
                }
            });
        }
    }, [auth]);

    async function onSubmit(data) {
        try {
            setError('');
            setLoading(true);
            await login(data.email, data.password);
            navigate('/dashboard');
        } catch (err) {
            setError('Failed to login. Please check your credentials.');
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
            setError('Failed to login with Google.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSendOtp = async () => {
        try {
            setError('');
            setLoading(true);

            if (!phoneNumber || phoneNumber.length < 10) {
                throw new Error("Please enter a valid phone number.");
            }

            // Format phone number: Default to +91 if no country code provided
            let formattedNumber = phoneNumber.replace(/\s/g, ''); // Remove spaces
            if (!formattedNumber.startsWith('+')) {
                formattedNumber = '+91' + formattedNumber;
            }

            const appVerifier = window.recaptchaVerifier;
            const confirmationResult = await signInWithPhoneNumber(auth, formattedNumber, appVerifier);
            window.confirmationResult = confirmationResult;
            setVerificationId(confirmationResult.verificationId);
            setPhoneStep('verify');
        } catch (error) {
            console.error(error);
            if (error.code === 'auth/invalid-phone-number') {
                setError('Invalid phone number format. Please try again.');
            } else if (error.code === 'auth/billing-not-enabled') {
                setError('Firebase Billing is disabled. Please use a "Test Phone Number" configured in Firebase Console (Auth > Sign-in method > Phone).');
            } else {
                setError('Failed to send OTP. ' + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        try {
            setError('');
            setLoading(true);
            const result = await window.confirmationResult.confirm(otp);
            const user = result.user;
            navigate('/dashboard');
        } catch (error) {
            setError('Invalid OTP.');
            console.error(error);
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

            <div id="recaptcha-container"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    background: 'rgba(255, 255, 255, 0.85)',
                    padding: '40px',
                    borderRadius: '32px',
                    width: '100%',
                    maxWidth: '450px',
                    boxShadow: 'var(--shadow-soft)',
                    backdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255, 255, 255, 0.8)',
                    position: 'relative',
                    zIndex: 10
                }}
            >
                {/* Header Section */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            background: 'var(--lavender-gradient)',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--primary-purple)',
                            boxShadow: '0 8px 16px rgba(106, 62, 161, 0.15)'
                        }}>
                            <LogIn size={28} />
                        </div>
                    </div>

                    {/* Auth Tabs */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '24px',
                        marginBottom: '24px',
                        borderBottom: '2px solid rgba(0,0,0,0.05)',
                        paddingBottom: '0'
                    }}>
                        <div style={{ paddingBottom: '12px', borderBottom: '2px solid var(--primary-purple)', color: 'var(--primary-purple)', fontWeight: 600, cursor: 'default' }}>
                            {t('signIn')}
                        </div>
                        <Link
                            to="/signup"
                            style={{
                                paddingBottom: '12px',
                                borderBottom: '2px solid transparent',
                                color: 'var(--text-secondary)',
                                fontWeight: 500,
                                textDecoration: 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            {t('signUp')}
                        </Link>
                    </div>

                    <h2 style={{ fontSize: '28px', color: 'var(--text-main)', marginBottom: '8px', fontWeight: '700' }}>{t('welcomeBack')}</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>{t('signInToSpace')}</p>
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

                {/* Method Toggle */}
                <div style={{
                    display: 'flex',
                    background: '#F3F4F6',
                    borderRadius: '16px',
                    padding: '4px',
                    marginBottom: '24px'
                }}>
                    <button
                        onClick={() => setAuthMethod('email')}
                        style={{
                            flex: 1,
                            padding: '8px',
                            borderRadius: '12px',
                            background: authMethod === 'email' ? 'white' : 'transparent',
                            color: authMethod === 'email' ? 'var(--primary-purple)' : 'var(--text-secondary)',
                            boxShadow: authMethod === 'email' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                            fontWeight: 600,
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        <Mail size={16} /> {t('email')}
                    </button>
                    <button
                        onClick={() => setAuthMethod('phone')}
                        style={{
                            flex: 1,
                            padding: '8px',
                            borderRadius: '12px',
                            background: authMethod === 'phone' ? 'white' : 'transparent',
                            color: authMethod === 'phone' ? 'var(--primary-purple)' : 'var(--text-secondary)',
                            boxShadow: authMethod === 'phone' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                            fontWeight: 600,
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        <Phone size={16} /> {t('phone')}
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {authMethod === 'email' ? (
                        <motion.form
                            key="email-form"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleSubmit(onSubmit)}
                        >
                            <Input
                                label={t('email')}
                                type="email"
                                placeholder="name@example.com"
                                required
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
                                label={t('password')}
                                type="password"
                                placeholder="••••••"
                                required
                                error={errors.password}
                                {...register("password", {
                                    required: "Password is required",
                                    minLength: {
                                        value: 6,
                                        message: "Password must be at least 6 characters"
                                    }
                                })}
                            />

                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
                                <Link
                                    to="/forgot-password"
                                    style={{ color: 'var(--secondary-purple)', fontSize: '14px', textDecoration: 'none', fontWeight: 500 }}
                                >
                                    {t('forgotPassword')}
                                </Link>
                            </div>

                            <Button type="submit" fullWidth disabled={loading}>
                                {loading ? 'Logging In...' : (
                                    <>
                                        {t('signIn')} <ArrowRight size={18} />
                                    </>
                                )}
                            </Button>
                        </motion.form>
                    ) : (
                        <motion.div
                            key="phone-form"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            {phoneStep === 'input' ? (
                                <>
                                    <Input
                                        label={t('phone')}
                                        placeholder="98765 43210"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        icon={<Phone size={18} />}
                                    />
                                    <div style={{ height: '24px' }}></div>
                                    <Button onClick={handleSendOtp} fullWidth disabled={loading || !phoneNumber}>
                                        {loading ? 'Sending Code...' : t('sendCode')}
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                                            {t('enterCode')} {phoneNumber}
                                        </p>
                                    </div>
                                    <Input
                                        label="Verification Code"
                                        placeholder="123456"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '20px' }}
                                    />
                                    <div style={{ height: '24px' }}></div>
                                    <Button onClick={handleVerifyOtp} fullWidth disabled={loading || otp.length !== 6}>
                                        {loading ? 'Verifying...' : t('verifySignIn')}
                                    </Button>
                                    <div style={{ marginTop: '16px', textAlign: 'center' }}>
                                        <button
                                            onClick={() => setPhoneStep('input')}
                                            style={{ background: 'none', color: 'var(--text-secondary)', fontSize: '14px', textDecoration: 'underline' }}
                                        >
                                            {t('changeNumber')}
                                        </button>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div style={{ display: 'flex', alignItems: 'center', margin: '30px 0' }}>
                    <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }}></div>
                    <span style={{ padding: '0 16px', fontSize: '14px', color: '#9CA3AF' }}>{t('continueWithGoogle')}</span>
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
                    {t('signInGoogle')}
                </button>
            </motion.div>
        </div>
    );
};

export default Login;
