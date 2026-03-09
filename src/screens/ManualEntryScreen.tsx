import React, { useState, useRef, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useCalories, MealCategory, FavoriteFood } from '../context/CalorieContext';
import { useLanguage } from '../i18n/LanguageContext';
import { hapticSelection, hapticSuccess, hapticMedium, hapticLight } from '../utils/haptics';
import { FOOD_DATABASE, getFoodDatabase, getPopularFoods, resolveFoodName, FoodItem } from '../constants';

const PORTIONS = [
    { label: '½', value: 0.5 },
    { label: '1', value: 1 },
    { label: '1½', value: 1.5 },
    { label: '2', value: 2 },
];

const CATEGORY_DEFS: { id: MealCategory; icon: string }[] = [
    { id: 'breakfast', icon: '🌅' },
    { id: 'lunch', icon: '☀️' },
    { id: 'dinner', icon: '🌙' },
    { id: 'snack', icon: '🍪' },
];

const ManualEntryScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { addMeal, favorites, toggleFavorite, isFavorite } = useCalories();
    const { t, lang } = useLanguage();

    const [mealName, setMealName] = useState('');
    const [calories, setCalories] = useState('');
    const [protein, setProtein] = useState('');
    const [carbs, setCarbs] = useState('');
    const [fat, setFat] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [addedCount, setAddedCount] = useState(0);

    const initialMealCategory = route.params?.mealType as MealCategory | undefined;
    const [selectedMealCategory, setSelectedMealCategory] = useState<MealCategory | undefined>(initialMealCategory);

    const [portionFood, setPortionFood] = useState<FoodItem | null>(null);
    const [selectedPortion, setSelectedPortion] = useState(1);

    const toastAnim = useRef(new Animated.Value(0)).current;

    const isValid = calories.length > 0 && parseInt(calories) > 0;

    const showToast = () => {
        toastAnim.setValue(0);
        Animated.sequence([
            Animated.timing(toastAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
            Animated.delay(1200),
            Animated.timing(toastAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start();
    };

    const handleAdd = () => {
        addMeal({
            calories: parseInt(calories) || 0,
            protein: parseInt(protein) || 0,
            carbs: parseInt(carbs) || 0,
            fat: parseInt(fat) || 0,
        }, mealName || t.fallback.manualEntry, selectedMealCategory);
        setMealName(''); setCalories(''); setProtein(''); setCarbs(''); setFat('');
        setSelectedMealCategory(initialMealCategory);
        setAddedCount(c => c + 1);
        showToast();
        hapticSuccess();
    };

    const getAutoCategory = (food: FoodItem): MealCategory | undefined => {
        for (const cat of getFoodDatabase(lang)) {
            if (cat.items.includes(food)) {
                if (cat.id === 'breakfast') return 'breakfast';
                if (cat.id === 'snacks') return 'snack';
                if (cat.id === 'drinks') return 'snack';
            }
        }
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 10) return 'breakfast';
        if (hour >= 10 && hour < 15) return 'lunch';
        if (hour >= 15 && hour < 21) return 'dinner';
        return 'snack';
    };

    const handleFoodTap = (food: FoodItem) => {
        hapticSelection();
        setPortionFood(food);
        setSelectedPortion(1);
        // Only auto-guess the category if one hasn't been explicitly set yet
        setSelectedMealCategory(prev => prev || getAutoCategory(food));
    };

    const confirmPortion = () => {
        if (!portionFood) return;
        const p = selectedPortion;
        const name = resolveFoodName(portionFood, lang);
        addMeal({
            calories: Math.round(portionFood.calories * p),
            protein: Math.round(portionFood.protein * p),
            carbs: Math.round(portionFood.carbs * p),
            fat: Math.round(portionFood.fat * p),
        }, `${name}${p !== 1 ? ` (x${p})` : ''}`, selectedMealCategory);
        setPortionFood(null);
        setSelectedMealCategory(initialMealCategory);
        setAddedCount(c => c + 1);
        showToast();
    };

    const searchResults = useMemo(() => {
        if (searchQuery.length === 0) return null;
        const query = searchQuery.toLowerCase();
        const results: FoodItem[] = [];
        getFoodDatabase(lang).forEach(cat => {
            cat.items.forEach(item => {
                const name = resolveFoodName(item, lang);
                if (name.toLowerCase().includes(query)) {
                    results.push(item);
                }
            });
        });
        return results;
    }, [searchQuery, lang]);

    const activeCategory = selectedCategory
        ? getFoodDatabase(lang).find(c => c.id === selectedCategory)
        : null;

    const popularFoods = getPopularFoods(lang);

    const getCategoryLabel = (catId: string): string => {
        const key = catId as keyof typeof t.foodCategories;
        return t.foodCategories[key] || catId;
    };

    const renderFoodItem = (item: FoodItem, i: number) => {
        const name = resolveFoodName(item, lang);
        return (
            <TouchableOpacity
                key={`${name}-${i}`}
                onPress={() => handleFoodTap(item)}
                activeOpacity={0.7}
                className="flex-row items-center bg-surface p-4 rounded-xl border border-gray-800 mb-2"
            >
                <Text style={{ fontSize: 24 }} className="mr-3">{item.icon}</Text>
                <View className="flex-1">
                    <Text className="text-white font-medium">{name}</Text>
                    <Text className="text-gray-500 text-xs mt-1">
                        P: {item.protein}g · K: {item.carbs}g · {t.common.fat.charAt(0)}: {item.fat}g
                    </Text>
                </View>
                <View className="items-end mr-3">
                    <Text className="text-primary font-bold">{item.calories}</Text>
                    <Text className="text-gray-600 text-xs">kcal</Text>
                </View>
                <TouchableOpacity
                    onPress={(e) => {
                        e.stopPropagation();
                        toggleFavorite({ name: name, icon: item.icon, calories: item.calories, protein: item.protein, carbs: item.carbs, fat: item.fat });
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Text style={{ fontSize: 16 }}>{isFavorite(name) ? '❤️' : '🤍'}</Text>
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#030712' }}>
            <StatusBar style="light" />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView className="px-6 pt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                    <View className="flex-row items-center justify-between mb-4">
                        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-surface rounded-full">
                            <Text className="text-white text-xl">←</Text>
                        </TouchableOpacity>
                        <Text className="text-white text-xl font-bold">{t.manual.title}</Text>
                        {addedCount > 0 ? (
                            <TouchableOpacity onPress={() => navigation.goBack()} className="bg-primary/20 px-3 py-1 rounded-full">
                                <Text className="text-primary font-bold text-sm">{t.common.done} ✓</Text>
                            </TouchableOpacity>
                        ) : (
                            <View className="w-10" />
                        )}
                    </View>

                    <View className="mb-4">
                        <TextInput
                            value={searchQuery}
                            onChangeText={(txt) => { setSearchQuery(txt); setSelectedCategory(null); }}
                            placeholder={t.manual.search}
                            placeholderTextColor="#4B5563"
                            className="bg-surface text-white p-4 rounded-xl border border-gray-800 text-base"
                        />
                    </View>

                    {searchResults && searchResults.length > 0 && (
                        <View className="mb-6">
                            <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">
                                {t.manual.results} ({searchResults.length})
                            </Text>
                            {searchResults.map((item, i) => renderFoodItem(item, i))}
                        </View>
                    )}

                    {searchResults && searchResults.length === 0 && (
                        <Text className="text-gray-500 text-center py-4 mb-4">{t.manual.noResults}</Text>
                    )}

                    {!searchQuery && favorites.length > 0 && (
                        <View className="mb-4">
                            <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">{t.manual.favorites}</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                                {favorites.map((fav, i) => (
                                    <TouchableOpacity key={i}
                                        onPress={() => handleFoodTap({ name: { tr: fav.name, en: fav.name }, icon: fav.icon, calories: fav.calories, protein: fav.protein, carbs: fav.carbs, fat: fav.fat })}
                                        activeOpacity={0.7}
                                        className="bg-surface border border-primary/30 rounded-2xl p-3 items-center"
                                        style={{ width: 105 }}
                                    >
                                        <Text style={{ fontSize: 28 }} className="mb-1">{fav.icon}</Text>
                                        <Text className="text-white text-xs font-medium text-center mb-1" numberOfLines={2}>{fav.name}</Text>
                                        <Text className="text-primary text-xs font-bold">{fav.calories} kcal</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {!searchQuery && (
                        <>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4" contentContainerStyle={{ gap: 6 }}>
                                {getFoodDatabase(lang).map((cat) => (
                                    <TouchableOpacity key={cat.id}
                                        onPress={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                                        activeOpacity={0.7}
                                        className={`px-4 py-2 rounded-full border flex-row items-center ${selectedCategory === cat.id ? 'bg-primary/20 border-primary' : 'bg-surface border-gray-800'}`}
                                    >
                                        <Text style={{ fontSize: 14 }}>{cat.icon}</Text>
                                        <Text className={`text-xs font-medium ml-1 ${selectedCategory === cat.id ? 'text-primary' : 'text-gray-400'}`}>
                                            {getCategoryLabel(cat.id)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            {activeCategory ? (
                                <View className="mb-6">
                                    <Text className="text-white font-bold mb-3">{activeCategory.icon} {getCategoryLabel(activeCategory.id)}</Text>
                                    {activeCategory.items.map((item, i) => renderFoodItem(item, i))}
                                </View>
                            ) : (
                                <View className="mb-6">
                                    <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">{t.manual.popular}</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                                        {popularFoods.map((meal, i) => (
                                            <TouchableOpacity key={i}
                                                onPress={() => handleFoodTap(meal)}
                                                activeOpacity={0.7}
                                                className="bg-surface border border-gray-800 rounded-2xl p-3 items-center"
                                                style={{ width: 105 }}
                                            >
                                                <Text style={{ fontSize: 28 }} className="mb-1">{meal.icon}</Text>
                                                <Text className="text-white text-xs font-medium text-center mb-1" numberOfLines={2}>{resolveFoodName(meal, lang)}</Text>
                                                <Text className="text-primary text-xs font-bold">{meal.calories} kcal</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
                        </>
                    )}

                    <View className="flex-row items-center mb-6 mt-2">
                        <View className="flex-1 h-px bg-gray-800" />
                        <Text className="text-gray-600 text-xs mx-4">{t.common.or}</Text>
                        <View className="flex-1 h-px bg-gray-800" />
                    </View>

                    <View className="mb-4">
                        <Text className="text-gray-400 mb-2 ml-1 text-xs">{t.manual.mealName}</Text>
                        <TextInput value={mealName} onChangeText={setMealName}
                            placeholder={t.manual.example} placeholderTextColor="#4B5563"
                            className="bg-surface text-white p-4 rounded-xl border border-gray-800 text-base"
                        />
                    </View>
                    <View className="mb-4">
                        <Text className="text-gray-400 mb-2 ml-1 text-xs">{t.manual.caloriesLabel}</Text>
                        <TextInput value={calories} onChangeText={setCalories}
                            keyboardType="numeric" placeholder="0" placeholderTextColor="#4B5563"
                            className="bg-surface text-white p-4 rounded-xl border border-gray-800 text-lg font-bold"
                        />
                    </View>
                    <View className="flex-row mb-6" style={{ gap: 8 }}>
                        {[
                            { label: t.manual.proteinLabel, val: protein, set: setProtein },
                            { label: t.manual.carbsLabel, val: carbs, set: setCarbs },
                            { label: t.manual.fatLabel, val: fat, set: setFat },
                        ].map(f => (
                            <View key={f.label} className="flex-1">
                                <Text className="text-gray-400 mb-2 ml-1 text-xs">{f.label}</Text>
                                <TextInput value={f.val} onChangeText={f.set}
                                    keyboardType="numeric" placeholder="0" placeholderTextColor="#4B5563"
                                    className="bg-surface text-white p-3 rounded-xl border border-gray-800 text-base font-bold"
                                />
                            </View>
                        ))}
                    </View>
                </ScrollView>

                <View className="absolute bottom-6 left-6 right-6">
                    <TouchableOpacity onPress={handleAdd} disabled={!isValid} activeOpacity={0.8}
                        className={`py-4 rounded-2xl items-center ${isValid ? 'bg-primary' : 'bg-gray-800'}`}
                        style={isValid ? { shadowColor: '#34D399', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12 } : {}}
                    >
                        <Text className={`font-bold text-lg ${isValid ? 'text-black' : 'text-gray-500'}`}>
                            {t.manual.addButton}
                        </Text>
                    </TouchableOpacity>
                </View>

                <Animated.View pointerEvents="none"
                    style={{
                        position: 'absolute', top: 60, left: 0, right: 0, alignItems: 'center',
                        opacity: toastAnim,
                        transform: [{ translateY: toastAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
                    }}
                >
                    <View className="bg-primary px-6 py-3 rounded-full flex-row items-center" style={{ shadowColor: '#34D399', shadowOpacity: 0.4, shadowRadius: 10, elevation: 5 }}>
                        <Text className="text-black font-bold">{t.manual.added}</Text>
                        {addedCount > 1 && <Text className="text-black/60 ml-2 text-sm">({addedCount} {t.manual.meals})</Text>}
                    </View>
                </Animated.View>

                {portionFood && (
                    <View className="absolute top-0 bottom-0 left-0 right-0 h-full w-full bg-black/70 justify-end z-50">
                        <TouchableOpacity className="flex-1" activeOpacity={1} onPress={() => { setPortionFood(null); setSelectedMealCategory(initialMealCategory); }} />
                        <View className="bg-surface rounded-t-3xl p-6 border-t border-gray-800">
                            <View className="flex-row items-center mb-5">
                                <Text style={{ fontSize: 36 }}>{portionFood.icon}</Text>
                                <View className="ml-3 flex-1">
                                    <Text className="text-white font-bold text-lg">{resolveFoodName(portionFood, lang)}</Text>
                                    <Text className="text-gray-400 text-xs mt-1">
                                        P: {portionFood.protein}g · K: {portionFood.carbs}g · {t.common.fat.charAt(0)}: {portionFood.fat}g
                                    </Text>
                                </View>
                            </View>

                            <Text className="text-gray-400 text-xs uppercase tracking-wider mb-2">{t.manual.mealCategory}</Text>
                            <View className="flex-row mb-4" style={{ gap: 6 }}>
                                {CATEGORY_DEFS.map(c => (
                                    <TouchableOpacity key={c.id} onPress={() => setSelectedMealCategory(c.id)} activeOpacity={0.7}
                                        className={`flex-1 py-2 rounded-lg border items-center ${selectedMealCategory === c.id ? 'bg-primary/20 border-primary' : 'bg-gray-800 border-gray-700'}`}
                                    >
                                        <Text style={{ fontSize: 14 }}>{c.icon}</Text>
                                        <Text className={`text-[10px] mt-0.5 font-medium ${selectedMealCategory === c.id ? 'text-primary' : 'text-gray-400'}`}>
                                            {t.mealCategories[c.id]}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text className="text-gray-400 text-xs uppercase tracking-wider mb-3">{t.manual.selectPortion}</Text>
                            <View className="flex-row mb-5" style={{ gap: 8 }}>
                                {PORTIONS.map(p => (
                                    <TouchableOpacity key={p.value} onPress={() => setSelectedPortion(p.value)} activeOpacity={0.8}
                                        className={`flex-1 py-4 rounded-xl items-center border-2 ${selectedPortion === p.value ? 'bg-primary/20 border-primary' : 'bg-gray-800 border-gray-700'}`}
                                    >
                                        <Text className={`text-lg font-bold ${selectedPortion === p.value ? 'text-primary' : 'text-white'}`}>{p.label}</Text>
                                        <Text className={`text-xs mt-1 ${selectedPortion === p.value ? 'text-primary/70' : 'text-gray-500'}`}>{t.manual.portion}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <View className="bg-gray-800/50 rounded-xl p-4 flex-row justify-between mb-5">
                                <View className="items-center">
                                    <Text className="text-primary text-xl font-bold">{Math.round(portionFood.calories * selectedPortion)}</Text>
                                    <Text className="text-gray-500 text-xs">kcal</Text>
                                </View>
                                <View className="items-center">
                                    <Text className="text-secondary text-lg font-bold">{Math.round(portionFood.protein * selectedPortion)}g</Text>
                                    <Text className="text-gray-500 text-xs">{t.common.protein.toLowerCase()}</Text>
                                </View>
                                <View className="items-center">
                                    <Text className="text-accent text-lg font-bold">{Math.round(portionFood.carbs * selectedPortion)}g</Text>
                                    <Text className="text-gray-500 text-xs">{t.common.carbs.toLowerCase()}</Text>
                                </View>
                                <View className="items-center">
                                    <Text className="text-warning text-lg font-bold">{Math.round(portionFood.fat * selectedPortion)}g</Text>
                                    <Text className="text-gray-500 text-xs">{t.common.fat.toLowerCase()}</Text>
                                </View>
                            </View>

                            <TouchableOpacity onPress={confirmPortion} activeOpacity={0.8}
                                className="bg-primary py-4 rounded-2xl items-center"
                                style={{ shadowColor: '#34D399', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12 }}
                            >
                                <Text className="text-black font-bold text-base">
                                    {t.common.add.toUpperCase()} · {Math.round(portionFood.calories * selectedPortion)} kcal
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ManualEntryScreen;
