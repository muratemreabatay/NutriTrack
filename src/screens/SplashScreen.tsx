import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions } from 'react-native';
import { useLanguage } from '../i18n/LanguageContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type SplashScreenProps = {
    onFinish: () => void;
};

const SplashScreen = ({ onFinish }: SplashScreenProps) => {
    const { t } = useLanguage();
    const scaleAnim = useRef(new Animated.Value(0.3)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const textFade = useRef(new Animated.Value(0)).current;
    const taglineFade = useRef(new Animated.Value(0)).current;
    const exitFade = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.parallel([
                Animated.spring(scaleAnim, { toValue: 1, friction: 4, tension: 50, useNativeDriver: true }),
                Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
            ]),
            Animated.timing(glowAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.timing(textFade, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(taglineFade, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.15, duration: 200, useNativeDriver: true }),
                Animated.spring(pulseAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
            ]),
            Animated.delay(400),
            Animated.timing(exitFade, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start(() => {
            onFinish();
        });
    }, []);

    return (
        <Animated.View
            style={{
                flex: 1,
                backgroundColor: '#030712',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: exitFade,
            }}
        >
            <Animated.View
                style={{
                    position: 'absolute',
                    width: 140,
                    height: 140,
                    borderRadius: 70,
                    backgroundColor: '#34D39915',
                    opacity: glowAnim,
                    transform: [{ scale: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.8] }) }],
                }}
            />
            <Animated.View
                style={{
                    opacity: fadeAnim,
                    transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }],
                    alignItems: 'center',
                }}
            >
                <View
                    style={{
                        width: 100, height: 100, borderRadius: 28,
                        backgroundColor: '#111827', borderWidth: 2, borderColor: '#34D39940',
                        alignItems: 'center', justifyContent: 'center',
                        shadowColor: '#34D399', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 20,
                    }}
                >
                    <Text style={{ fontSize: 48 }}>🥗</Text>
                </View>
            </Animated.View>

            <Animated.View
                style={{
                    opacity: textFade,
                    transform: [{ translateY: textFade.interpolate({ inputRange: [0, 1], outputRange: [15, 0] }) }],
                    marginTop: 24, alignItems: 'center',
                }}
            >
                <Text style={{ color: '#FFFFFF', fontSize: 30, fontWeight: '800', letterSpacing: 1 }}>
                    NutriTrack
                </Text>
            </Animated.View>

            <Animated.View style={{ opacity: taglineFade, marginTop: 8, alignItems: 'center' }}>
                <Text style={{ color: '#34D399', fontSize: 12, fontWeight: '500', letterSpacing: 1.5, textAlign: 'center' }}>
                    {t.splash.tagline}
                </Text>
            </Animated.View>

            <Animated.View style={{ position: 'absolute', bottom: 50, opacity: taglineFade }}>
                <Text style={{ color: '#374151', fontSize: 11, fontWeight: '500' }}>
                    {t.splash.motto}
                </Text>
            </Animated.View>
        </Animated.View>
    );
};

export default SplashScreen;
