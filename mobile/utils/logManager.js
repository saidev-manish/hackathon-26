/**
 * Log Manager Utility
 * Optimized log fetching, caching, and report generation
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Timestamp } from 'firebase/firestore';

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes cache TTL

/**
 * Get cached logs if available and not expired
 * @param {string} cacheKey - Cache key
 * @returns {Promise<any|null>} - Cached data or null
 */
export const getCachedLogs = async (cacheKey) => {
    try {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (!cached) return null;

        const parsed = JSON.parse(cached);
        const now = Date.now();

        // Check if cache expired
        if (parsed.timestamp && now - parsed.timestamp > CACHE_TTL) {
            await AsyncStorage.removeItem(cacheKey);
            return null;
        }

        return parsed.data;
    } catch (error) {
        console.error('Cache retrieval error:', error);
        return null;
    }
};

/**
 * Save logs to cache
 * @param {string} cacheKey - Cache key
 * @param {any} data - Data to cache
 */
export const cacheLogs = async (cacheKey, data) => {
    try {
        await AsyncStorage.setItem(cacheKey, JSON.stringify({
            data,
            timestamp: Date.now(),
        }));
    } catch (error) {
        console.error('Cache save error:', error);
    }
};

/**
 * Invalidate cache for reports
 * @param {string} userId - User ID
 */
export const invalidateReportsCache = async (userId) => {
    const cacheKeys = [
        `reportsCache:${userId}:weekly`,
        `reportsCache:${userId}:monthly`,
        `dashboardCache:${userId}`,
    ];

    try {
        await Promise.all(cacheKeys.map(key => AsyncStorage.removeItem(key)));
    } catch (error) {
        console.error('Cache invalidation error:', error);
    }
};

/**
 * Get date range for logs
 * @param {number} days - Number of days to go back
 * @returns {{startDate: Date, endDate: Date, startTimestamp: Timestamp, endTimestamp: Timestamp}}
 */
export const getDateRange = (days = 30) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    return {
        startDate,
        endDate,
        startTimestamp: Timestamp.fromDate(startDate),
        endTimestamp: Timestamp.fromDate(endDate),
    };
};

/**
 * Calculate statistics from logs
 * @param {Array} logs - Array of logs
 * @param {string} type - Type of log (mood, symptoms, etc)
 * @returns {Object} - Statistics
 */
export const calculateLogStats = (logs, type) => {
    if (!logs || !logs.length) return null;

    switch (type) {
        case 'mood':
            const moodValues = logs
                .map(log => Number(log.mood))
                .filter(val => Number.isFinite(val));

            if (!moodValues.length) return null;

            const avgMood = moodValues.reduce((a, b) => a + b, 0) / moodValues.length;
            const maxMood = Math.max(...moodValues);
            const minMood = Math.min(...moodValues);

            return {
                average: avgMood.toFixed(1),
                max: maxMood,
                min: minMood,
                count: moodValues.length,
            };

        case 'symptoms':
            const symptomCounts = {
                cramps: 0,
                acne: 0,
                headache: 0,
                fatigue: 0,
                bloating: 0,
            };

            logs.forEach(log => {
                const symptoms = log.symptoms || {};
                Object.keys(symptomCounts).forEach(key => {
                    if (symptoms[key] > 0) {
                        symptomCounts[key]++;
                    }
                });
            });

            return symptomCounts;

        case 'sleep':
            const sleepValues = logs
                .map(log => Number(log.hours))
                .filter(val => Number.isFinite(val));

            if (!sleepValues.length) return null;

            const avgSleep = sleepValues.reduce((a, b) => a + b, 0) / sleepValues.length;

            return {
                average: avgSleep.toFixed(1),
                total: sleepValues.reduce((a, b) => a + b, 0),
                count: sleepValues.length,
            };

        case 'diet':
            const calorieValues = logs
                .map(log => Number(log.calories))
                .filter(val => Number.isFinite(val));

            if (!calorieValues.length) return null;

            const avgCalories = calorieValues.reduce((a, b) => a + b, 0) / calorieValues.length;

            return {
                average: avgCalories.toFixed(0),
                total: calorieValues.reduce((a, b) => a + b, 0),
                count: calorieValues.length,
            };

        default:
            return null;
    }
};

/**
 * Format date for display
 * @param {Date|string|number} date - Date to format
 * @returns {string} - Formatted date
 */
export const formatDate = (date) => {
    try {
        const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
        if (Number.isNaN(d.getTime())) return 'Invalid date';
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
        return 'Invalid date';
    }
};

/**
 * Get human-readable time difference
 * @param {Date} date - Date to compare
 * @returns {string} - Time difference description
 */
export const getTimeSince = (date) => {
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
};

export default {
    getCachedLogs,
    cacheLogs,
    invalidateReportsCache,
    getDateRange,
    calculateLogStats,
    formatDate,
    getTimeSince,
};
