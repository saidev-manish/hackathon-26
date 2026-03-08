import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react-native';

const InsightsSection = ({ insights }) => {
    if (!insights) return null;

    const { cycleAnalysis, pcosRisk, moodAnalysis } = insights;
    const hasIrregularCycle = cycleAnalysis?.isIrregular;
    const hasHighRisk = pcosRisk?.riskLevel === 'High' || pcosRisk?.riskLevel === 'Medium';

    if (!hasIrregularCycle && !hasHighRisk && !moodAnalysis) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Health Insights</Text>

            <View style={styles.insightList}>
                {/* Irregular Cycle Alert */}
                {hasIrregularCycle && (
                    <View style={[styles.insightCard, styles.errorCard]}>
                        <AlertTriangle color="#EF4444" size={24} style={styles.icon} />
                        <View style={styles.textContainer}>
                            <Text style={[styles.cardTitle, styles.errorTitle]}>Irregular Cycle Detected</Text>
                            <Text style={[styles.cardMessage, styles.errorMessage]}>
                                {cycleAnalysis.message}
                            </Text>
                        </View>
                    </View>
                )}

                {/* PCOS Risk Alert */}
                {hasHighRisk && (
                    <View style={[styles.insightCard, styles.warningCard]}>
                        <Info color="#DD6B20" size={24} style={styles.icon} />
                        <View style={styles.textContainer}>
                            <Text style={[styles.cardTitle, styles.warningTitle]}>Potential Health Attention Needed</Text>
                            <Text style={[styles.cardMessage, styles.warningMessage]}>
                                We've noticed patterns that might suggest {pcosRisk.riskLevel} likelihood of PCOS-related symptoms ({pcosRisk.factors.join(', ')}). Consider consulting a doctor.
                            </Text>
                        </View>
                    </View>
                )}

                {/* Mood Insight (Positive) */}
                {moodAnalysis && parseFloat(moodAnalysis.average) > 3.5 && (
                    <View style={[styles.insightCard, styles.successCard]}>
                        <CheckCircle color="#38A169" size={24} style={styles.icon} />
                        <View style={styles.textContainer}>
                            <Text style={[styles.cardTitle, styles.successTitle]}>Great Mood Streak!</Text>
                            <Text style={[styles.cardMessage, styles.successMessage]}>
                                {moodAnalysis.message}
                            </Text>
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 16,
    },
    insightList: {
        gap: 16,
    },
    insightCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'flex-start',
    },
    icon: {
        marginTop: 2,
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    cardMessage: {
        fontSize: 14,
        lineHeight: 20,
    },
    // Colors
    errorCard: {
        backgroundColor: '#FFF5F5',
        borderColor: '#FED7D7',
    },
    errorTitle: {
        color: '#9B2C2C',
    },
    errorMessage: {
        color: '#C53030',
    },
    warningCard: {
        backgroundColor: '#FFFAF0',
        borderColor: '#FEEBC8',
    },
    warningTitle: {
        color: '#C05621',
    },
    warningMessage: {
        color: '#9C4221',
    },
    successCard: {
        backgroundColor: '#F0FFF4',
        borderColor: '#C6F6D5',
    },
    successTitle: {
        color: '#2F855A',
    },
    successMessage: {
        color: '#276749',
    },
});

export default InsightsSection;
