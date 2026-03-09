import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

import { useCalories } from '../context/CalorieContext';
import { useLanguage } from '../i18n/LanguageContext';
import { RootStackParamList } from '../navigation/types';
import { hapticSuccess } from '../utils/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallScreen = SCREEN_WIDTH < 380;

const MealDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<RouteProp<RootStackParamList, 'MealDetail'>>();
    const { addMeal } = useCalories();
    const { t } = useLanguage();
    const { photoUri, prediction } = route.params || {};

    const data = prediction || {
        name: 'Grilled Chicken & Rice',
        calories: 450,
        protein: 42,
        carbs: 55,
        fat: 8,
        comment: t.mealDetail.fallbackName,
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#030712' }}>
            <StatusBar style="light" />

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{ position: 'relative', height: SCREEN_WIDTH * 0.7, width: '100%' }}>
                    {photoUri ? (
                        <Image source={{ uri: photoUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    ) : (
                        <View style={{ width: '100%', height: '100%', backgroundColor: '#1F2937', alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ color: '#6B7280' }}>{t.mealDetail.noPhoto}</Text>
                        </View>
                    )}
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={{
                            position: 'absolute', top: 16, left: 16,
                            width: 40, height: 40, backgroundColor: 'rgba(0,0,0,0.5)',
                            borderRadius: 20, alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        <Text style={{ color: '#fff', fontSize: 20 }}>✕</Text>
                    </TouchableOpacity>
                </View>

                <View style={{
                    paddingHorizontal: 20, marginTop: -40, paddingTop: 40,
                    backgroundColor: '#030712', borderTopLeftRadius: 40, borderTopRightRadius: 40,
                }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                        <View style={{ flex: 1, marginRight: 12 }}>
                            <View style={{
                                backgroundColor: 'rgba(52,211,153,0.2)',
                                paddingHorizontal: 12, paddingVertical: 4,
                                borderRadius: 20, alignSelf: 'flex-start', marginBottom: 8
                            }}>
                                <Text style={{ color: '#34D399', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' }}>
                                    {t.mealDetail.aiDetection}
                                </Text>
                            </View>
                            <Text style={{ color: '#fff', fontSize: isSmallScreen ? 22 : 26, fontWeight: 'bold', flexWrap: 'wrap' }}>{data.name}</Text>
                            <Text style={{ color: '#9CA3AF', fontSize: 13, marginTop: 4 }}>
                                {t.mealDetail.mediumPortion}
                            </Text>
                        </View>

                        <View style={{ alignItems: 'flex-end', flexShrink: 0 }}>
                            <Text style={{ fontSize: isSmallScreen ? 32 : 38, fontWeight: 'bold', color: '#fff' }}>{data.calories}</Text>
                            <Text style={{ color: '#9CA3AF', fontSize: 13 }}>kcal</Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, gap: 8 }}>
                        <View style={{ flex: 1, backgroundColor: '#111827', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#1F2937', alignItems: 'center' }}>
                            <Text style={{ fontSize: 24 }}>🥩</Text>
                            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18, marginTop: 8 }}>{data.protein}g</Text>
                            <Text style={{ color: '#6B7280', fontSize: 12 }}>{t.common.protein}</Text>
                        </View>
                        <View style={{ flex: 1, backgroundColor: '#111827', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#1F2937', alignItems: 'center' }}>
                            <Text style={{ fontSize: 24 }}>🍚</Text>
                            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18, marginTop: 8 }}>{data.carbs}g</Text>
                            <Text style={{ color: '#6B7280', fontSize: 12 }}>{t.common.carbs}</Text>
                        </View>
                        <View style={{ flex: 1, backgroundColor: '#111827', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#1F2937', alignItems: 'center' }}>
                            <Text style={{ fontSize: 24 }}>🥑</Text>
                            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18, marginTop: 8 }}>{data.fat}g</Text>
                            <Text style={{ color: '#6B7280', fontSize: 12 }}>{t.common.fat}</Text>
                        </View>
                    </View>

                    <View style={{ backgroundColor: '#111827', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#1F2937', marginBottom: 100 }}>
                        <Text style={{ color: '#9CA3AF', fontSize: 13, marginBottom: 10 }}>{t.mealDetail.aiComment}</Text>
                        <Text style={{ color: '#D1D5DB', fontSize: 15, lineHeight: 22 }}>
                            {data.comment || t.mealDetail.fallbackName}
                        </Text>
                    </View>
                </View>
            </ScrollView>

            <View style={{ position: 'absolute', bottom: 24, left: 20, right: 20 }}>
                <TouchableOpacity
                    onPress={() => {
                        addMeal({ calories: data.calories, protein: data.protein, carbs: data.carbs, fat: data.fat }, data.name);
                        hapticSuccess();
                        navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
                    }}
                    style={{
                        backgroundColor: '#34D399', paddingVertical: 16, borderRadius: 28, alignItems: 'center',
                        shadowColor: '#34D399', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 16,
                    }}
                >
                    <Text style={{ color: '#000', fontWeight: '800', fontSize: 17, letterSpacing: 1 }}>{t.manual.addButton}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default MealDetailScreen;
