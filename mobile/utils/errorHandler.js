// Professional error handling and logging utilities

const LOG_LEVEL = {
    DEBUG: 'DEBUG',
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
};

const log = (level, message, data = null) => {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}]`;
    
    if (__DEV__) {
        console.log(prefix, message, data || '');
    }
    
    // In production, you could send logs to a service like Sentry
};

export const logger = {
    debug: (message, data) => log(LOG_LEVEL.DEBUG, message, data),
    info: (message, data) => log(LOG_LEVEL.INFO, message, data),
    warn: (message, data) => log(LOG_LEVEL.WARN, message, data),
    error: (message, data) => log(LOG_LEVEL.ERROR, message, data),
};

export const handleAsyncError = (error, context = 'Operation') => {
    const errorMessage = error?.message || String(error);
    const errorCode = error?.code || 'UNKNOWN_ERROR';
    
    logger.error(`${context} failed: ${errorCode}`, { message: errorMessage });
    
    // Map Firebase errors to user-friendly messages
    const userMessage = mapFirebaseError(errorCode, errorMessage);
    return { code: errorCode, message: userMessage, details: errorMessage };
};

export const mapFirebaseError = (code, message) => {
    const errorMap = {
        'auth/weak-password': 'Password should be at least 6 characters long.',
        'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/user-not-found': 'No account found with this email address.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
        'auth/network-request-failed': 'Network error. Please check your internet connection.',
        'permission-denied': 'You don\'t have permission to perform this action.',
        'not-found': 'The requested resource was not found.',
        'already-exists': 'This item already exists.',
        'resource-exhausted': 'Too many requests. Please try again later.',
        'unavailable': 'Service is temporarily unavailable. Please try again later.',
    };
    
    return errorMap[code] || 'Something went wrong. Please try again.';
};

export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePassword = (password) => {
    return password && password.length >= 6;
};

export const retryAsync = async (fn, maxRetries = 3, delay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            logger.warn(`Retry attempt ${i + 1}/${maxRetries}`, { error: error.message });
            await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
    }
};

export const debounce = (func, delay) => {
    let timeoutId;
    return function debounced(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
};

export const throttle = (func, limit) => {
    let inThrottle;
    return function throttled(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};
