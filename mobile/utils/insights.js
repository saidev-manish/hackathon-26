/**
 * Analyzes cycle history to detect irregularities.
 * Rule: If cycle length variation > 7 days over the last 3-6 cycles => Irregular.
 * @param {Array} periodHistory - Array of { startDate, endDate } objects
 * @returns {Object} { isIrregular, message, variance }
 */
export const analyzeCycleIrregularity = (periodHistory) => {
    if (!periodHistory || periodHistory.length < 3) {
        return { isIrregular: false, message: "Not enough data to analyze cycle regularity." };
    }

    // Sort by date descending (newest first)
    const sorted = [...periodHistory].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    const recentCycles = sorted.slice(0, 6); // Look at last 6 cycles max

    // Calculate lengths
    const lengths = [];
    for (let i = 0; i < recentCycles.length - 1; i++) {
        const start = new Date(recentCycles[i].startDate);
        const prevStart = new Date(recentCycles[i + 1].startDate);
        const diffDays = Math.ceil(Math.abs(start - prevStart) / (1000 * 60 * 60 * 24));
        lengths.push(diffDays);
    }

    if (lengths.length < 2) return { isIrregular: false, message: "" };

    const min = Math.min(...lengths);
    const max = Math.max(...lengths);
    const variance = max - min;

    if (variance > 7) {
        return {
            isIrregular: true,
            variance,
            message: `Your cycle length varies by ${variance} days, which is considered irregular.`
        };
    } else if (variance > 4) {
        return {
            isIrregular: false,
            variance,
            message: `Your cycle has some variation (${variance} days), but is within normal range.`
        };
    }

    return { isIrregular: false, variance, message: "Your cycle is very regular." };
};

/**
 * Estimates PCOS risk based on symptoms and cycle regularity.
 * @param {Array} symptomLogs 
 * @param {Object} cycleAnalysisResult 
 * @returns {Object} { riskLevel: 'Low'|'Medium'|'High', factors: [] }
 */
export const analyzePCOSRisk = (symptomLogs, cycleAnalysisResult) => {
    let riskScore = 0;
    const factors = [];

    // Factor 1: Irregular Cycles
    if (cycleAnalysisResult.isIrregular) {
        riskScore += 2;
        factors.push("Irregular Cycles");
    }

    // Factor 2: High frequency of specific symptoms (Acne, Hirsutism/Facial Hair - mapped to 'acne' for MVP, Fatigue)
    // We'll analyze the last 30 days of logs
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const recentLogs = symptomLogs.filter(log => new Date(log.timestamp) > thirtyDaysAgo);

    let severeAcneCount = 0;
    let severeFatigueCount = 0;

    recentLogs.forEach(log => {
        if (log.symptoms?.acne >= 2) severeAcneCount++;
        if (log.symptoms?.fatigue >= 2) severeFatigueCount++;
    });

    if (severeAcneCount > 3) {
        riskScore += 1;
        factors.push("Frequent/Severe Acne");
    }

    // Weight fatigue less, as it's common
    if (severeFatigueCount > 5) {
        riskScore += 0.5;
        factors.push("Chronic Fatigue");
    }

    let riskLevel = 'Low';
    if (riskScore >= 3) riskLevel = 'High';
    else if (riskScore >= 1.5) riskLevel = 'Medium';

    return { riskLevel, factors };
};

/**
 * Analyzes mood logs to find patterns relative to cycle phase.
 * @param {Array} moodLogs 
 * @param {Array} periodHistory 
 */
export const analyzeMoodPatterns = (moodLogs, periodHistory) => {
    if (!moodLogs.length) return null;

    const totalMood = moodLogs.reduce((acc, log) => acc + (log.mood || 3), 0); // Default to Neutral (3) if undefined
    const avg = totalMood / moodLogs.length;

    let message = "Your mood is generally balanced.";
    if (avg < 2.5) message = "You've been feeling down lately. Consider self-care or speaking to someone.";
    if (avg > 3.8) message = "You've been in high spirits recently!";

    return { average: avg.toFixed(1), message };
};

/**
 * Checks for signs of nutrient deficiency (B vitamins, manganese, zinc) affecting cycle.
 * These deficiencies can cause delayed periods, irregular cycles, and PCOS symptoms.
 * @param {Array} periodHistory 
 * @returns {Object} { hasDelayWarning, recommendedNutrients, message }
 */
export const analyzeNutrientDeficiency = (periodHistory) => {
    if (!periodHistory || periodHistory.length === 0) {
        return { hasDelayWarning: false, recommendedNutrients: [], message: "" };
    }

    // Sort by date descending (newest first)
    const sorted = [...periodHistory].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    
    if (sorted.length < 1) return { hasDelayWarning: false, recommendedNutrients: [], message: "" };

    // Check if most recent period is delayed (more than 35 days from previous)
    const now = new Date();
    const lastPeriodStart = new Date(sorted[0].startDate);
    const daysSinceLastPeriod = Math.floor((now - lastPeriodStart) / (1000 * 60 * 60 * 24));

    let hasDelayWarning = false;
    const recommendedNutrients = [];

    if (daysSinceLastPeriod > 35) {
        hasDelayWarning = true;
        recommendedNutrients.push(
            'Vitamin B12 (eggs, dairy, fortified cereals)',
            'Vitamin B6 (chicken, bananas, potatoes, chickpeas)',
            'Folate/B9 (leafy greens, lentils, asparagus)',
            'Zinc (oysters, beef, pumpkin seeds, chickpeas)',
            'Manganese (tea, oats, brown rice, almonds, spinach)'
        );
    } else if (daysSinceLastPeriod > 32) {
        hasDelayWarning = true;
        recommendedNutrients.push('Zinc', 'Manganese', 'B Vitamins');
    }

    const message = hasDelayWarning
        ? `Your period may be delayed (${daysSinceLastPeriod} days). Nutrient deficiencies—especially B vitamins, manganese, and zinc—can affect cycle regularity. Consider increasing these nutrients in your diet.`
        : '';

    return { hasDelayWarning, recommendedNutrients, message, daysSinceLastPeriod };
};
