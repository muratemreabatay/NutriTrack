import React, { useState, useRef, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useCalories, MealCategory, FavoriteFood } from '../context/CalorieContext';
import { hapticSelection, hapticSuccess, hapticMedium, hapticLight } from '../utils/haptics';
import { FOOD_DATABASE, FoodItem, MEAL_CATEGORIES, POPULAR_FOODS } from '../constants';



const PORTIONS = [
    { label: '½', value: 0.5 },
    { label: '1', value: 1 },
    { label: '1½', value: 1.5 },
    { label: '2', value: 2 },
];


const ManualEntryScreen = () => {
    const navigation = useNavigation();
    const { addMeal, favorites, toggleFavorite, isFavorite } = useCalories();

    const [mealName, setMealName] = useState('');
    const [calories, setCalories] = useState('');
    const [protein, setProtein] = useState('');
    const [carbs, setCarbs] = useState('');
    const [fat, setFat] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [addedCount, setAddedCount] = useState(0);
    const [selectedMealCategory, setSelectedMealCategory] = useState<MealCategory | undefined>(undefined);

    // Portion selector state
    const [portionFood, setPortionFood] = useState<FoodItem | null>(null);
    const [selectedPortion, setSelectedPortion] = useState(1);

    // Toast animation
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
        }, mealName || 'Manuel Giriş', selectedMealCategory);
        setMealName(''); setCalories(''); setProtein(''); setCarbs(''); setFat('');
        setSelectedMealCategory(undefined);
        setAddedCount(c => c + 1);
        showToast();
        hapticSuccess();
    };

    const getAutoCategory = (food: FoodItem): MealCategory | undefined => {
        // Try to detect from which DB category the food belongs
        for (const cat of FOOD_DATABASE) {
            if (cat.items.includes(food)) {
                if (cat.id === 'breakfast') return 'breakfast';
                if (cat.id === 'snacks') return 'snack';
                if (cat.id === 'drinks') return 'snack';
            }
        }
        // Auto by time
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
        setSelectedMealCategory(getAutoCategory(food));
    };

    const confirmPortion = () => {
        if (!portionFood) return;
        const p = selectedPortion;
        addMeal({
            calories: Math.round(portionFood.calories * p),
            protein: Math.round(portionFood.protein * p),
            carbs: Math.round(portionFood.carbs * p),
            fat: Math.round(portionFood.fat * p),
        }, `${portionFood.name}${p !== 1 ? ` (x${p})` : ''}`, selectedMealCategory);
        setPortionFood(null);
        setSelectedMealCategory(undefined);
        setAddedCount(c => c + 1);
        showToast();
    };

    // Filter foods by search (memoized to avoid recomputation on unrelated state changes)
    const searchResults = useMemo(() => {
        if (searchQuery.length === 0) return null;
        const query = searchQuery.toLowerCase();
        const results: FoodItem[] = [];
        FOOD_DATABASE.forEach(cat => {
            cat.items.forEach(item => {
                if (item.name.toLowerCase().includes(query)) {
                    results.push(item);
                }
            });
        });
        return results;
    }, [searchQuery]);
    const activeCategory = selectedCategory
        ? FOOD_DATABASE.find(c => c.id === selectedCategory)
        : null;

    const renderFoodItem = (item: FoodItem, i: number) => (
        <TouchableOpacity
            key={`${item.name}-${i}`}
            onPress={() => handleFoodTap(item)}
            activeOpacity={0.7}
            className="flex-row items-center bg-surface p-4 rounded-xl border border-gray-800 mb-2"
        >
            <Text style={{ fontSize: 24 }} className="mr-3">{item.icon}</Text>
            <View className="flex-1">
                <Text className="text-white font-medium">{item.name}</Text>
                <Text className="text-gray-500 text-xs mt-1">
                    P: {item.protein}g · K: {item.carbs}g · Y: {item.fat}g
                </Text>
            </View>
            <View className="items-end mr-3">
                <Text className="text-primary font-bold">{item.calories}</Text>
                <Text className="text-gray-600 text-xs">kcal</Text>
            </View>
            <TouchableOpacity
                onPress={(e) => {
                    e.stopPropagation();
                    toggleFavorite({ name: item.name, icon: item.icon, calories: item.calories, protein: item.protein, carbs: item.carbs, fat: item.fat });
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Text style={{ fontSize: 16 }}>{isFavorite(item.name) ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#030712' }}>
            <StatusBar style="light" />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView className="px-6 pt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-4">
                        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-surface rounded-full">
                            <Text className="text-white text-xl">←</Text>
                        </TouchableOpacity>
                        <Text className="text-white text-xl font-bold">Öğün Ekle</Text>
                        {addedCount > 0 ? (
                            <TouchableOpacity onPress={() => navigation.goBack()} className="bg-primary/20 px-3 py-1 rounded-full">
                                <Text className="text-primary font-bold text-sm">Bitti ✓</Text>
                            </TouchableOpacity>
                        ) : (
                            <View className="w-10" />
                        )}
                    </View>

                    {/* Search */}
                    <View className="mb-4">
                        <TextInput
                            value={searchQuery}
                            onChangeText={(t) => { setSearchQuery(t); setSelectedCategory(null); }}
                            placeholder="🔍 Yemek ara..."
                            placeholderTextColor="#4B5563"
                            className="bg-surface text-white p-4 rounded-xl border border-gray-800 text-base"
                        />
                    </View>

                    {/* Search Results */}
                    {searchResults && searchResults.length > 0 && (
                        <View className="mb-6">
                            <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">
                                Sonuçlar ({searchResults.length})
                            </Text>
                            {searchResults.map((item, i) => renderFoodItem(item, i))}
                        </View>
                    )}

                    {searchResults && searchResults.length === 0 && (
                        <Text className="text-gray-500 text-center py-4 mb-4">Sonuç bulunamadı</Text>
                    )}

                    {/* Favorites Section */}
                    {!searchQuery && favorites.length > 0 && (
                        <View className="mb-4">
                            <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">❤️ Favoriler</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                                {favorites.map((fav, i) => (
                                    <TouchableOpacity
                                        key={i}
                                        onPress={() => handleFoodTap(fav)}
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

                    {/* Category Tabs */}
                    {!searchQuery && (
                        <>
                            <ScrollView
                                horizontal showsHorizontalScrollIndicator={false}
                                className="mb-4" contentContainerStyle={{ gap: 6 }}
                            >
                                {FOOD_DATABASE.map((cat) => (
                                    <TouchableOpacity
                                        key={cat.id}
                                        onPress={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                                        activeOpacity={0.7}
                                        className={`px-4 py-2 rounded-full border flex-row items-center ${selectedCategory === cat.id ? 'bg-primary/20 border-primary' : 'bg-surface border-gray-800'}`}
                                    >
                                        <Text style={{ fontSize: 14 }}>{cat.icon}</Text>
                                        <Text className={`text-xs font-medium ml-1 ${selectedCategory === cat.id ? 'text-primary' : 'text-gray-400'}`}>
                                            {cat.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            {/* Category Items */}
                            {activeCategory ? (
                                <View className="mb-6">
                                    <Text className="text-white font-bold mb-3">{activeCategory.icon} {activeCategory.label}</Text>
                                    {activeCategory.items.map((item, i) => renderFoodItem(item, i))}
                                </View>
                            ) : (
                                <View className="mb-6">
                                    <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Popüler</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                                        {POPULAR_FOODS.map((meal, i) => (
                                            <TouchableOpacity
                                                key={i}
                                                onPress={() => handleFoodTap(meal)}
                                                activeOpacity={0.7}
                                                className="bg-surface border border-gray-800 rounded-2xl p-3 items-center"
                                                style={{ width: 105 }}
                                            >
                                                <Text style={{ fontSize: 28 }} className="mb-1">{meal.icon}</Text>
                                                <Text className="text-white text-xs font-medium text-center mb-1" numberOfLines={2}>{meal.name}</Text>
                                                <Text className="text-primary text-xs font-bold">{meal.calories} kcal</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
                        </>
                    )}

                    {/* Divider */}
                    <View className="flex-row items-center mb-6 mt-2">
                        <View className="flex-1 h-px bg-gray-800" />
                        <Text className="text-gray-600 text-xs mx-4">veya detaylı gir</Text>
                        <View className="flex-1 h-px bg-gray-800" />
                    </View>

                    {/* Manual Form */}
                    <View className="mb-4">
                        <Text className="text-gray-400 mb-2 ml-1 text-xs">Yemek Adı</Text>
                        <TextInput
                            value={mealName} onChangeText={setMealName}
                            placeholder="Örn: Izgara Tavuk" placeholderTextColor="#4B5563"
                            className="bg-surface text-white p-4 rounded-xl border border-gray-800 text-base"
                        />
                    </View>
                    <View className="mb-4">
                        <Text className="text-gray-400 mb-2 ml-1 text-xs">Kalori (kcal) *</Text>
                        <TextInput
                            value={calories} onChangeText={setCalories}
                            keyboardType="numeric" placeholder="0" placeholderTextColor="#4B5563"
                            className="bg-surface text-white p-4 rounded-xl border border-gray-800 text-lg font-bold"
                        />
                    </View>
                    <View className="flex-row mb-6" style={{ gap: 8 }}>
                        {[
                            { label: 'Protein (g)', val: protein, set: setProtein },
                            { label: 'Karb. (g)', val: carbs, set: setCarbs },
                            { label: 'Yağ (g)', val: fat, set: setFat },
                        ].map(f => (
                            <View key={f.label} className="flex-1">
                                <Text className="text-gray-400 mb-2 ml-1 text-xs">{f.label}</Text>
                                <TextInput
                                    value={f.val} onChangeText={f.set}
                                    keyboardType="numeric" placeholder="0" placeholderTextColor="#4B5563"
                                    className="bg-surface text-white p-3 rounded-xl border border-gray-800 text-base font-bold"
                                />
                            </View>
                        ))}
                    </View>
                </ScrollView>

                {/* Add Button (manual form) */}
                <View className="absolute bottom-6 left-6 right-6">
                    <TouchableOpacity
                        onPress={handleAdd} disabled={!isValid} activeOpacity={0.8}
                        className={`py-4 rounded-2xl items-center ${isValid ? 'bg-primary' : 'bg-gray-800'}`}
                        style={isValid ? { shadowColor: '#34D399', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12 } : {}}
                    >
                        <Text className={`font-bold text-lg ${isValid ? 'text-black' : 'text-gray-500'}`}>
                            ÖĞÜNÜ EKLE ✓
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Success Toast */}
                <Animated.View
                    pointerEvents="none"
                    style={{
                        position: 'absolute', top: 60, left: 0, right: 0,
                        alignItems: 'center',
                        opacity: toastAnim,
                        transform: [{ translateY: toastAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
                    }}
                >
                    <View className="bg-primary px-6 py-3 rounded-full flex-row items-center" style={{ shadowColor: '#34D399', shadowOpacity: 0.4, shadowRadius: 10, elevation: 5 }}>
                        <Text className="text-black font-bold">✓ Eklendi!</Text>
                        {addedCount > 1 && <Text className="text-black/60 ml-2 text-sm">({addedCount} öğün)</Text>}
                    </View>
                </Animated.View>

                {/* Portion Selector Modal */}
                {portionFood && (
                    <View className="absolute top-0 bottom-0 left-0 right-0 h-full w-full bg-black/70 justify-end z-50">
                        <TouchableOpacity
                            className="flex-1"
                            activeOpacity={1}
                            onPress={() => setPortionFood(null)}
                        />
                        <View className="bg-surface rounded-t-3xl p-6 border-t border-gray-800">
                            {/* Food Info */}
                            <View className="flex-row items-center mb-5">
                                <Text style={{ fontSize: 36 }}>{portionFood.icon}</Text>
                                <View className="ml-3 flex-1">
                                    <Text className="text-white font-bold text-lg">{portionFood.name}</Text>
                                    <Text className="text-gray-400 text-xs mt-1">
                                        P: {portionFood.protein}g · K: {portionFood.carbs}g · Y: {portionFood.fat}g
                                    </Text>
                                </View>
                            </View>

                            {/* Meal Category Selector */}
                            <Text className="text-gray-400 text-xs uppercase tracking-wider mb-2">Öğün</Text>
                            <View className="flex-row mb-4" style={{ gap: 6 }}>
                                {MEAL_CATEGORIES.map(c => (
                                    <TouchableOpacity
                                        key={c.id}
                                        onPress={() => setSelectedMealCategory(c.id)}
                                        activeOpacity={0.7}
                                        className={`flex-1 py-2 rounded-lg border items-center ${selectedMealCategory === c.id ? 'bg-primary/20 border-primary' : 'bg-gray-800 border-gray-700'}`}
                                    >
                                        <Text style={{ fontSize: 14 }}>{c.icon}</Text>
                                        <Text className={`text-[10px] mt-0.5 font-medium ${selectedMealCategory === c.id ? 'text-primary' : 'text-gray-400'}`}>{c.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Portion Buttons */}
                            <Text className="text-gray-400 text-xs uppercase tracking-wider mb-3">Porsiyon Seç</Text>
                            <View className="flex-row mb-5" style={{ gap: 8 }}>
                                {PORTIONS.map(p => (
                                    <TouchableOpacity
                                        key={p.value}
                                        onPress={() => setSelectedPortion(p.value)}
                                        activeOpacity={0.8}
                                        className={`flex-1 py-4 rounded-xl items-center border-2 ${selectedPortion === p.value ? 'bg-primary/20 border-primary' : 'bg-gray-800 border-gray-700'}`}
                                    >
                                        <Text className={`text-lg font-bold ${selectedPortion === p.value ? 'text-primary' : 'text-white'}`}>
                                            {p.label}
                                        </Text>
                                        <Text className={`text-xs mt-1 ${selectedPortion === p.value ? 'text-primary/70' : 'text-gray-500'}`}>
                                            porsiyon
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Calculated Values */}
                            <View className="bg-gray-800/50 rounded-xl p-4 flex-row justify-between mb-5">
                                <View className="items-center">
                                    <Text className="text-primary text-xl font-bold">{Math.round(portionFood.calories * selectedPortion)}</Text>
                                    <Text className="text-gray-500 text-xs">kcal</Text>
                                </View>
                                <View className="items-center">
                                    <Text className="text-secondary text-lg font-bold">{Math.round(portionFood.protein * selectedPortion)}g</Text>
                                    <Text className="text-gray-500 text-xs">protein</Text>
                                </View>
                                <View className="items-center">
                                    <Text className="text-accent text-lg font-bold">{Math.round(portionFood.carbs * selectedPortion)}g</Text>
                                    <Text className="text-gray-500 text-xs">karb</Text>
                                </View>
                                <View className="items-center">
                                    <Text className="text-warning text-lg font-bold">{Math.round(portionFood.fat * selectedPortion)}g</Text>
                                    <Text className="text-gray-500 text-xs">yağ</Text>
                                </View>
                            </View>

                            {/* Confirm Button */}
                            <TouchableOpacity
                                onPress={confirmPortion}
                                activeOpacity={0.8}
                                className="bg-primary py-4 rounded-2xl items-center"
                                style={{ shadowColor: '#34D399', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12 }}
                            >
                                <Text className="text-black font-bold text-base">
                                    EKLE · {Math.round(portionFood.calories * selectedPortion)} kcal
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
