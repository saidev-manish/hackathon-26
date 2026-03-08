import { AlertTriangle, Info, CheckCircle } from 'lucide-react';

const InsightsSection = ({ insights }) => {
    if (!insights) return null;

    const { cycleAnalysis, pcosRisk, moodAnalysis } = insights;
    const hasIrregularCycle = cycleAnalysis?.isIrregular;
    const hasHighRisk = pcosRisk?.riskLevel === 'High' || pcosRisk?.riskLevel === 'Medium';

    if (!hasIrregularCycle && !hasHighRisk && !moodAnalysis) return null;

    return (
        <div style={{ marginTop: '32px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '20px', color: 'var(--text-main)', fontWeight: 600 }}>Health Insights</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Irregular Cycle Alert */}
                {hasIrregularCycle && (
                    <div style={{
                        background: '#FFF5F5',
                        border: '1px solid #FED7D7',
                        borderRadius: '16px',
                        padding: '16px',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'flex-start'
                    }}>
                        <AlertTriangle color="#EF4444" size={24} style={{ marginTop: '2px' }} />
                        <div>
                            <h4 style={{ margin: '0 0 4px', color: '#9B2C2C', fontSize: '16px' }}>Irregular Cycle Detected</h4>
                            <p style={{ margin: 0, color: '#C53030', fontSize: '14px' }}>
                                {cycleAnalysis.message}
                            </p>
                        </div>
                    </div>
                )}

                {/* PCOS Risk Alert */}
                {hasHighRisk && (
                    <div style={{
                        background: '#FFFAF0',
                        border: '1px solid #FEEBC8',
                        borderRadius: '16px',
                        padding: '16px',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'flex-start'
                    }}>
                        <Info color="#DD6B20" size={24} style={{ marginTop: '2px' }} />
                        <div>
                            <h4 style={{ margin: '0 0 4px', color: '#C05621', fontSize: '16px' }}>Potential Health Attention Needed</h4>
                            <p style={{ margin: 0, color: '#9C4221', fontSize: '14px' }}>
                                We've noticed patterns that might suggest {pcosRisk.riskLevel} likelihood of PCOS-related symptoms ({pcosRisk.factors.join(', ')}). Consider consulting a doctor.
                            </p>
                        </div>
                    </div>
                )}

                {/* Mood Insight (Positive) */}
                {moodAnalysis && moodAnalysis.average > 3.5 && (
                    <div style={{
                        background: '#F0FFF4',
                        border: '1px solid #C6F6D5',
                        borderRadius: '16px',
                        padding: '16px',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'flex-start'
                    }}>
                        <CheckCircle color="#38A169" size={24} style={{ marginTop: '2px' }} />
                        <div>
                            <h4 style={{ margin: '0 0 4px', color: '#2F855A', fontSize: '16px' }}>Great Mood Streak!</h4>
                            <p style={{ margin: 0, color: '#276749', fontSize: '14px' }}>
                                {moodAnalysis.message}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InsightsSection;
