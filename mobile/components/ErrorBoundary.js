import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../styles/theme';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error Boundary caught:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <ScrollView contentContainerStyle={styles.content}>
                        <View style={styles.iconBox}>
                            <Text style={styles.icon}>⚠️</Text>
                        </View>
                        <Text style={styles.title}>Something Went Wrong</Text>
                        <Text style={styles.message}>
                            We're sorry for the inconvenience. Please try again.
                        </Text>
                        {__DEV__ && (
                            <View style={styles.errorBox}>
                                <Text style={styles.errorText}>{String(this.state.error)}</Text>
                            </View>
                        )}
                    </ScrollView>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={this.handleReset}
                    >
                        <Text style={styles.buttonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 20,
        alignItems: 'center',
        gap: 16,
    },
    iconBox: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    icon: {
        fontSize: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.heading,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: theme.colors.body,
        textAlign: 'center',
        lineHeight: 24,
    },
    errorBox: {
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        padding: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#e74c3c',
        maxHeight: 120,
    },
    errorText: {
        fontSize: 12,
        color: '#e74c3c',
        fontFamily: 'monospace',
    },
    button: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 24,
        margin: 20,
    },
    buttonText: {
        color: theme.colors.surface,
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
    },
});

export default ErrorBoundary;
