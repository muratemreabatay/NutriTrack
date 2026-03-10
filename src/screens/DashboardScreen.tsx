import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';

import { useCalories } from '../context/CalorieContext';
import { useLanguage } from '../i18n/LanguageContext';
import { hapticLight, hapticMedium } from '../utils/haptics';
import { resolveBadgeName, resolveBadgeDesc } from '../utils/badges';
import { MEAL_CATEGORY_DEFS } from '../constants';
import MacroCard from '../components/MacroCard';
import StreakBadge from '../components/StreakBadge';
import WeeklyChart from '../components/WeeklyChart';
import AnimatedWaterGlass from '../components/AnimatedWaterGlass';
import AvatarDisplay from '../components/AvatarDisplay';
import Svg, { Circle, Path } from 'react-native-svg';

const DashboardScreen = () => {
    const navigation = useNavigation();
    const { t, lang } = useLanguage();
    const { consumed, targets, streak, mealHistory, removeMeal, badgeQueue, clearNewBadge, waterGlasses, waterTarget, dailyHistory, userProfile } = useCalories();

    const { width: SCREEN_WIDTH } = useWindowDimensions();
    const isSmallScreen = SCREEN_WIDTH < 380;
    const ringSize = Math.min(SCREEN_WIDTH * 0.4, 170);

    const getGreeting = (): string => {
        const hour = new Date().getHours();
        const name = userProfile?.name ? `, ${userProfile.name}` : '';
        if (hour < 12) return `${t.dashboard.greetingMorning}${name}`;
        if (hour < 18) return `${t.dashboard.greetingAfternoon}${name}`;
        return `${t.dashboard.greetingEvening}${name}`;
    };

    const getMotivation = (progress: number): string => {
        if (progress === 0) return t.dashboard.motivation.low;
        if (progress < 0.5) return t.dashboard.motivation.mid;
        if (progress < 1) return t.dashboard.motivation.high;
        if (progress >= 1.1) return t.dashboard.motivation.over;
        return t.dashboard.motivation.done;
    };



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

    const remaining = Math.max(0, targets.calories - consumed.calories);
    const progress = targets.calories > 0 ? Math.min(consumed.calories / targets.calories, 1) : 0;

    const [showCelebration, setShowCelebration] = React.useState(false);
    const [hasCelebrated, setHasCelebrated] = React.useState(false);

    useEffect(() => {
        if (progress >= 1 && !hasCelebrated) {
            setShowCelebration(true);
            setHasCelebrated(true);
        }
    }, [progress, hasCelebrated]);

    const radius = (ringSize / 2) - 10;
    const strokeWidth = 14;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - progress * circumference;

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



    const locale = lang === 'tr' ? 'tr-TR' : 'en-US';

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
                            <Text className="text-white text-2xl font-bold mt-1">{t.dashboard.todaySummary}</Text>
                        </View>
                        <View className="flex-row items-center">
                            <StreakBadge streak={streak} />
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Profile' as never)}
                                activeOpacity={0.8}
                                className="w-10 h-10 bg-surface rounded-full items-center justify-center border-2 border-primary/30 ml-3"
                            >
                                <AvatarDisplay avatar={userProfile.avatar} name={userProfile.name} size="sm" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>

                {/* Calorie Ring Card */}
                <Animated.View
                    style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}
                    className="mx-6 mt-4 bg-surface rounded-3xl p-6 border border-gray-800"
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ position: 'relative', width: ringSize, height: ringSize, alignItems: 'center', justifyContent: 'center' }}>
                            <Svg height={ringSize} width={ringSize} viewBox={`0 0 ${ringSize} ${ringSize}`} style={{ position: 'absolute' }}>
                                <Circle cx={ringSize / 2} cy={ringSize / 2} r={radius} stroke="#1F2937" strokeWidth={strokeWidth} fill="transparent" />
                                <Circle cx={ringSize / 2} cy={ringSize / 2} r={radius}
                                    stroke={progress >= 1 ? '#FBBF24' : '#34D399'}
                                    strokeWidth={strokeWidth} fill="transparent"
                                    strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round" rotation="-90" origin={`${ringSize / 2}, ${ringSize / 2}`}
                                />
                            </Svg>
                            <View style={{ alignItems: 'center' }}>
                                <Text style={{ color: '#fff', fontSize: isSmallScreen ? 24 : 28, fontWeight: 'bold' }}>{consumed.calories}</Text>
                                <Text style={{ color: '#6B7280', fontSize: 11, marginTop: 2 }}>{t.dashboard.eaten}</Text>
                            </View>
                        </View>

                        <View style={{ flex: 1, marginLeft: 16 }}>
                            <View style={{ marginBottom: 16 }}>
                                <Text className="text-gray-500 text-xs uppercase tracking-wider">{t.dashboard.target}</Text>
                                <Text className="text-white text-xl font-bold">{targets.calories}</Text>
                            </View>
                            <View style={{ marginBottom: 16 }}>
                                <Text className="text-gray-500 text-xs uppercase tracking-wider">{t.dashboard.remaining}</Text>
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
                        <MacroCard label={t.common.protein} consumed={consumed.protein} target={targets.protein} color="#60A5FA" />
                    </View>
                    <View style={{ flex: 1, marginHorizontal: 4 }}>
                        <MacroCard label={t.common.carbs} consumed={consumed.carbs} target={targets.carbs} color="#FBBF24" />
                    </View>
                    <View style={{ flex: 1, marginLeft: 4 }}>
                        <MacroCard label={t.common.fat} consumed={consumed.fat} target={targets.fat} color="#F97316" />
                    </View>
                </Animated.View>

                {/* Meal Categories */}
                <Animated.View style={{ opacity: fadeAnim }} className="px-6 mt-8">
                    <Text className="text-white text-lg font-bold mb-4">{t.dashboard.meals}</Text>
                    {MEAL_CATEGORY_DEFS.map((cat) => {
                        const meals = mealsByCategory[cat.id] || [];
                        const catCalories = getCategoryCalories(cat.id);
                        const catLabel = t.mealCategories[cat.id as keyof typeof t.mealCategories];
                        return (
                            <View key={cat.id} className="bg-surface rounded-2xl border border-gray-800 mb-3 overflow-hidden">
                                <TouchableOpacity
                                    onPress={() => { hapticMedium(); (navigation as any).navigate('ManualEntry', { mealType: cat.id }); }}
                                    className="flex-row items-center p-4"
                                    activeOpacity={0.7}
                                >
                                    <View className="w-10 h-10 bg-gray-800 rounded-xl items-center justify-center mr-3">
                                        <Text style={{ fontSize: 18 }}>{cat.icon}</Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-white font-semibold">{catLabel}</Text>
                                        <Text className="text-gray-600 text-xs">{cat.timeRange[lang]}</Text>
                                    </View>
                                    {catCalories > 0 && (
                                        <Text className="text-primary font-bold text-sm mr-2">{catCalories} kcal</Text>
                                    )}
                                    <View className="w-7 h-7 bg-primary/20 rounded-full items-center justify-center">
                                        <Text className="text-primary text-lg font-bold">+</Text>
                                    </View>
                                </TouchableOpacity>

                                {meals.length > 0 && (
                                    <View className="border-t border-gray-800">
                                        {meals.map((meal) => (
                                            <View key={meal.id} className="flex-row items-center px-4 py-3 border-b border-gray-800/50">
                                                <View className="flex-1 ml-13">
                                                    <Text className="text-gray-300 text-sm">{meal.name}</Text>
                                                    <Text className="text-gray-600 text-xs">
                                                        {new Date(meal.timestamp).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
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
                                <Text className="text-white font-semibold">{t.water.title}</Text>
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
                    <View className="relative">
                        <View className="absolute -top-5 left-0 right-0 items-center z-10">
                            <Text style={{ fontSize: 9, fontWeight: '700', color: '#34D399', letterSpacing: 1 }}>
                                {lang === 'tr' ? 'YAKINDA' : 'COMING SOON'}
                            </Text>
                        </View>
                        <TouchableOpacity
                            className="bg-primary/30 rounded-xl px-5 py-3 flex-row items-center"
                            onPress={() => { /* AI Camera — coming soon */ }}
                            activeOpacity={1}
                            style={{ opacity: 0.5 }}
                        >
                            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                                <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="#9CA3AF" strokeWidth={2} strokeLinejoin="round" />
                                <Circle cx={12} cy={13} r={4} stroke="#9CA3AF" strokeWidth={2} />
                            </Svg>
                            <Text className="text-gray-400 font-bold ml-2 text-sm">{t.camera.title}</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        className="bg-gray-800 rounded-xl px-5 py-3 flex-row items-center"
                        onPress={() => { hapticLight(); navigation.navigate('ManualEntry' as never); }}
                        activeOpacity={0.8}
                    >
                        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                            <Path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke="#FFFFFF" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                        </Svg>
                        <Text className="text-white font-bold ml-2 text-sm">{t.manual.title}</Text>
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
                        <Text className="text-5xl mb-2">✨</Text>
                        <View className="w-16 h-16 bg-primary/20 rounded-full items-center justify-center mb-3">
                            <Text className="text-3xl">{badgeQueue[0].icon}</Text>
                        </View>
                        {badgeQueue.length > 1 && (
                            <View style={{ backgroundColor: 'rgba(52,211,153,0.2)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, marginBottom: 4 }}>
                                <Text style={{ color: '#34D399', fontSize: 11, fontWeight: 'bold' }}>1 / {badgeQueue.length}</Text>
                            </View>
                        )}
                        <Text className="text-primary text-xs font-bold uppercase tracking-wider mb-1">{t.badges.newBadge}</Text>
                        <Text className="text-white text-xl font-bold text-center mb-1">{resolveBadgeName(badgeQueue[0], t.badges)}</Text>
                        <Text className="text-gray-400 text-center text-sm mb-6">{resolveBadgeDesc(badgeQueue[0], t.badges)}</Text>
                        <TouchableOpacity onPress={clearNewBadge} className="bg-primary px-8 py-3 rounded-full">
                            <Text className="text-black font-bold">{badgeQueue.length > 1 ? t.common.nextBadge : t.common.great}</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            )}

            {/* GOAL REACHED MODAL */}
            {showCelebration && (
                <View className="absolute top-0 bottom-0 left-0 right-0 h-full w-full bg-black/80 items-center justify-center z-50">
                    <View className="bg-surface p-8 rounded-3xl items-center border border-accent/30 w-4/5">
                        <Text className="text-6xl mb-4">🎉</Text>
                        <Text className="text-white text-2xl font-bold text-center mb-2">{t.dashboard.motivation.done}</Text>
                        <Text className="text-gray-400 text-center mb-6">
                            {t.dashboard.goalReachedDesc}
                        </Text>
                        <TouchableOpacity onPress={() => setShowCelebration(false)} className="bg-accent px-8 py-3 rounded-full">
                            <Text className="text-black font-bold">{t.common.great}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
};

export default DashboardScreen;
