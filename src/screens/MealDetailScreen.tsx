import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

import { useCalories } from '../context/CalorieContext';
import { RootStackParamList } from '../navigation/types';
import { hapticSuccess } from '../utils/haptics';

const MealDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<RouteProp<RootStackParamList, 'MealDetail'>>();
    const { addMeal } = useCalories();
    const { photoUri, prediction } = route.params || {};

    // Mock Data if not passed (Fallback)
    const data = prediction || {
        name: 'Izgara Tavuk & Pilav',
        calories: 450,
        protein: 42,
        carbs: 55,
        fat: 8
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#030712' }}>
            <StatusBar style="light" />

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Top Image Area */}
                <View className="relative h-72 w-full">
                    {photoUri ? (
                        <Image source={{ uri: photoUri }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                        <View className="w-full h-full bg-gray-800 items-center justify-center">
                            <Text className="text-gray-500">Fotoğraf Yok</Text>
                        </View>
                    )}
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="absolute top-4 left-4 w-10 h-10 bg-black/50 rounded-full items-center justify-center"
                    >
                        <Text className="text-white text-xl">✕</Text>
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <View className="px-6 -mt-10 pt-10 bg-[#030712] rounded-t-[40px] shadow-2xl">
                    {/* Header */}
                    <View className="flex-row justify-between items-start mb-6">
                        <View>
                            <View className="bg-primary/20 px-3 py-1 rounded-full self-start mb-2">
                                <Text className="text-primary text-xs font-bold uppercase">AI Tespiti</Text>
                            </View>
                            <Text className="text-white text-3xl font-bold">{data.name}</Text>
                            <Text className="text-gray-400 text-sm mt-1">Orta Porsiyon (200g)</Text>
                        </View>
                        <View className="items-end">
                            <Text className="text-4xl font-bold text-white">{data.calories}</Text>
                            <Text className="text-gray-400 text-sm">kcal</Text>
                        </View>
                    </View>

                    {/* Macros */}
                    <View className="flex-row justify-between mb-8">
                        {/* Protein */}
                        <View className="bg-gray-900 flex-1 mr-2 p-4 rounded-2xl border border-gray-800 items-center">
                            <Text className="text-2xl">🥩</Text>
                            <Text className="text-white font-bold text-lg mt-2">{data.protein}g</Text>
                            <Text className="text-gray-500 text-xs">Protein</Text>
                        </View>
                        {/* Carbs */}
                        <View className="bg-gray-900 flex-1 mx-2 p-4 rounded-2xl border border-gray-800 items-center">
                            <Text className="text-2xl">🍚</Text>
                            <Text className="text-white font-bold text-lg mt-2">{data.carbs}g</Text>
                            <Text className="text-gray-500 text-xs">Karbonh.</Text>
                        </View>
                        {/* Fat */}
                        <View className="bg-gray-900 flex-1 ml-2 p-4 rounded-2xl border border-gray-800 items-center">
                            <Text className="text-2xl">🥑</Text>
                            <Text className="text-white font-bold text-lg mt-2">{data.fat}g</Text>
                            <Text className="text-gray-500 text-xs">Yağ</Text>
                        </View>
                    </View>

                    <View className="bg-gray-900 p-4 rounded-2xl border border-gray-800 mb-20">
                        <Text className="text-gray-400 text-sm mb-3">AI Açıklaması</Text>
                        <Text className="text-gray-300 leading-relaxed">
                            Görüntüde ızgara tavuk göğsü ve yanında az yağlı pirinç pilavı tespit edildi. Porsiyon boyutu standart bir öğün olarak hesaplandı.
                        </Text>
                    </View>

                </View>
            </ScrollView>

            {/* Floating Action Button (Confirm) */}
            <View className="absolute bottom-6 left-6 right-6">
                <TouchableOpacity
                    onPress={() => {
                        addMeal({
                            calories: data.calories,
                            protein: data.protein,
                            carbs: data.carbs,
                            fat: data.fat
                        }, data.name);
                        hapticSuccess();
                        navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
                    }}
                    className="bg-primary py-4 rounded-full items-center shadow-[0_0_20px_rgba(0,255,136,0.3)] shadow-primary/30"
                >
                    <Text className="text-black font-extrabold text-lg tracking-wide">ÖĞÜNÜ EKLE ✓</Text>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
};

export default MealDetailScreen;
