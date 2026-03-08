import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Circle, G, Text as SvgText } from 'react-native-svg';
import { useLanguage } from '../../contexts/LanguageContext';
import { LinearGradient } from 'expo-linear-gradient';
import Animated from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const CycleCard = ({ currentDay = 1, daysUntilNextPeriod = 28, isFertile = false }) => {
    const { t } = useLanguage();

    // Circle parameters
    const size = 160;
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    // Progress calculation (Day 1 to 28)
    const progress = Math.min(Math.max(currentDay / 28, 0), 1);
    const strokeDashoffset = circumference - progress * circumference;

    return (
        <LinearGradient
            colors={['#FF9A9E', '#FECFEF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >
            <Text style={styles.headerTitle}>Current Cycle</Text>

            <View style={styles.content}>
                {/* SVG Progress Circle */}
                <View style={styles.circleContainer}>
                    <Svg width={size} height={size}>
                        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
                            {/* Background Circle */}
                            <Circle
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                stroke="rgba(255, 255, 255, 0.3)"
                                strokeWidth={strokeWidth}
                                fill="none"
                            />
                            {/* Progress Circle */}
                            <Circle
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                stroke="white"
                                strokeWidth={strokeWidth}
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                fill="none"
                            />
                        </G>
                    </Svg>
                    <View style={styles.circleTextContainer}>
                        <Text style={styles.daysText}>{daysUntilNextPeriod} {t('days')}</Text>
                        <Text style={styles.labelSubText}>{t('periodIn')}</Text>
                    </View>
                </View>

                {/* Text Details */}
                <View style={styles.detailsContainer}>
                    <Text style={styles.dayTitle}>{t('day')} {currentDay}</Text>
                    <Text style={styles.fertilityText}>
                        {isFertile ? `🌸 ${t('highChance')}` : t('lowChance')}
                    </Text>
                    {isFertile && (
                        <Text style={styles.windowText}>({t('fertileWindow')})</Text>
                    )}
                </View>
            </View>

            {/* Decorative Flower - Emoji */}
            <View style={styles.decorativeFlower}>
                <Text style={{ fontSize: 150, opacity: 0.2 }}>🌸</Text>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 24,
        borderRadius: 24,
        marginVertical: 10,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#FF9A9E',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    headerTitle: {
        fontSize: 18,
        color: 'white',
        opacity: 0.9,
        fontWeight: '600',
        marginBottom: 10,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    circleContainer: {
        position: 'relative',
        width: 160,
        height: 160,
        justifyContent: 'center',
        alignItems: 'center',
    },
    circleTextContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    daysText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    labelSubText: {
        fontSize: 12,
        color: 'white',
        opacity: 0.8,
    },
    detailsContainer: {
        alignItems: 'center',
    },
    dayTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: 'white',
    },
    fertilityText: {
        fontSize: 15,
        color: 'white',
        opacity: 0.9,
        marginTop: 4,
    },
    windowText: {
        fontSize: 12,
        color: 'white',
        opacity: 0.8,
        marginTop: 2,
    },
    decorativeFlower: {
        position: 'absolute',
        top: -30,
        right: -30,
    },
});

export default CycleCard;
