import { motion } from 'framer-motion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useLanguage } from '../../contexts/LanguageContext';

const CycleCard = ({ currentDay, daysUntilNextPeriod, isFertile }) => {
    const { t } = useLanguage();
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
                background: 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)',
                padding: '30px',
                borderRadius: '24px',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 10px 20px rgba(255, 154, 158, 0.3)',
                gridColumn: '1 / -1'
            }}
        >
            <div style={{ position: 'relative', zIndex: 1 }}>
                <h2 style={{ margin: 0, fontSize: '18px', opacity: 0.9 }}>Current Cycle</h2>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', margin: '10px 0' }}>

                    {/* Progress Bar Circle */}
                    <div style={{ position: 'relative', width: '160px', height: '160px' }}>
                        <CircularProgressbar
                            value={currentDay}
                            maxValue={28}
                            text={`${daysUntilNextPeriod} ${t('days')}`}
                            styles={buildStyles({
                                pathColor: 'white',
                                trailColor: 'rgba(255,255,255,0.3)',
                                textColor: 'white',
                                textSize: '16px',
                                pathTransitionDuration: 1.5
                            })}
                        />
                        <div style={{
                            position: 'absolute',
                            top: '65%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            color: 'white',
                            fontSize: '14px',
                            opacity: 0.9,
                            textAlign: 'center',
                            width: '100%'
                        }}>
                            {t('periodIn')}
                        </div>
                    </div>

                    {/* Text Details */}
                    <div style={{ textAlign: 'center', color: 'white' }}>
                        <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>
                            {t('day')} {currentDay}
                        </h3>
                        <p style={{ margin: '8px 0 0', opacity: 0.9, fontSize: '15px' }}>
                            {isFertile ? `🌸 ${t('highChance')}` : t('lowChance')}
                        </p>
                        {isFertile && (
                            <p style={{ margin: '4px 0 0', fontSize: '13px', opacity: 0.8 }}>
                                ({t('fertileWindow')})
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Decorative Flower */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                style={{
                    position: 'absolute',
                    top: '-20px',
                    right: '-20px',
                    fontSize: '150px',
                    opacity: 0.2,
                    pointerEvents: 'none'
                }}
            >
                🌸
            </motion.div>
        </motion.div>
    );
};

export default CycleCard;
