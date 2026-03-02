import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useCalories, BADGES } from '../context/CalorieContext';
import { ACTIVITY_LABELS, ACTIVITY_LEVELS } from '../constants';
import BadgeCard from '../components/BadgeCard';



const ProfileScreen = () => {
    const navigation = useNavigation();
    const { userProfile, updateProfile, targets, earnedBadges, streak, mealHistory } = useCalories();

    const [form, setForm] = useState(userProfile);
    const [isEditing, setIsEditing] = useState(false);

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]).start();
    }, []);

    const handleSave = () => {
        updateProfile(form);
        setIsEditing(false);
    };

    const initials = userProfile.gender === 'male' ? '👨' : '👩';
    const totalMeals = mealHistory.length;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#030712' }}>
            <StatusBar style="light" />
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

                    {/* Avatar & Header */}
                    <Animated.View
                        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
                        className="items-center pt-6 pb-4"
                    >
                        <View className="w-20 h-20 bg-surface rounded-full items-center justify-center border-2 border-primary/30 mb-3">
                            <Text style={{ fontSize: 36 }}>{initials}</Text>
                        </View>
                        <Text className="text-white text-xl font-bold">Profil</Text>
                        <Text className="text-gray-400 text-sm mt-1">
                            {userProfile.weight} kg · {userProfile.height} cm · {ACTIVITY_LABELS[userProfile.activityLevel]}
                        </Text>
                    </Animated.View>

                    {/* Stats Row */}
                    <Animated.View
                        style={{ opacity: fadeAnim }}
                        className="flex-row px-6 mb-6"
                    >
                        <View className="flex-1 bg-surface rounded-2xl p-4 border border-gray-800 items-center mr-2">
                            <Text className="text-primary text-2xl font-bold">{streak}</Text>
                            <Text className="text-gray-400 text-xs mt-1">Gün Seri</Text>
                        </View>
                        <View className="flex-1 bg-surface rounded-2xl p-4 border border-gray-800 items-center mx-1">
                            <Text className="text-accent text-2xl font-bold">{earnedBadges.length}</Text>
                            <Text className="text-gray-400 text-xs mt-1">Rozet</Text>
                        </View>
                        <View className="flex-1 bg-surface rounded-2xl p-4 border border-gray-800 items-center ml-2">
                            <Text className="text-secondary text-2xl font-bold">{totalMeals}</Text>
                            <Text className="text-gray-400 text-xs mt-1">Öğün</Text>
                        </View>
                    </Animated.View>

                    {/* Daily Target Card */}
                    <Animated.View style={{ opacity: fadeAnim }} className="px-6 mb-6">
                        <View className="bg-surface rounded-2xl p-5 border border-gray-800">
                            <Text className="text-gray-400 text-xs uppercase tracking-wider mb-2">Günlük Kalori Hedefi</Text>
                            <View className="flex-row items-end">
                                <Text className="text-primary text-3xl font-bold">{Math.round(targets.calories)}</Text>
                                <Text className="text-gray-400 text-sm ml-2 mb-1">kcal</Text>
                            </View>
                            <View className="flex-row mt-3" style={{ gap: 12 }}>
                                <Text className="text-gray-500 text-xs">P: {targets.protein}g</Text>
                                <Text className="text-gray-500 text-xs">K: {targets.carbs}g</Text>
                                <Text className="text-gray-500 text-xs">Y: {targets.fat}g</Text>
                            </View>
                            <Text className="text-gray-600 text-xs mt-2">Fiziksel özelliklerine göre hesaplandı</Text>
                        </View>
                    </Animated.View>

                    {/* Badges */}
                    <Animated.View style={{ opacity: fadeAnim }} className="px-6 mb-6">
                        <Text className="text-white font-bold text-base mb-3">Başarımlar</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                            {BADGES.map(badge => (
                                <BadgeCard key={badge.id} badge={badge} isEarned={earnedBadges.includes(badge.id)} />
                            ))}
                        </ScrollView>
                    </Animated.View>

                    {/* Edit Section */}
                    <Animated.View style={{ opacity: fadeAnim }} className="px-6">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-white font-bold text-base">Bilgilerini Düzenle</Text>
                            <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
                                <Text className="text-primary text-sm font-medium">{isEditing ? 'İptal' : 'Düzenle'}</Text>
                            </TouchableOpacity>
                        </View>

                        {isEditing ? (
                            <View>
                                {/* Gender */}
                                <Text className="text-gray-400 text-xs uppercase tracking-wider mb-2 ml-1">Cinsiyet</Text>
                                <View className="flex-row mb-4" style={{ gap: 8 }}>
                                    <TouchableOpacity
                                        onPress={() => setForm({ ...form, gender: 'male' })}
                                        className={`flex-1 py-3 rounded-xl border items-center ${form.gender === 'male' ? 'bg-secondary/20 border-secondary' : 'bg-surface border-gray-800'}`}
                                    >
                                        <Text className="text-xl mb-1">👨</Text>
                                        <Text className={`text-xs font-bold ${form.gender === 'male' ? 'text-secondary' : 'text-gray-400'}`}>Erkek</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => setForm({ ...form, gender: 'female' })}
                                        className={`flex-1 py-3 rounded-xl border items-center ${form.gender === 'female' ? 'bg-pink-500/20 border-pink-400' : 'bg-surface border-gray-800'}`}
                                    >
                                        <Text className="text-xl mb-1">👩</Text>
                                        <Text className={`text-xs font-bold ${form.gender === 'female' ? 'text-pink-400' : 'text-gray-400'}`}>Kadın</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Weight & Height */}
                                <View className="flex-row mb-4" style={{ gap: 8 }}>
                                    <View className="flex-1">
                                        <Text className="text-gray-400 text-xs mb-2 ml-1">Kilo (kg)</Text>
                                        <TextInput
                                            value={form.weight}
                                            onChangeText={(t) => setForm({ ...form, weight: t })}
                                            keyboardType="numeric"
                                            className="bg-surface text-white p-4 rounded-xl border border-gray-800 text-base font-bold"
                                            placeholderTextColor="#4B5563"
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-gray-400 text-xs mb-2 ml-1">Boy (cm)</Text>
                                        <TextInput
                                            value={form.height}
                                            onChangeText={(t) => setForm({ ...form, height: t })}
                                            keyboardType="numeric"
                                            className="bg-surface text-white p-4 rounded-xl border border-gray-800 text-base font-bold"
                                            placeholderTextColor="#4B5563"
                                        />
                                    </View>
                                </View>

                                {/* Age */}
                                <View className="mb-4">
                                    <Text className="text-gray-400 text-xs mb-2 ml-1">Yaş</Text>
                                    <TextInput
                                        value={form.age}
                                        onChangeText={(t) => setForm({ ...form, age: t })}
                                        keyboardType="numeric"
                                        className="bg-surface text-white p-4 rounded-xl border border-gray-800 text-base font-bold"
                                        placeholderTextColor="#4B5563"
                                    />
                                </View>

                                {/* Activity Level */}
                                <Text className="text-gray-400 text-xs uppercase tracking-wider mb-2 ml-1">Aktivite</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} className="mb-6">
                                    {ACTIVITY_LEVELS.map((item) => (
                                        <TouchableOpacity
                                            key={item.id}
                                            onPress={() => setForm({ ...form, activityLevel: item.id as any })}
                                            className={`px-5 py-3 rounded-xl border items-center ${form.activityLevel === item.id ? 'bg-primary/20 border-primary' : 'bg-surface border-gray-800'}`}
                                        >
                                            <Text className="text-lg mb-1">{item.icon}</Text>
                                            <Text className={`text-xs font-bold ${form.activityLevel === item.id ? 'text-primary' : 'text-gray-400'}`}>{item.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>

                                {/* Save Button */}
                                <TouchableOpacity
                                    onPress={handleSave}
                                    activeOpacity={0.8}
                                    className="bg-primary py-4 rounded-2xl items-center mb-4"
                                    style={{ shadowColor: '#34D399', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12 }}
                                >
                                    <Text className="text-black font-bold text-base">KAYDET</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            /* Read-only Info */
                            <View className="bg-surface rounded-2xl border border-gray-800 overflow-hidden">
                                {[
                                    { label: 'Cinsiyet', value: form.gender === 'male' ? 'Erkek' : 'Kadın', icon: form.gender === 'male' ? '👨' : '👩' },
                                    { label: 'Yaş', value: `${form.age} yıl`, icon: '🎂' },
                                    { label: 'Kilo', value: `${form.weight} kg`, icon: '⚖️' },
                                    { label: 'Boy', value: `${form.height} cm`, icon: '📏' },
                                    { label: 'Aktivite', value: ACTIVITY_LABELS[form.activityLevel] || form.activityLevel, icon: '🏃' },
                                ].map((item, i, arr) => (
                                    <View key={item.label} className={`flex-row items-center p-4 ${i < arr.length - 1 ? 'border-b border-gray-800' : ''}`}>
                                        <Text className="text-lg mr-3">{item.icon}</Text>
                                        <Text className="text-gray-400 flex-1">{item.label}</Text>
                                        <Text className="text-white font-medium">{item.value}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </Animated.View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ProfileScreen;
