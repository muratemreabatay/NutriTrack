import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useCalories } from '../context/CalorieContext';
import Svg, { Circle } from 'react-native-svg';
import { hapticMedium, hapticLight } from '../utils/haptics';

const WaterTrackerScreen = () => {
    const { waterGlasses, waterTarget, addWater, removeWater } = useCalories();

    // Animations
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]).start();
    }, []);

    const handleAdd = () => {
        // Bounce animation + haptic
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 1.3, duration: 100, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
        ]).start();
        hapticMedium();
        addWater();
    };

    const handleRemove = () => {
        hapticLight();
        removeWater();
    };

    const progress = waterTarget > 0 ? Math.min(waterGlasses / waterTarget, 1) : 0;
    const mlConsumed = waterGlasses * 250;
    const mlTarget = waterTarget * 250;

    // Ring config
    const radius = 90;
    const strokeWidth = 16;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - progress * circumference;

    const getMessage = () => {
        if (waterGlasses === 0) return 'Hadi ilk bardağını iç! 💧';
        if (progress < 0.25) return 'İyi başlangıç, devam et!';
        if (progress < 0.5) return 'Harika gidiyorsun! 💪';
        if (progress < 0.75) return 'Yarısından fazlasını içtin!';
        if (progress < 1) return 'Neredeyse hedefe ulaştın! 🎯';
        return 'Günlük hedefini tamamladın! 🎉';
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#030712' }}>
            <StatusBar style="light" />

            {/* Header */}
            <Animated.View
                style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
                className="px-6 pt-4 pb-2"
            >
                <Text className="text-white text-2xl font-bold">Su Takibi</Text>
                <Text className="text-gray-400 text-sm mt-1">{getMessage()}</Text>
            </Animated.View>

            {/* Progress Ring */}
            <Animated.View
                style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
                className="items-center mt-8"
            >
                <View className="relative w-[220px] h-[220px] items-center justify-center">
                    <Svg height="220" width="220" viewBox="0 0 220 220" style={{ position: 'absolute' }}>
                        <Circle
                            cx="110" cy="110" r={radius}
                            stroke="#1E3A5F" strokeWidth={strokeWidth} fill="transparent"
                        />
                        <Circle
                            cx="110" cy="110" r={radius}
                            stroke="#38BDF8"
                            strokeWidth={strokeWidth} fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            rotation="-90" origin="110, 110"
                        />
                    </Svg>
                    <View className="items-center">
                        <Animated.Text
                            style={{ fontSize: 40, fontWeight: 'bold', color: '#38BDF8', transform: [{ scale: scaleAnim }] }}
                        >
                            {waterGlasses}
                        </Animated.Text>
                        <Text className="text-gray-400 text-sm">/ {waterTarget} bardak</Text>
                    </View>
                </View>
            </Animated.View>

            {/* ML Summary */}
            <Animated.View
                style={{ opacity: fadeAnim }}
                className="flex-row mx-6 mt-6 bg-surface rounded-2xl p-4 border border-gray-800"
            >
                <View className="flex-1 items-center">
                    <Text className="text-water text-xl font-bold">{mlConsumed}</Text>
                    <Text className="text-gray-500 text-xs mt-1">ml içildi</Text>
                </View>
                <View className="w-px bg-gray-800" />
                <View className="flex-1 items-center">
                    <Text className="text-gray-300 text-xl font-bold">{Math.max(0, mlTarget - mlConsumed)}</Text>
                    <Text className="text-gray-500 text-xs mt-1">ml kaldı</Text>
                </View>
            </Animated.View>

            {/* Glass Grid */}
            <Animated.View
                style={{ opacity: fadeAnim }}
                className="mx-6 mt-6"
            >
                <Text className="text-gray-400 text-xs uppercase tracking-wider mb-3">Bugünkü Bardaklar</Text>
                <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                    {Array.from({ length: waterTarget }).map((_, i) => (
                        <View
                            key={i}
                            className={`w-12 h-12 rounded-xl items-center justify-center border ${i < waterGlasses
                                ? 'bg-water/20 border-water/40'
                                : 'bg-surface border-gray-800'
                                }`}
                        >
                            <Text style={{ fontSize: i < waterGlasses ? 20 : 16, opacity: i < waterGlasses ? 1 : 0.3 }}>
                                {i < waterGlasses ? '💧' : '○'}
                            </Text>
                        </View>
                    ))}
                </View>
            </Animated.View>

            {/* Action Buttons */}
            <View className="absolute bottom-10 left-6 right-6">
                <View className="flex-row items-center justify-center" style={{ gap: 16 }}>
                    {/* Remove */}
                    <TouchableOpacity
                        onPress={handleRemove}
                        disabled={waterGlasses === 0}
                        activeOpacity={0.7}
                        className={`w-14 h-14 rounded-full items-center justify-center border ${waterGlasses > 0 ? 'bg-surface border-gray-700' : 'bg-gray-900 border-gray-800'}`}
                    >
                        <Text className={`text-2xl font-bold ${waterGlasses > 0 ? 'text-white' : 'text-gray-700'}`}>−</Text>
                    </TouchableOpacity>

                    {/* Add */}
                    <TouchableOpacity
                        onPress={handleAdd}
                        activeOpacity={0.8}
                        className="w-20 h-20 bg-water rounded-full items-center justify-center"
                        style={{ shadowColor: '#38BDF8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 16 }}
                    >
                        <Text style={{ fontSize: 28 }}>💧</Text>
                    </TouchableOpacity>

                    {/* Info */}
                    <View className="w-14 h-14 rounded-full items-center justify-center bg-surface border border-gray-700">
                        <Text className="text-gray-400 text-xs font-bold">250</Text>
                        <Text className="text-gray-500 text-[8px]">ml</Text>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default WaterTrackerScreen;
