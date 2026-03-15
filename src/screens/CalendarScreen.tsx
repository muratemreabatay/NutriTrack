import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Animated, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useCalories, MealCategory } from '../context/CalorieContext';
import { useLanguage } from '../i18n/LanguageContext';
import { getQuickFoods, resolveFoodName, FoodItem, MEAL_CATEGORY_DEFS } from '../constants';
import { hapticSelection, hapticSuccess, hapticLight } from '../utils/haptics';

const CalendarScreen = () => {
    const { getMealsForDate, addMealForDate, dailyHistory, mealHistory, allMeals } = useCalories();
    const { t, lang } = useLanguage();

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const [selectedDate, setSelectedDate] = useState(todayStr);
    const [currentMonth, setCurrentMonth] = useState({ year: today.getFullYear(), month: today.getMonth() });
    const [showAddModal, setShowAddModal] = useState(false);
    const [addFormName, setAddFormName] = useState('');
    const [addFormCalories, setAddFormCalories] = useState('');
    const [addFormCategory, setAddFormCategory] = useState<MealCategory>('lunch');

    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, []);

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => {
        const d = new Date(year, month, 1).getDay();
        return d === 0 ? 6 : d - 1;
    };

    const prevMonth = () => {
        setCurrentMonth(prev => prev.month === 0
            ? { year: prev.year - 1, month: 11 }
            : { ...prev, month: prev.month - 1 }
        );
    };

    const nextMonth = () => {
        const now = new Date();
        const next = currentMonth.month === 11
            ? { year: currentMonth.year + 1, month: 0 }
            : { ...currentMonth, month: currentMonth.month + 1 };
        if (next.year > now.getFullYear() || (next.year === now.getFullYear() && next.month > now.getMonth())) return;
        setCurrentMonth(next);
    };

    // F2: allMeals is already date-indexed, just use keys
    const datesWithMeals = useMemo(() => new Set(Object.keys(allMeals)), [allMeals]);

    const dateHasMeals = (dateStr: string) => datesWithMeals.has(dateStr);
    const isToday = selectedDate === todayStr;
    const isPastOrToday = selectedDate <= todayStr;

    const allMealsForDate = getMealsForDate(selectedDate);
    const meals = isToday
        ? (() => {
            const ids = new Set(allMealsForDate.map(m => m.id));
            const extra = mealHistory.filter(m => !ids.has(m.id));
            return [...allMealsForDate, ...extra];
        })()
        : allMealsForDate;
    const totalCal = meals.reduce((s, m) => s + m.nutrients.calories, 0);

    const quickFoods = getQuickFoods();

    const handleQuickAdd = (food: FoodItem) => {
        addMealForDate(
            { calories: food.calories, protein: food.protein, carbs: food.carbs, fat: food.fat },
            resolveFoodName(food, lang), selectedDate, addFormCategory
        );
        hapticSuccess();
        setShowAddModal(false);
    };

    const handleManualAdd = () => {
        const cal = parseInt(addFormCalories);
        if (!cal || cal <= 0) return;
        addMealForDate(
            { calories: cal, protein: 0, carbs: 0, fat: 0 },
            addFormName || t.fallback.mealName, selectedDate, addFormCategory
        );
        setAddFormName('');
        setAddFormCalories('');
        hapticSuccess();
        setShowAddModal(false);
    };

    const daysInMonth = getDaysInMonth(currentMonth.year, currentMonth.month);
    const firstDay = getFirstDayOfMonth(currentMonth.year, currentMonth.month);
    const locale = lang === 'tr' ? 'tr-TR' : 'en-US';

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#030712' }}>
            <StatusBar style="light" />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                <Animated.View style={{ opacity: fadeAnim }} className="px-6 pt-4 pb-2">
                    <Text className="text-white text-2xl font-bold">{t.calendar.title}</Text>
                    <Text className="text-gray-400 text-sm mt-1">{t.calendar.subtitle}</Text>
                </Animated.View>

                <Animated.View style={{ opacity: fadeAnim }} className="flex-row items-center justify-between px-6 mt-4 mb-3">
                    <TouchableOpacity onPress={prevMonth} className="p-2">
                        <Text className="text-white text-xl">‹</Text>
                    </TouchableOpacity>
                    <Text className="text-white font-bold text-base">
                        {t.calendar.monthNames[currentMonth.month]} {currentMonth.year}
                    </Text>
                    <TouchableOpacity onPress={nextMonth} className="p-2">
                        <Text className="text-white text-xl">›</Text>
                    </TouchableOpacity>
                </Animated.View>

                <View className="flex-row px-4 mb-1">
                    {t.calendar.dayNames.map(d => (
                        <View key={d} className="flex-1 items-center">
                            <Text className="text-gray-500 text-xs font-medium">{d}</Text>
                        </View>
                    ))}
                </View>

                <Animated.View style={{ opacity: fadeAnim }} className="px-4 mb-6">
                    <View className="flex-row flex-wrap">
                        {Array.from({ length: firstDay }).map((_, i) => (
                            <View key={`empty-${i}`} style={{ width: '14.28%', height: 44 }} />
                        ))}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const dateStr = `${currentMonth.year}-${String(currentMonth.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const isSelected = dateStr === selectedDate;
                            const isTodayCell = dateStr === todayStr;
                            const hasMeals = dateHasMeals(dateStr);
                            const isFuture = dateStr > todayStr;

                            return (
                                <TouchableOpacity key={day}
                                    onPress={() => { if (!isFuture) { hapticSelection(); setSelectedDate(dateStr); } }}
                                    disabled={isFuture}
                                    style={{ width: '14.28%', height: 44 }}
                                    className="items-center justify-center"
                                >
                                    <View className={`w-9 h-9 rounded-full items-center justify-center ${isSelected ? 'bg-primary' : isTodayCell ? 'border border-primary' : ''}`}>
                                        <Text className={`text-sm font-medium ${isSelected ? 'text-black' : isFuture ? 'text-gray-700' : isTodayCell ? 'text-primary' : 'text-white'}`}>
                                            {day}
                                        </Text>
                                    </View>
                                    {hasMeals && !isSelected && (
                                        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#34D399', position: 'absolute', bottom: 2 }} />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </Animated.View>

                <Animated.View style={{ opacity: fadeAnim }} className="px-6">
                    <View className="flex-row items-center justify-between mb-4">
                        <View>
                            <Text className="text-white font-bold text-lg">
                                {isToday ? t.calendar.today : new Date(selectedDate + 'T12:00:00').toLocaleDateString(locale, { day: 'numeric', month: 'long', weekday: 'long' })}
                            </Text>
                            {meals.length > 0 && (
                                <Text className="text-gray-400 text-xs mt-1">{totalCal} kcal · {meals.length} {t.manual.meals}</Text>
                            )}
                        </View>
                        {isPastOrToday && (
                            <TouchableOpacity onPress={() => setShowAddModal(true)} className="bg-primary/20 px-4 py-2 rounded-full border border-primary/40">
                                <Text className="text-primary font-bold text-sm">+ {t.common.add}</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {meals.length > 0 ? (
                        <View className="bg-surface rounded-2xl border border-gray-800 overflow-hidden">
                            {meals.map((meal, i) => (
                                <View key={meal.id} className={`flex-row items-center p-4 ${i < meals.length - 1 ? 'border-b border-gray-800' : ''}`}>
                                    <View className="w-8 h-8 bg-primary/15 rounded-full items-center justify-center mr-3">
                                        <Text style={{ fontSize: 14 }}>
                                            {meal.category === 'breakfast' ? '🌅' : meal.category === 'lunch' ? '☀️' : meal.category === 'dinner' ? '🌙' : '🍪'}
                                        </Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-white font-medium">{meal.name}</Text>
                                        <Text className="text-gray-500 text-xs mt-0.5">
                                            {new Date(meal.timestamp).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                                            {meal.nutrients.protein > 0 && ` · P:${meal.nutrients.protein}g`}
                                        </Text>
                                    </View>
                                    <Text className="text-primary font-bold">{meal.nutrients.calories} kcal</Text>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View className="bg-surface rounded-2xl border border-gray-800 p-8 items-center">
                            <Text style={{ fontSize: 36 }}>📅</Text>
                            <Text className="text-gray-400 mt-3 text-center">
                                {isPastOrToday ? t.calendar.noRecord : t.calendar.futureDate}
                            </Text>
                            {isPastOrToday && (
                                <TouchableOpacity onPress={() => setShowAddModal(true)} className="mt-4 bg-primary/20 px-5 py-2.5 rounded-full border border-primary/40">
                                    <Text className="text-primary font-bold text-sm">{t.calendar.addMeal}</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </Animated.View>
            </ScrollView>

            {showAddModal && (
                <View className="absolute top-0 bottom-0 left-0 right-0 h-full w-full bg-black/70 justify-end z-50">
                    <TouchableOpacity className="flex-1" activeOpacity={1} onPress={() => { Keyboard.dismiss(); setShowAddModal(false); }} />
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="bg-surface rounded-t-3xl border-t border-gray-800">
                        <View className="p-6">
                            <Text className="text-white font-bold text-lg mb-1">{t.calendar.addMeal}</Text>
                            <Text className="text-gray-400 text-xs mb-4">
                                {new Date(selectedDate + 'T12:00:00').toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}
                            </Text>

                            <View className="flex-row mb-4" style={{ gap: 6 }}>
                                {MEAL_CATEGORY_DEFS.map(c => (
                                    <TouchableOpacity key={c.id} onPress={() => setAddFormCategory(c.id)}
                                        className={`flex-1 py-2 rounded-lg border items-center ${addFormCategory === c.id ? 'bg-primary/20 border-primary' : 'bg-gray-800 border-gray-700'}`}
                                    >
                                        <Text style={{ fontSize: 14 }}>{c.icon}</Text>
                                        <Text className={`text-[10px] mt-0.5 font-medium ${addFormCategory === c.id ? 'text-primary' : 'text-gray-400'}`}>
                                            {t.mealCategories[c.id]}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text className="text-gray-400 text-xs uppercase tracking-wider mb-2">{t.calendar.quickAdd}</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4" contentContainerStyle={{ gap: 6 }}>
                                {quickFoods.map((food, i) => (
                                    <TouchableOpacity key={i} onPress={() => handleQuickAdd(food)} className="bg-gray-800 rounded-xl px-3 py-2 items-center" style={{ width: 80 }}>
                                        <Text style={{ fontSize: 20 }}>{food.icon}</Text>
                                        <Text className="text-white text-[10px] text-center mt-1" numberOfLines={1}>{resolveFoodName(food, lang)}</Text>
                                        <Text className="text-primary text-[9px] font-bold">{food.calories}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <View className="flex-row mb-4" style={{ gap: 8 }}>
                                <TextInput value={addFormName} onChangeText={setAddFormName}
                                    placeholder={t.calendar.mealName} placeholderTextColor="#4B5563"
                                    className="flex-1 bg-gray-800 text-white p-3 rounded-xl text-sm" returnKeyType="done"
                                />
                                <TextInput value={addFormCalories} onChangeText={setAddFormCalories}
                                    placeholder="kcal" placeholderTextColor="#4B5563" keyboardType="numeric"
                                    className="w-20 bg-gray-800 text-white p-3 rounded-xl text-sm text-center" returnKeyType="done"
                                />
                            </View>

                            <TouchableOpacity onPress={handleManualAdd}
                                disabled={!addFormCalories || parseInt(addFormCalories) <= 0}
                                className={`py-3.5 rounded-2xl items-center ${addFormCalories && parseInt(addFormCalories) > 0 ? 'bg-primary' : 'bg-gray-800'}`}
                            >
                                <Text className={`font-bold ${addFormCalories && parseInt(addFormCalories) > 0 ? 'text-black' : 'text-gray-500'}`}>
                                    {t.common.add.toUpperCase()}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            )}
        </SafeAreaView>
    );
};

export default CalendarScreen;
