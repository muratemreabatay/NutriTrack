import React, { useRef, useState, useCallback } from 'react';
import { View, Text, ScrollView } from 'react-native';

const TICK_WIDTH = 20; // Total width per tick mark

type RulerPickerProps = {
    label: string;
    value: number;
    setValue: (val: number) => void;
    min: number;
    max: number;
    step?: number;
    unit: string;
};

const RulerPicker = ({ label, value, setValue, min, max, step = 1, unit }: RulerPickerProps) => {
    const scrollRef = useRef<ScrollView>(null);
    const totalSteps = Math.round((max - min) / step);
    const [containerWidth, setContainerWidth] = useState(300);
    const sidePadding = (containerWidth - TICK_WIDTH) / 2;
    const isScrollingRef = useRef(false);

    const scrollToValue = useCallback((val: number, animated = false) => {
        const index = Math.round((val - min) / step);
        scrollRef.current?.scrollTo({ x: index * TICK_WIDTH, animated });
    }, [min, step]);

    const handleContainerLayout = useCallback((e: any) => {
        const w = e.nativeEvent.layout.width;
        setContainerWidth(w);
        // Scroll to initial value after layout
        setTimeout(() => scrollToValue(value, false), 50);
    }, [value, scrollToValue]);

    const handleScroll = useCallback((event: any) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / TICK_WIDTH);
        const clampedIndex = Math.max(0, Math.min(totalSteps, index));
        const newValue = Math.round((min + clampedIndex * step) * 10) / 10;
        if (newValue !== value) {
            setValue(newValue);
        }
    }, [min, step, totalSteps, value, setValue]);

    const formatLabel = (val: number) => {
        if (step >= 1) return String(Math.round(val));
        return val.toFixed(1);
    };

    return (
        <View style={{ marginBottom: 24 }}>
            {/* Label and Value */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8, paddingHorizontal: 4 }}>
                <Text style={{ color: '#9CA3AF', fontSize: 14, fontWeight: '500' }}>{label}</Text>
                <Text style={{ color: '#fff', fontSize: 28, fontWeight: 'bold' }}>
                    {formatLabel(value)} <Text style={{ color: '#34D399', fontSize: 14, fontWeight: '400' }}>{unit}</Text>
                </Text>
            </View>

            {/* Ruler */}
            <View
                onLayout={handleContainerLayout}
                style={{ height: 80, backgroundColor: '#111827', borderRadius: 16, borderWidth: 1, borderColor: '#1F2937', overflow: 'hidden' }}
            >
                {/* Center Indicator Line */}
                <View style={{
                    position: 'absolute',
                    left: containerWidth / 2 - 1.5,
                    top: 0,
                    bottom: 0,
                    width: 3,
                    backgroundColor: '#34D399',
                    zIndex: 10,
                    borderRadius: 2,
                }} />
                {/* Triangle pointer */}
                <View style={{
                    position: 'absolute',
                    left: containerWidth / 2 - 6,
                    top: 2,
                    width: 0,
                    height: 0,
                    borderLeftWidth: 6,
                    borderRightWidth: 6,
                    borderTopWidth: 6,
                    borderLeftColor: 'transparent',
                    borderRightColor: 'transparent',
                    borderTopColor: '#34D399',
                    zIndex: 10,
                }} />

                <ScrollView
                    ref={scrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    snapToInterval={TICK_WIDTH}
                    decelerationRate="fast"
                    onMomentumScrollEnd={handleScroll}
                    onScrollEndDrag={handleScroll}
                    contentContainerStyle={{
                        paddingHorizontal: sidePadding,
                        alignItems: 'flex-end',
                        paddingBottom: 16,
                    }}
                >
                    {Array.from({ length: totalSteps + 1 }).map((_, i) => {
                        const isMajor = step >= 1 ? i % 5 === 0 : i % 10 === 0;
                        const tickValue = Math.round((min + i * step) * 10) / 10;

                        return (
                            <View key={i} style={{ width: TICK_WIDTH, alignItems: 'center' }}>
                                {isMajor && (
                                    <Text style={{
                                        color: '#6B7280',
                                        fontSize: 10,
                                        marginBottom: 4,
                                        fontWeight: '600',
                                    }}>
                                        {formatLabel(tickValue)}
                                    </Text>
                                )}
                                <View style={{
                                    width: isMajor ? 2.5 : 1,
                                    height: isMajor ? 32 : 16,
                                    backgroundColor: isMajor ? '#4B5563' : '#374151',
                                    borderRadius: 1,
                                }} />
                            </View>
                        );
                    })}
                </ScrollView>
            </View>
        </View>
    );
};

export default RulerPicker;
