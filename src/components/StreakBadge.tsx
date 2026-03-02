import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';

type StreakBadgeProps = {
    streak: number;
};

const getStreakConfig = (streak: number) => {
    if (streak >= 30) return { color: '#A855F7', bg: '#A855F7', label: 'Efsanevi', flame: '🔥', glow: true, scale: 1.15 };
    if (streak >= 14) return { color: '#F59E0B', bg: '#F59E0B', label: 'Süper', flame: '🔥', glow: true, scale: 1.1 };
    if (streak >= 7) return { color: '#EF4444', bg: '#EF4444', label: 'Ateşli', flame: '🔥', glow: true, scale: 1.05 };
    if (streak >= 3) return { color: '#F97316', bg: '#F97316', label: 'İyi', flame: '🔥', glow: false, scale: 1.0 };
    return { color: '#6B7280', bg: '#6B7280', label: '', flame: '🔥', glow: false, scale: 1.0 };
};

const StreakBadge = ({ streak }: StreakBadgeProps) => {
    const config = getStreakConfig(streak);

    // Pulse animation for high streaks
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        let pulseAnimation: Animated.CompositeAnimation | null = null;
        let glowAnimation: Animated.CompositeAnimation | null = null;

        if (streak >= 7) {
            // Pulsing fire
            pulseAnimation = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
                ])
            );
            pulseAnimation.start();
        }

        if (streak >= 14) {
            // Glow effect
            glowAnimation = Animated.loop(
                Animated.sequence([
                    Animated.timing(glowAnim, { toValue: 0.8, duration: 1200, useNativeDriver: true }),
                    Animated.timing(glowAnim, { toValue: 0.3, duration: 1200, useNativeDriver: true }),
                ])
            );
            glowAnimation.start();
        }

        return () => {
            pulseAnimation?.stop();
            glowAnimation?.stop();
        };
    }, [streak]);

    if (streak === 0) return null;

    return (
        <View className="flex-row items-center rounded-full overflow-hidden" style={{ position: 'relative' }}>
            {/* Glow background for high streaks */}
            {config.glow && (
                <Animated.View
                    style={{
                        position: 'absolute', left: -4, top: -4, right: -4, bottom: -4,
                        borderRadius: 999,
                        backgroundColor: config.color,
                        opacity: glowAnim,
                    }}
                />
            )}

            <View
                className="flex-row items-center px-3 py-2 rounded-full border"
                style={{
                    backgroundColor: config.color + '15',
                    borderColor: config.color + '40',
                }}
            >
                <Animated.Text style={{ fontSize: 14, transform: [{ scale: pulseAnim }] }}>
                    {config.flame}
                </Animated.Text>
                <Text style={{ color: config.color, fontWeight: 'bold', marginLeft: 6, fontSize: 14 }}>
                    {streak}
                </Text>
                {config.label ? (
                    <View
                        className="ml-1 px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: config.color + '25' }}
                    >
                        <Text style={{ color: config.color, fontSize: 9, fontWeight: '800' }}>{config.label}</Text>
                    </View>
                ) : null}
            </View>
        </View>
    );
};

export default StreakBadge;
