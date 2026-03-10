import React, { useRef, useEffect, useMemo } from 'react';
import { View, Text, Animated } from 'react-native';
import { DailyRecord } from '../context/CalorieContext';
import { useLanguage } from '../i18n/LanguageContext';

type WeeklyChartProps = {
    dailyHistory: DailyRecord[];
    todayCalories: number;
    targetCalories: number;
};

const WeeklyChart = ({ dailyHistory, todayCalories, targetCalories }: WeeklyChartProps) => {
    const { t } = useLanguage();
    const animAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(animAnim, { toValue: 1, duration: 800, useNativeDriver: false }).start();
    }, []);

    const weekData = useMemo(() => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

        const days: { date: string; calories: number; label: string; isToday: boolean }[] = [];

        for (let i = 0; i < 7; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + mondayOffset + i);
            const dateStr = d.toISOString().split('T')[0];
            const todayStr = today.toISOString().split('T')[0];
            const isToday = dateStr === todayStr;

            const record = dailyHistory.find(r => r.date === dateStr);
            const cal = isToday ? todayCalories : (record?.calories || 0);

            days.push({
                date: dateStr,
                calories: cal,
                label: t.weeklyChart.dayLabels[i],
                isToday,
            });
        }
        return days;
    }, [dailyHistory, todayCalories, targetCalories, t]);
    const maxCal = Math.max(targetCalories, ...weekData.map(d => d.calories), 100);

    return (
        <View className="bg-surface rounded-2xl p-5 border border-gray-800">
            <View className="flex-row items-center justify-between mb-4">
                <Text className="text-white font-bold text-base">{t.weeklyChart.title}</Text>
                <Text className="text-gray-500 text-xs">kcal</Text>
            </View>

            <View className="relative" style={{ height: 140 }}>
                <View
                    style={{
                        position: 'absolute',
                        left: 0, right: 0,
                        bottom: (targetCalories / maxCal) * 120,
                        height: 1,
                        borderTopWidth: 1,
                        borderTopColor: '#34D39950',
                        borderStyle: 'dashed',
                    }}
                >
                    <Text
                        style={{ position: 'absolute', right: 0, top: -14, fontSize: 9, color: '#34D399' }}
                    >
                        {Math.round(targetCalories)}
                    </Text>
                </View>

                <View className="flex-row items-end justify-between" style={{ height: 120, paddingTop: 16 }}>
                    {weekData.map((day, i) => {
                        const barHeight = day.calories > 0
                            ? Math.max(8, (day.calories / maxCal) * 100)
                            : 4;

                        const overTarget = day.calories > targetCalories;
                        const barColor = day.isToday
                            ? (overTarget ? '#F59E0B' : '#34D399')
                            : (day.calories > 0 ? (overTarget ? '#F59E0B80' : '#34D39980') : '#1F293750');

                        return (
                            <View key={i} className="items-center flex-1">
                                {day.calories > 0 && (
                                    <Text style={{ fontSize: 8, color: '#9CA3AF', marginBottom: 2 }}>
                                        {day.calories}
                                    </Text>
                                )}
                                <Animated.View
                                    style={{
                                        width: 20,
                                        height: animAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, barHeight],
                                        }),
                                        backgroundColor: barColor,
                                        borderRadius: 6,
                                    }}
                                />
                            </View>
                        );
                    })}
                </View>
            </View>

            <View className="flex-row justify-between mt-2">
                {weekData.map((day, i) => (
                    <View key={i} className="flex-1 items-center">
                        <Text
                            style={{
                                fontSize: 10,
                                fontWeight: day.isToday ? '800' : '500',
                                color: day.isToday ? '#34D399' : '#6B7280',
                            }}
                        >
                            {day.label}
                        </Text>
                        {day.isToday && (
                            <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#34D399', marginTop: 2 }} />
                        )}
                    </View>
                ))}
            </View>

            {dailyHistory.length > 0 && (
                <View className="flex-row items-center justify-center mt-4 pt-3 border-t border-gray-800">
                    <Text className="text-gray-500 text-xs">{t.weeklyChart.average} </Text>
                    <Text className="text-white font-bold text-xs">
                        {Math.round(weekData.reduce((a, d) => a + d.calories, 0) / weekData.filter(d => d.calories > 0).length || 0)} kcal
                    </Text>
                </View>
            )}
        </View>
    );
};

export default WeeklyChart;
