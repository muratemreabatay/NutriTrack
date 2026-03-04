import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallScreen = SCREEN_WIDTH < 380;
const ringSize = Math.min(SCREEN_WIDTH * 0.4, 170);
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';

import { useCalories } from '../context/CalorieContext';
import { MEAL_CATEGORIES } from '../constants';
import { hapticLight, hapticMedium } from '../utils/haptics';
import MacroCard from '../components/MacroCard';
import StreakBadge from '../components/StreakBadge';
import WeeklyChart from '../components/WeeklyChart';
import AnimatedWaterGlass from '../components/AnimatedWaterGlass';
import Svg, { Circle, Path, Line, Rect } from 'react-native-svg';



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
    const { consumed, targets, streak, mealHistory, removeMeal, badgeQueue, clearNewBadge, waterGlasses, waterTarget, dailyHistory } = useCalories();

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
    const radius = (ringSize / 2) - 10;
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
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {/* Ring - responsive size */}
                        <View style={{ position: 'relative', width: ringSize, height: ringSize, alignItems: 'center', justifyContent: 'center' }}>
                            <Svg height={ringSize} width={ringSize} viewBox={`0 0 ${ringSize} ${ringSize}`} style={{ position: 'absolute' }}>
                                <Circle
                                    cx={ringSize / 2} cy={ringSize / 2} r={radius}
                                    stroke="#1F2937" strokeWidth={strokeWidth} fill="transparent"
                                />
                                <Circle
                                    cx={ringSize / 2} cy={ringSize / 2} r={radius}
                                    stroke={progress >= 1 ? '#FBBF24' : '#34D399'}
                                    strokeWidth={strokeWidth} fill="transparent"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                    rotation="-90" origin={`${ringSize / 2}, ${ringSize / 2}`}
                                />
                            </Svg>
                            <View style={{ alignItems: 'center' }}>
                                <Text style={{ color: '#fff', fontSize: isSmallScreen ? 24 : 28, fontWeight: 'bold' }}>{consumed.calories}</Text>
                                <Text style={{ color: '#6B7280', fontSize: 11, marginTop: 2 }}>yenildi</Text>
                            </View>
                        </View>

                        {/* Stats */}
                        <View style={{ flex: 1, marginLeft: 16 }}>
                            <View style={{ marginBottom: 16 }}>
                                <Text className="text-gray-500 text-xs uppercase tracking-wider">Hedef</Text>
                                <Text className="text-white text-xl font-bold">{targets.calories}</Text>
                            </View>
                            <View style={{ marginBottom: 16 }}>
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
                            <AnimatedWaterGlass fillLevel={waterTarget > 0 ? Math.min(waterGlasses / waterTarget, 1) : 0} size={28} showWave={waterGlasses > 0} />
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
                        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                            <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="#030712" strokeWidth={2} strokeLinejoin="round" />
                            <Circle cx={12} cy={13} r={4} stroke="#030712" strokeWidth={2} />
                        </Svg>
                        <Text className="text-black font-bold ml-2 text-sm">Fotoğrafla</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="bg-gray-800 rounded-xl px-5 py-3 flex-row items-center"
                        onPress={() => { hapticLight(); navigation.navigate('ManualEntry' as never); }}
                        activeOpacity={0.8}
                    >
                        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                            <Path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke="#FFFFFF" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                        </Svg>
                        <Text className="text-white font-bold ml-2 text-sm">Manuel</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* BADGE EARNED MODAL */}
            {badgeQueue.length > 0 && (
                <View className="absolute top-0 bottom-0 left-0 right-0 h-full w-full bg-black/80 items-center justify-center z-50">
                    <Animated.View
                        style={{ transform: [{ scale: scaleAnim }] }}
                        className="bg-surface p-8 rounded-3xl items-center border border-primary/30 w-4/5"
                    >
                        <Text className="text-5xl mb-2">🏆</Text>
                        <View className="w-16 h-16 bg-primary/20 rounded-full items-center justify-center mb-3">
                            <Text className="text-3xl">{badgeQueue[0].icon}</Text>
                        </View>
                        {badgeQueue.length > 1 && (
                            <View style={{ backgroundColor: 'rgba(52,211,153,0.2)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, marginBottom: 4 }}>
                                <Text style={{ color: '#34D399', fontSize: 11, fontWeight: 'bold' }}>1 / {badgeQueue.length}</Text>
                            </View>
                        )}
                        <Text className="text-primary text-xs font-bold uppercase tracking-wider mb-1">Yeni Rozet!</Text>
                        <Text className="text-white text-xl font-bold text-center mb-1">{badgeQueue[0].name}</Text>
                        <Text className="text-gray-400 text-center text-sm mb-6">{badgeQueue[0].description}</Text>
                        <TouchableOpacity onPress={clearNewBadge} className="bg-primary px-8 py-3 rounded-full">
                            <Text className="text-black font-bold">{badgeQueue.length > 1 ? 'SONRAKİ →' : 'HARİKA!'}</Text>
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
