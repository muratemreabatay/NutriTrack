import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

type Props = {
    children: ReactNode;
};

type State = {
    hasError: boolean;
    error: Error | null;
};

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('ErrorBoundary caught:', error, info);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <View style={{
                    flex: 1,
                    backgroundColor: '#030712',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 32,
                }}>
                    <Text style={{ fontSize: 48, marginBottom: 16 }}>😵</Text>
                    <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 8 }}>
                        Bir Hata Oluştu
                    </Text>
                    <Text style={{ color: '#9CA3AF', fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 20 }}>
                        Uygulama beklenmedik bir hatayla karşılaştı. Lütfen tekrar deneyin.
                    </Text>
                    <Text style={{ color: '#4B5563', fontSize: 11, textAlign: 'center', marginBottom: 24, fontFamily: 'monospace' }}>
                        {this.state.error?.message?.substring(0, 120)}
                    </Text>
                    <TouchableOpacity
                        onPress={this.handleRetry}
                        style={{
                            backgroundColor: '#34D399',
                            paddingHorizontal: 32,
                            paddingVertical: 14,
                            borderRadius: 16,
                            shadowColor: '#34D399',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 12,
                        }}
                    >
                        <Text style={{ color: '#000000', fontWeight: '700', fontSize: 16 }}>
                            Tekrar Dene
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
