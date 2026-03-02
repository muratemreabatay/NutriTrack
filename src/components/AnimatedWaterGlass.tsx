import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Path, Rect, Defs, LinearGradient, Stop, ClipPath } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withTiming,
    withSpring,
    Easing,
    useDerivedValue,
} from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);

type AnimatedWaterGlassProps = {
    fillLevel: number; // 0 to 1
    size?: number;
    showWave?: boolean;
};

// Fixed coordinate system for the glass SVG
const VB_WIDTH = 100;
const VB_HEIGHT = 120;
const GLASS_LEFT = 15;
const GLASS_RIGHT = 85;
const GLASS_TOP = 8;
const GLASS_BOTTOM_LEFT = 22;
const GLASS_BOTTOM_RIGHT = 78;
const GLASS_BOTTOM_Y = 105;
const WATER_INNER_LEFT = 20;
const WATER_INNER_RIGHT = 80;

const AnimatedWaterGlass = ({ fillLevel, size = 80, showWave = true }: AnimatedWaterGlassProps) => {
    const wavePhase = useSharedValue(0);
    const animatedFill = useSharedValue(fillLevel);

    // Continuous wave animation — use a very large target to avoid visible reset
    useEffect(() => {
        if (showWave) {
            wavePhase.value = 0;
            wavePhase.value = withTiming(10000 * 2 * Math.PI, {
                duration: 10000 * 2500,
                easing: Easing.linear,
            });
        }
    }, [showWave]);

    // Animate fill level changes
    useEffect(() => {
        animatedFill.value = withSpring(fillLevel, {
            damping: 14,
            stiffness: 80,
        });
    }, [fillLevel]);

    // Wave amplitude
    const waveAmplitude = showWave ? 3.5 : 0;
    const waveFrequency = 1.5;

    const waterPath = useDerivedValue(() => {
        const fill = Math.max(0, Math.min(1, animatedFill.value));
        if (fill <= 0.01) return '';

        // Water area within the glass
        const waterAreaTop = GLASS_TOP + 6;
        const waterAreaBottom = GLASS_BOTTOM_Y - 4;
        const waterHeight = (waterAreaBottom - waterAreaTop) * fill;
        const waterTop = waterAreaBottom - waterHeight;

        // Calculate left and right edges at waterTop level (glass tapers)
        const taper = (y: number) => {
            const t = (y - GLASS_TOP) / (GLASS_BOTTOM_Y - GLASS_TOP);
            const left = GLASS_LEFT + (GLASS_BOTTOM_LEFT - GLASS_LEFT) * t;
            const right = GLASS_RIGHT + (GLASS_BOTTOM_RIGHT - GLASS_RIGHT) * t;
            return { left: left + 3, right: right - 3 };
        };

        const topEdge = taper(waterTop);
        const bottomEdge = taper(waterAreaBottom);

        // Generate wave path across the top
        const steps = 20;
        const waterWidth = topEdge.right - topEdge.left;
        const stepWidth = waterWidth / steps;

        let path = `M ${bottomEdge.left} ${waterAreaBottom}`;
        path += ` L ${topEdge.left} ${waterTop}`;

        for (let i = 0; i <= steps; i++) {
            const x = topEdge.left + i * stepWidth;
            const waveY = waterTop + Math.sin(wavePhase.value + (i / steps) * waveFrequency * 2 * Math.PI) * waveAmplitude;
            path += ` L ${x} ${waveY}`;
        }

        path += ` L ${bottomEdge.right} ${waterAreaBottom}`;
        path += ' Z';

        return path;
    });

    const animatedWaterProps = useAnimatedProps(() => ({
        d: waterPath.value,
    }));

    // Calculate display size (maintaining aspect ratio)
    const aspectRatio = VB_WIDTH / VB_HEIGHT;
    const displayWidth = size;
    const displayHeight = size / aspectRatio;

    // Glass outline path
    const glassPath = `
        M ${GLASS_LEFT} ${GLASS_TOP}
        L ${GLASS_BOTTOM_LEFT} ${GLASS_BOTTOM_Y}
        Q 50 ${GLASS_BOTTOM_Y + 8} ${GLASS_BOTTOM_RIGHT} ${GLASS_BOTTOM_Y}
        L ${GLASS_RIGHT} ${GLASS_TOP}
    `;

    // Clip path for water (same as glass shape)
    const clipPath = `
        M ${GLASS_LEFT} ${GLASS_TOP}
        L ${GLASS_BOTTOM_LEFT} ${GLASS_BOTTOM_Y}
        Q 50 ${GLASS_BOTTOM_Y + 8} ${GLASS_BOTTOM_RIGHT} ${GLASS_BOTTOM_Y}
        L ${GLASS_RIGHT} ${GLASS_TOP}
        Z
    `;

    return (
        <View style={{ width: displayWidth, height: displayHeight, alignItems: 'center', justifyContent: 'center' }}>
            <Svg
                width={displayWidth}
                height={displayHeight}
                viewBox={`0 0 ${VB_WIDTH} ${VB_HEIGHT}`}
            >
                <Defs>
                    {/* Water gradient */}
                    <LinearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor="#60CFFF" stopOpacity="0.9" />
                        <Stop offset="1" stopColor="#1E6CB8" stopOpacity="0.95" />
                    </LinearGradient>
                    {/* Glass gradient */}
                    <LinearGradient id="glassGrad" x1="0" y1="0" x2="1" y2="0">
                        <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.14" />
                        <Stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.07" />
                        <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.12" />
                    </LinearGradient>
                    {/* Clip to glass shape */}
                    <ClipPath id="glassClip">
                        <Path d={clipPath} />
                    </ClipPath>
                </Defs>

                {/* Glass body (filled background) */}
                <Path
                    d={glassPath}
                    fill="url(#glassGrad)"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth={2}
                    strokeLinejoin="round"
                />

                {/* Water fill (clipped to glass) */}
                {fillLevel > 0 && (
                    <AnimatedPath
                        animatedProps={animatedWaterProps}
                        fill="url(#waterGrad)"
                        clipPath="url(#glassClip)"
                    />
                )}

                {/* Glass rim (top edge) */}
                <Path
                    d={`M ${GLASS_LEFT - 2} ${GLASS_TOP} L ${GLASS_RIGHT + 2} ${GLASS_TOP}`}
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                />

                {/* Glass reflection highlight */}
                <Rect
                    x={GLASS_LEFT + 5}
                    y={GLASS_TOP + 8}
                    width={3.5}
                    height={55}
                    rx={1.75}
                    fill="rgba(255,255,255,0.1)"
                />
            </Svg>
        </View>
    );
};

export default AnimatedWaterGlass;
