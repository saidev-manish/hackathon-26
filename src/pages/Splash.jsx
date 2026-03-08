import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Splash = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/login');
        }, 3000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="full-screen flex-center" style={{ background: 'var(--background-gradient)' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                style={{ textAlign: 'center' }}
            >
                <div style={{
                    width: '100px',
                    height: '100px',
                    background: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    {/* Placeholder Logo Icon */}
                    <span style={{ fontSize: '40px' }}>💜</span>
                </div>
                <h1 style={{ color: 'var(--text-main)', fontSize: '2rem', margin: 0 }}>
                    Welcome to PulseCare
                </h1>
            </motion.div>
        </div>
    );
};

export default Splash;
