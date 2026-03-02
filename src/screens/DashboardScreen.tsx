import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';

import { useCalories } from '../context/CalorieContext';
import { MEAL_CATEGORIES } from '../constants';
import { hapticLight, hapticMedium } from '../utils/haptics';
import MacroCard from '../components/MacroCard';
import StreakBadge from '../components/StreakBadge';
import WeeklyChart from '../components/WeeklyChart';
import Svg, { Circle } from 'react-native-svg';



const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 6) return 'İyi Geceler';
    if (hour < 12) return 'Günaydın';
    if (hour < 18) return 'İyi Günler';
    return 'İyi Akşamlar';
};

const getMotivation = (progress: number): string => {
    if (progress === 0) return 'Hadi bugüne başlayalım! 💪';
    if (progress < 0.3) return 'Güzel başlangıç!';
    if (progress < 0.6) return 'Yarısına geldin 🔥';
    if (progress < 0.9) return 'Hedefe yaklaşıyorsun!';
    if (progress < 1) return 'Neredeyse tamamladın! 🎯';
    return 'Hedef tamamlandı! 🏆';
};

const DashboardScreen = () => {
    const navigation = useNavigation();
    const { consumed, targets, streak, mealHistory, removeMeal, newlyEarnedBadge, clearNewBadge, waterGlasses, waterTarget, dailyHistory } = useCalories();

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, friction: 8, useNativeDriver: true }),
        ]).start();
    }, []);

    // Calculate dynamic stats
    const remaining = Math.max(0, targets.calories - consumed.calories);
    const progress = targets.calories > 0 ? Math.min(consumed.calories / targets.calories, 1) : 0;

    // Celebration State
    const [showCelebration, setShowCelebration] = React.useState(false);
    const [hasCelebrated, setHasCelebrated] = React.useState(false);

    useEffect(() => {
        if (progress >= 1 && !hasCelebrated) {
            setShowCelebration(true);
            setHasCelebrated(true);
        }
    }, [progress, hasCelebrated]);

    // Circle Config
    const radius = 75;
    const strokeWidth = 14;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - progress * circumference;

    // Group meals by category (single pass, memoized)
    const mealsByCategory = useMemo(() => {
        const groups: Record<string, typeof mealHistory> = { breakfast: [], lunch: [], dinner: [], snack: [] };
        mealHistory.forEach(m => {
            let cat = m.category;
            if (!cat) {
                const hour = new Date(m.timestamp).getHours();
                if (hour >= 6 && hour < 10) cat = 'breakfast';
                else if (hour >= 10 && hour < 15) cat = 'lunch';
                else if (hour >= 15 && hour < 21) cat = 'dinner';
                else cat = 'snack';
            }
            (groups[cat] ??= []).push(m);
        });
        return groups;
    }, [mealHistory]);

    const getCategoryCalories = (categoryId: string) =>
        (mealsByCategory[categoryId] || []).reduce((sum, m) => sum + m.nutrients.calories, 0);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#030712' }}>
            <StatusBar style="light" />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

                {/* Header */}
                <Animated.View
                    style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
                    className="px-6 pt-4 pb-2"
                >
                    <View className="flex-row justify-between items-center">
                        <View>
                            <Text className="text-gray-400 text-sm">{getGreeting()} 👋</Text>
                            <Text className="text-white text-2xl font-bold mt-1">Bugünün Özeti</Text>
                        </View>
                        <View className="flex-row items-center">
                            <StreakBadge streak={streak} />
                        </View>
                    </View>
                </Animated.View>

                {/* Calorie Ring Card */}
                <Animated.View
                    style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}
                    className="mx-6 mt-4 bg-surface rounded-3xl p-6 border border-gray-800"
                >
                    <View className="flex-row items-center">
                        {/* Ring */}
                        <View className="relative w-[170px] h-[170px] items-center justify-center">
                            <Svg height="170" width="170" viewBox="0 0 170 170" style={{ position: 'absolute' }}>
                                <Circle
                                    cx="85" cy="85" r={radius}
                                    stroke="#1F2937" strokeWidth={strokeWidth} fill="transparent"
                                />
                                <Circle
                                    cx="85" cy="85" r={radius}
                                    stroke={progress >= 1 ? '#FBBF24' : '#34D399'}
                                    strokeWidth={strokeWidth} fill="transparent"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                    rotation="-90" origin="85, 85"
                                />
                            </Svg>
                            <View className="items-center">
                                <Text className="text-white text-3xl font-bold">{consumed.calories}</Text>
                                <Text className="text-gray-500 text-xs mt-1">yenildi</Text>
                            </View>
                        </View>

                        {/* Stats */}
                        <View className="flex-1 ml-4">
                            <View className="mb-4">
                                <Text className="text-gray-500 text-xs uppercase tracking-wider">Hedef</Text>
                                <Text className="text-white text-xl font-bold">{targets.calories}</Text>
                            </View>
                            <View className="mb-4">
                                <Text className="text-gray-500 text-xs uppercase tracking-wider">Kalan</Text>
                                <Text className="text-primary text-xl font-bold">{remaining}</Text>
                            </View>
                            <Text className="text-gray-400 text-xs leading-4">{getMotivation(progress)}</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Macro Cards */}
                <Animated.View
                    style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
                    className="px-6 mt-4 flex-row justify-between"
                >
                    <View style={{ flex: 1, marginRight: 4 }}>
                        <MacroCard label="Protein" consumed={consumed.protein} target={targets.protein} color="#60A5FA" />
                    </View>
                    <View style={{ flex: 1, marginHorizontal: 4 }}>
                        <MacroCard label="Karb." consumed={consumed.carbs} target={targets.carbs} color="#FBBF24" />
                    </View>
                    <View style={{ flex: 1, marginLeft: 4 }}>
                        <MacroCard label="Yağ" consumed={consumed.fat} target={targets.fat} color="#F97316" />
                    </View>
                </Animated.View>

                {/* Meal Categories */}
                <Animated.View
                    style={{ opacity: fadeAnim }}
                    className="px-6 mt-8"
                >
                    <Text className="text-white text-lg font-bold mb-4">Öğünler</Text>
                    {MEAL_CATEGORIES.map((cat, index) => {
                        const meals = mealsByCategory[cat.id] || [];
                        const catCalories = getCategoryCalories(cat.id);
                        return (
                            <View key={cat.id} className="bg-surface rounded-2xl border border-gray-800 mb-3 overflow-hidden">
                                {/* Category Header */}
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('ManualEntry' as never)}
                                    className="flex-row items-center p-4"
                                    activeOpacity={0.7}
                                >
                                    <View className="w-10 h-10 bg-gray-800 rounded-xl items-center justify-center mr-3">
                                        <Text style={{ fontSize: 18 }}>{cat.icon}</Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-white font-semibold">{cat.label}</Text>
                                        <Text className="text-gray-600 text-xs">{cat.timeRange}</Text>
                                    </View>
                                    {catCalories > 0 && (
                                        <Text className="text-primary font-bold text-sm mr-2">{catCalories} kcal</Text>
                                    )}
                                    <View className="w-7 h-7 bg-primary/20 rounded-full items-center justify-center">
                                        <Text className="text-primary text-lg font-bold">+</Text>
                                    </View>
                                </TouchableOpacity>

                                {/* Meals in category */}
                                {meals.length > 0 && (
                                    <View className="border-t border-gray-800">
                                        {meals.map((meal) => (
                                            <View key={meal.id} className="flex-row items-center px-4 py-3 border-b border-gray-800/50">
                                                <View className="flex-1 ml-13">
                                                    <Text className="text-gray-300 text-sm">{meal.name}</Text>
                                                    <Text className="text-gray-600 text-xs">
                                                        {new Date(meal.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                    </Text>
                                                </View>
                                                <Text className="text-gray-400 text-sm mr-3">{meal.nutrients.calories} kcal</Text>
                                                <TouchableOpacity onPress={() => removeMeal(meal.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                                    <Text className="text-gray-700 text-base">✕</Text>
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </Animated.View>

                {/* Water Widget */}
                <Animated.View
                    style={{ opacity: fadeAnim }}
                    className="mx-6 mt-4 bg-surface rounded-2xl p-5 border border-gray-800"
                >
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <Text style={{ fontSize: 24 }}>💧</Text>
                            <View className="ml-3">
                                <Text className="text-white font-semibold">Su Takibi</Text>
                                <Text className="text-gray-500 text-xs">{waterGlasses * 250} / {waterTarget * 250} ml</Text>
                            </View>
                        </View>
                        <View className="bg-water/20 px-4 py-2 rounded-full">
                            <Text className="text-water font-bold text-sm">{waterGlasses}/{waterTarget}</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Weekly Chart */}
                <Animated.View style={{ opacity: fadeAnim }} className="mx-6 mt-4 mb-6">
                    <WeeklyChart
                        dailyHistory={dailyHistory}
                        todayCalories={consumed.calories}
                        targetCalories={targets.calories}
                    />
                </Animated.View>

            </ScrollView>

            {/* Floating Add Button */}
            <View className="absolute bottom-4 w-full items-center z-40">
                <View className="flex-row items-center bg-surface/95 rounded-2xl px-2 py-2 border border-gray-800" style={{ gap: 6 }}>
                    <TouchableOpacity
                        className="bg-primary rounded-xl px-5 py-3 flex-row items-center"
                        onPress={() => { hapticMedium(); navigation.navigate('Camera' as never); }}
                        activeOpacity={0.8}
                    >
                        <Text style={{ fontSize: 16 }}>📸</Text>
                        <Text className="text-black font-bold ml-2 text-sm">Fotoğrafla</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="bg-gray-800 rounded-xl px-5 py-3 flex-row items-center"
                        onPress={() => { hapticLight(); navigation.navigate('ManualEntry' as never); }}
                        activeOpacity={0.8}
                    >
                        <Text style={{ fontSize: 16 }}>✏️</Text>
                        <Text className="text-white font-bold ml-2 text-sm">Manuel</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* BADGE EARNED MODAL */}
            {newlyEarnedBadge && (
                <View className="absolute top-0 bottom-0 left-0 right-0 h-full w-full bg-black/80 items-center justify-center z-50">
                    <Animated.View
                        style={{ transform: [{ scale: scaleAnim }] }}
                        className="bg-surface p-8 rounded-3xl items-center border border-primary/30 w-4/5"
                    >
                        <Text className="text-5xl mb-2">🏆</Text>
                        <View className="w-16 h-16 bg-primary/20 rounded-full items-center justify-center mb-3">
                            <Text className="text-3xl">{newlyEarnedBadge.icon}</Text>
                        </View>
                        <Text className="text-primary text-xs font-bold uppercase tracking-wider mb-1">Yeni Rozet!</Text>
                        <Text className="text-white text-xl font-bold text-center mb-1">{newlyEarnedBadge.name}</Text>
                        <Text className="text-gray-400 text-center text-sm mb-6">{newlyEarnedBadge.description}</Text>
                        <TouchableOpacity onPress={clearNewBadge} className="bg-primary px-8 py-3 rounded-full">
                            <Text className="text-black font-bold">HARİKA!</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            )}

            {/* GOAL REACHED MODAL */}
            {showCelebration && (
                <View className="absolute top-0 bottom-0 left-0 right-0 h-full w-full bg-black/80 items-center justify-center z-50">
                    <View className="bg-surface p-8 rounded-3xl items-center border border-accent/30 w-4/5">
                        <Text className="text-6xl mb-4">🎉</Text>
                        <Text className="text-white text-2xl font-bold text-center mb-2">Harikasın!</Text>
                        <Text className="text-gray-400 text-center mb-6">Günlük hedefini tamamladın. İstikrarını koru!</Text>
                        <TouchableOpacity onPress={() => setShowCelebration(false)} className="bg-accent px-8 py-3 rounded-full">
                            <Text className="text-black font-bold">TAMAM</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
};

export default DashboardScreen;
