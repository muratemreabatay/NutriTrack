import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    Easing,
    interpolate,
} from 'react-native-reanimated';



type FlameConfig = {
    color: string;
    innerColor: string;
    glowColor: string;
    size: number;
    hasFlicker: boolean;
    hasGlow: boolean;
    hasParticles: boolean;
    hasMultiFlame: boolean;
    flickerSpeed: number;
    label: string;
};

const getFlameConfig = (streak: number): FlameConfig => {
    if (streak >= 30) return {
        color: '#A855F7',
        innerColor: '#D8B4FE',
        glowColor: '#A855F7',
        size: 22,
        hasFlicker: true,
        hasGlow: true,
        hasParticles: true,
        hasMultiFlame: true,
        flickerSpeed: 120,
        label: '',
    };
    if (streak >= 14) return {
        color: '#F59E0B',
        innerColor: '#FDE68A',
        glowColor: '#F59E0B',
        size: 20,
        hasFlicker: true,
        hasGlow: true,
        hasParticles: true,
        hasMultiFlame: false,
        flickerSpeed: 150,
        label: '',
    };
    if (streak >= 7) return {
        color: '#EF4444',
        innerColor: '#FCA5A5',
        glowColor: '#EF4444',
        size: 18,
        hasFlicker: true,
        hasGlow: false,
        hasParticles: false,
        hasMultiFlame: false,
        flickerSpeed: 200,
        label: '',
    };
    if (streak >= 3) return {
        color: '#F97316',
        innerColor: '#FDBA74',
        glowColor: '#F97316',
        size: 16,
        hasFlicker: true,
        hasGlow: false,
        hasParticles: false,
        hasMultiFlame: false,
        flickerSpeed: 300,
        label: '',
    };
    return {
        color: '#6B7280',
        innerColor: '#9CA3AF',
        glowColor: '#6B7280',
        size: 14,
        hasFlicker: false,
        hasGlow: false,
        hasParticles: false,
        hasMultiFlame: false,
        flickerSpeed: 0,
        label: '',
    };
};

type AnimatedFlameProps = {
    streak: number;
    overrideSize?: number;
};

const AnimatedFlame = ({ streak, overrideSize }: AnimatedFlameProps) => {
    const config = getFlameConfig(streak);
    const size = overrideSize || config.size;

    // Animation values
    const flickerScale = useSharedValue(1);
    const flickerRotate = useSharedValue(0);
    const glowOpacity = useSharedValue(0.2);
    const particle1Y = useSharedValue(0);
    const particle2Y = useSharedValue(0);
    const particle3Y = useSharedValue(0);
    const particle1Opacity = useSharedValue(0);
    const particle2Opacity = useSharedValue(0);
    const particle3Opacity = useSharedValue(0);

    useEffect(() => {
        // Flicker animation
        if (config.hasFlicker) {
            flickerScale.value = withRepeat(
                withSequence(
                    withTiming(1.08, { duration: config.flickerSpeed, easing: Easing.inOut(Easing.sin) }),
                    withTiming(0.94, { duration: config.flickerSpeed * 0.8, easing: Easing.inOut(Easing.sin) }),
                    withTiming(1.04, { duration: config.flickerSpeed * 0.7, easing: Easing.inOut(Easing.sin) }),
                    withTiming(0.97, { duration: config.flickerSpeed * 0.6, easing: Easing.inOut(Easing.sin) }),
                    withTiming(1.0, { duration: config.flickerSpeed * 0.5, easing: Easing.inOut(Easing.sin) }),
                ),
                -1,
                true
            );

            // Subtle rotation for organic feel
            flickerRotate.value = withRepeat(
                withSequence(
                    withTiming(3, { duration: config.flickerSpeed * 2, easing: Easing.inOut(Easing.sin) }),
                    withTiming(-3, { duration: config.flickerSpeed * 2, easing: Easing.inOut(Easing.sin) }),
                ),
                -1,
                true
            );
        }

        // Glow animation
        if (config.hasGlow) {
            glowOpacity.value = withRepeat(
                withSequence(
                    withTiming(0.55, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
                    withTiming(0.15, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
                ),
                -1,
                true
            );
        }

        // Particle animations
        if (config.hasParticles) {
            // Particle 1 - left
            const animateParticle = (yVal: { value: number }, opVal: { value: number }, delay: number) => {
                setTimeout(() => {
                    yVal.value = withRepeat(
                        withSequence(
                            withTiming(0, { duration: 0 }),
                            withTiming(-size * 0.8, { duration: 800, easing: Easing.out(Easing.quad) }),
                        ),
                        -1,
                        false
                    );
                    opVal.value = withRepeat(
                        withSequence(
                            withTiming(0.8, { duration: 100 }),
                            withTiming(0, { duration: 700, easing: Easing.in(Easing.quad) }),
                        ),
                        -1,
                        false
                    );
                }, delay);
            };

            animateParticle(particle1Y, particle1Opacity, 0);
            animateParticle(particle2Y, particle2Opacity, 300);
            animateParticle(particle3Y, particle3Opacity, 600);
        }

        return () => {
            // Cleanup by stopping values (reset to defaults)
            flickerScale.value = 1;
            flickerRotate.value = 0;
            glowOpacity.value = 0.2;
        };
    }, [streak]);

    // Animated styles
    const flameContainerStyle = useAnimatedStyle(() => ({
        transform: [
            { scaleX: flickerScale.value },
            { scaleY: interpolate(flickerScale.value, [0.94, 1.08], [1.06, 0.95]) },
            { rotate: `${flickerRotate.value}deg` },
        ],
    }));

    const glowStyle = useAnimatedStyle(() => ({
        position: 'absolute' as const,
        width: size * 1.8,
        height: size * 1.8,
        borderRadius: size,
        backgroundColor: config.glowColor,
        opacity: glowOpacity.value,
        left: -size * 0.4,
        top: -size * 0.4,
    }));

    const particle1Style = useAnimatedStyle(() => ({
        position: 'absolute' as const,
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: config.color,
        opacity: particle1Opacity.value,
        left: size * 0.25,
        top: size * 0.2,
        transform: [{ translateY: particle1Y.value }],
    }));

    const particle2Style = useAnimatedStyle(() => ({
        position: 'absolute' as const,
        width: 2.5,
        height: 2.5,
        borderRadius: 1.25,
        backgroundColor: config.innerColor,
        opacity: particle2Opacity.value,
        left: size * 0.55,
        top: size * 0.15,
        transform: [{ translateY: particle2Y.value }],
    }));

    const particle3Style = useAnimatedStyle(() => ({
        position: 'absolute' as const,
        width: 2,
        height: 2,
        borderRadius: 1,
        backgroundColor: config.color,
        opacity: particle3Opacity.value,
        left: size * 0.7,
        top: size * 0.3,
        transform: [{ translateY: particle3Y.value }],
    }));

    if (streak === 0) return null;

    // Scale the viewBox coordinates to the actual size
    const viewSize = 24;
    const scale = size / viewSize;

    return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            {/* Glow background */}
            {config.hasGlow && <Animated.View style={glowStyle} />}

            {/* Flame SVG */}
            <Animated.View style={[flameContainerStyle, { width: size, height: size }]}>
                <Svg width={size} height={size} viewBox="0 0 24 24">
                    <Defs>
                        <LinearGradient id={`flameGrad_${streak}`} x1="0.5" y1="1" x2="0.5" y2="0">
                            <Stop offset="0" stopColor={config.color} stopOpacity="0.8" />
                            <Stop offset="0.4" stopColor={config.color} stopOpacity="1" />
                            <Stop offset="1" stopColor={config.innerColor} stopOpacity="0.9" />
                        </LinearGradient>
                        <LinearGradient id={`innerFlameGrad_${streak}`} x1="0.5" y1="1" x2="0.5" y2="0">
                            <Stop offset="0" stopColor={config.innerColor} stopOpacity="0.6" />
                            <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.4" />
                        </LinearGradient>
                    </Defs>

                    {/* Side flames (30+ streak) */}
                    {config.hasMultiFlame && (
                        <>
                            <Path
                                d="M6 18C6 18 5 14 6 12C7 10 8 11 7 14C6.5 16 6 18 6 18Z"
                                fill={config.color}
                                opacity={0.5}
                            />
                            <Path
                                d="M18 18C18 18 19 14 18 12C17 10 16 11 17 14C17.5 16 18 18 18 18Z"
                                fill={config.color}
                                opacity={0.5}
                            />
                        </>
                    )}

                    {/* Main flame body */}
                    <Path
                        d="M12 2C12 2 5 10 5 15C5 18.5 7.5 21 10 21.5C10 21.5 9 19 9 17C9 14 12 11 12 11C12 11 15 14 15 17C15 19 14 21.5 14 21.5C16.5 21 19 18.5 19 15C19 10 12 2 12 2Z"
                        fill={`url(#flameGrad_${streak})`}
                    />

                    {/* Inner flame (lighter core) */}
                    <Path
                        d="M12 8C12 8 9 13 9 16C9 18.5 10.5 20 12 20C13.5 20 15 18.5 15 16C15 13 12 8 12 8Z"
                        fill={`url(#innerFlameGrad_${streak})`}
                    />
                </Svg>
            </Animated.View>

            {/* Particles */}
            {config.hasParticles && (
                <>
                    <Animated.View style={particle1Style} />
                    <Animated.View style={particle2Style} />
                    <Animated.View style={particle3Style} />
                </>
            )}
        </View>
    );
};

export default AnimatedFlame;
