import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Animated, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useCalories, BADGES } from '../context/CalorieContext';
import { useLanguage, Language } from '../i18n/LanguageContext';
import { ACTIVITY_LEVEL_DEFS } from '../constants';
import { resolveBadgeName } from '../utils/badges';
import BadgeCard from '../components/BadgeCard';
import AvatarDisplay from '../components/AvatarDisplay';
import { getAllAvatars } from '../constants/avatars';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';

const ProfileScreen = () => {
    const navigation = useNavigation();
    const { userProfile, updateProfile, targets, earnedBadges, streak, mealHistory } = useCalories();
    const { t, lang, setLanguage } = useLanguage();

    const [form, setForm] = useState(userProfile);
    const [isEditing, setIsEditing] = useState(false);
    const [showQuickAvatar, setShowQuickAvatar] = useState(false);
    const [langDropdownOpen, setLangDropdownOpen] = useState(false);

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

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const updatedForm = { ...form, avatar: result.assets[0].uri };
            setForm(updatedForm);
            updateProfile(updatedForm);
            setShowQuickAvatar(false);
        }
    };

    const handleQuickAvatarSelect = (avatarId: string) => {
        const updatedForm = { ...form, avatar: avatarId };
        setForm(updatedForm);
        updateProfile(updatedForm);
        setShowQuickAvatar(false);
    };

    const actKeys = ['sedentary', 'light', 'moderate', 'active', 'extra'] as const;
    const actKey = actKeys.includes(userProfile.activityLevel as any) ? userProfile.activityLevel as typeof actKeys[number] : 'moderate';
    const activityLabel = t.activity[actKey]?.label || userProfile.activityLevel;

    const ACTIVITY_LEVELS = ACTIVITY_LEVEL_DEFS.map(item => ({
        ...item,
        label: t.activity[item.id]?.label || item.id,
    }));

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
                        <TouchableOpacity
                            onPress={() => setShowQuickAvatar(!showQuickAvatar)}
                            activeOpacity={0.8}
                            className="w-20 h-20 bg-surface rounded-full items-center justify-center border-2 border-primary/30 mb-2 relative"
                        >
                            <AvatarDisplay avatar={userProfile.avatar} name={userProfile.name} size="lg" />
                            <View className="absolute bottom-0 right-0 w-6 h-6 bg-surface border border-gray-700 rounded-full items-center justify-center">
                                <Feather name="refresh-cw" size={12} color="#34D399" />
                            </View>
                        </TouchableOpacity>

                        {showQuickAvatar && (
                            <View className="w-full mb-4 px-2">
                                <Text className="text-gray-400 text-xs mb-2 text-center">{t.profile.changeAvatar}</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
                                    <TouchableOpacity
                                        onPress={pickImage}
                                        className="w-14 h-14 rounded-full bg-surface items-center justify-center border border-gray-700"
                                    >
                                        <Text className="text-lg">📸</Text>
                                    </TouchableOpacity>
                                    {getAllAvatars().map((item) => (
                                        <TouchableOpacity
                                            key={item.id}
                                            onPress={() => handleQuickAvatarSelect(item.id)}
                                            activeOpacity={0.8}
                                            className={`w-14 h-14 rounded-full p-0.5 border-2 ${userProfile.avatar === item.id ? 'border-primary bg-primary/20' : 'border-transparent'}`}
                                        >
                                            <View className="w-full h-full rounded-full overflow-hidden bg-gray-800">
                                                <Image source={item.source} className="w-full h-full" resizeMode="cover" />
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}

                        <Text className="text-white text-xl font-bold">{t.profile.title}</Text>
                        <Text className="text-gray-400 text-sm mt-1">
                            {userProfile.weight} kg · {userProfile.height} cm · {activityLabel}
                        </Text>
                    </Animated.View>

                    {/* Stats Row */}
                    <Animated.View style={{ opacity: fadeAnim }} className="flex-row px-6 mb-6">
                        <View className="flex-1 bg-surface rounded-2xl p-4 border border-gray-800 items-center mr-2">
                            <Text className="text-primary text-2xl font-bold">{streak}</Text>
                            <Text className="text-gray-400 text-xs mt-1">{t.profile.dayStreak}</Text>
                        </View>
                        <View className="flex-1 bg-surface rounded-2xl p-4 border border-gray-800 items-center mx-1">
                            <Text className="text-accent text-2xl font-bold">{earnedBadges.length}</Text>
                            <Text className="text-gray-400 text-xs mt-1">{t.profile.badges}</Text>
                        </View>
                        <View className="flex-1 bg-surface rounded-2xl p-4 border border-gray-800 items-center ml-2">
                            <Text className="text-secondary text-2xl font-bold">{mealHistory.length}</Text>
                            <Text className="text-gray-400 text-xs mt-1">{t.profile.meals}</Text>
                        </View>
                    </Animated.View>

                    {/* Daily Target Card */}
                    <Animated.View style={{ opacity: fadeAnim }} className="px-6 mb-6">
                        <View className="bg-surface rounded-2xl p-5 border border-gray-800">
                            <Text className="text-gray-400 text-xs uppercase tracking-wider mb-2">{t.profile.dailyTarget}</Text>
                            <View className="flex-row items-end">
                                <Text className="text-primary text-3xl font-bold">{Math.round(targets.calories)}</Text>
                                <Text className="text-gray-400 text-sm ml-2 mb-1">kcal</Text>
                            </View>
                            <View className="flex-row mt-3" style={{ gap: 12 }}>
                                <Text className="text-gray-500 text-xs">P: {targets.protein}g</Text>
                                <Text className="text-gray-500 text-xs">K: {targets.carbs}g</Text>
                                <Text className="text-gray-500 text-xs">{t.common.fat.charAt(0)}: {targets.fat}g</Text>
                            </View>
                            <Text className="text-gray-600 text-xs mt-2">{t.profile.calculated}</Text>
                        </View>
                    </Animated.View>

                    {/* Language Selector Dropdown */}
                    <Animated.View style={{ opacity: fadeAnim }} className="px-6 mb-6">
                        <Text className="text-white font-bold text-base mb-3">{t.profile.language}</Text>
                        <TouchableOpacity
                            onPress={() => setLangDropdownOpen(!langDropdownOpen)}
                            activeOpacity={0.8}
                            className="bg-surface rounded-2xl border border-gray-800 px-4 py-3.5 flex-row items-center justify-between"
                        >
                            <View className="flex-row items-center">
                                <Text style={{ fontSize: 22, marginRight: 10 }}>{lang === 'tr' ? '🇹🇷' : '🇬🇧'}</Text>
                                <Text className="text-white font-semibold text-sm">
                                    {lang === 'tr' ? t.profile.turkish : t.profile.english}
                                </Text>
                            </View>
                            <Text style={{ fontSize: 14, color: '#6B7280', transform: [{ rotate: langDropdownOpen ? '180deg' : '0deg' }] }}>▼</Text>
                        </TouchableOpacity>

                        {langDropdownOpen && (
                            <View className="bg-surface rounded-2xl border border-gray-800 mt-2 overflow-hidden">
                                {([
                                    { id: 'en' as Language, flag: '🇬🇧', label: 'English' },
                                    { id: 'tr' as Language, flag: '🇹🇷', label: 'Türkçe' },
                                ] as const).map((option, i) => (
                                    <TouchableOpacity
                                        key={option.id}
                                        onPress={() => {
                                            setLanguage(option.id);
                                            setLangDropdownOpen(false);
                                        }}
                                        activeOpacity={0.7}
                                        className={`flex-row items-center justify-between px-4 py-3.5 ${i < 1 ? 'border-b border-gray-800' : ''}`}
                                        style={lang === option.id ? { backgroundColor: 'rgba(52,211,153,0.08)' } : {}}
                                    >
                                        <View className="flex-row items-center">
                                            <Text style={{ fontSize: 22, marginRight: 10 }}>{option.flag}</Text>
                                            <Text className={`font-semibold text-sm ${lang === option.id ? 'text-primary' : 'text-gray-300'}`}>
                                                {option.label}
                                            </Text>
                                        </View>
                                        {lang === option.id && (
                                            <Text style={{ color: '#34D399', fontSize: 16, fontWeight: 'bold' }}>✓</Text>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </Animated.View>

                    {/* Badges */}
                    <Animated.View style={{ opacity: fadeAnim }} className="px-6 mb-6">
                        <Text className="text-white font-bold text-base mb-3">{t.profile.achievements}</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                            {BADGES.map(badge => (
                                <BadgeCard key={badge.id} badge={{ ...badge, name: resolveBadgeName(badge, t.badges) }} isEarned={earnedBadges.includes(badge.id)} />
                            ))}
                        </ScrollView>
                    </Animated.View>

                    {/* Edit Section */}
                    <Animated.View style={{ opacity: fadeAnim }} className="px-6">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-white font-bold text-base">{t.profile.editInfo}</Text>
                            <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
                                <Text className="text-primary text-sm font-medium">{isEditing ? t.common.cancel : t.common.edit}</Text>
                            </TouchableOpacity>
                        </View>

                        {isEditing ? (
                            <View>
                                <Text className="text-gray-400 text-xs uppercase tracking-wider mb-2 ml-1">{t.onboarding.gender}</Text>
                                <View className="flex-row mb-4" style={{ gap: 8 }}>
                                    <TouchableOpacity
                                        onPress={() => setForm({ ...form, gender: 'male' })}
                                        className={`flex-1 py-3 rounded-xl border items-center ${form.gender === 'male' ? 'bg-secondary/20 border-secondary' : 'bg-surface border-gray-800'}`}
                                    >
                                        <Text className="text-xl mb-1">👨</Text>
                                        <Text className={`text-xs font-bold ${form.gender === 'male' ? 'text-secondary' : 'text-gray-400'}`}>{t.onboarding.male}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => setForm({ ...form, gender: 'female' })}
                                        className={`flex-1 py-3 rounded-xl border items-center ${form.gender === 'female' ? 'bg-pink-500/20 border-pink-400' : 'bg-surface border-gray-800'}`}
                                    >
                                        <Text className="text-xl mb-1">👩</Text>
                                        <Text className={`text-xs font-bold ${form.gender === 'female' ? 'text-pink-400' : 'text-gray-400'}`}>{t.onboarding.female}</Text>
                                    </TouchableOpacity>
                                </View>

                                <View className="flex-row mb-4" style={{ gap: 8 }}>
                                    <View className="flex-1">
                                        <Text className="text-gray-400 text-xs mb-2 ml-1">{t.onboarding.weight} (kg)</Text>
                                        <TextInput value={form.weight}
                                            onChangeText={(txt) => setForm({ ...form, weight: txt })}
                                            keyboardType="numeric"
                                            className="bg-surface text-white p-4 rounded-xl border border-gray-800 text-base font-bold"
                                            placeholderTextColor="#4B5563"
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-gray-400 text-xs mb-2 ml-1">{t.onboarding.height} (cm)</Text>
                                        <TextInput value={form.height}
                                            onChangeText={(txt) => setForm({ ...form, height: txt })}
                                            keyboardType="numeric"
                                            className="bg-surface text-white p-4 rounded-xl border border-gray-800 text-base font-bold"
                                            placeholderTextColor="#4B5563"
                                        />
                                    </View>
                                </View>

                                <View className="mb-4">
                                    <Text className="text-gray-400 text-xs mb-2 ml-1">{t.onboarding.age}</Text>
                                    <TextInput value={form.age}
                                        onChangeText={(txt) => setForm({ ...form, age: txt })}
                                        keyboardType="numeric"
                                        className="bg-surface text-white p-4 rounded-xl border border-gray-800 text-base font-bold"
                                        placeholderTextColor="#4B5563"
                                    />
                                </View>

                                <Text className="text-gray-400 text-xs uppercase tracking-wider mb-2 ml-1">{t.activity.label}</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} className="mb-6">
                                    {ACTIVITY_LEVELS.map((item) => (
                                        <TouchableOpacity key={item.id}
                                            onPress={() => setForm({ ...form, activityLevel: item.id as any })}
                                            className={`px-5 py-3 rounded-xl border items-center ${form.activityLevel === item.id ? 'bg-primary/20 border-primary' : 'bg-surface border-gray-800'}`}
                                        >
                                            <Text className="text-lg mb-1">{item.icon}</Text>
                                            <Text className={`text-xs font-bold ${form.activityLevel === item.id ? 'text-primary' : 'text-gray-400'}`}>{item.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>

                                <TouchableOpacity onPress={handleSave} activeOpacity={0.8}
                                    className="bg-primary py-4 rounded-2xl items-center mb-4"
                                    style={{ shadowColor: '#34D399', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12 }}
                                >
                                    <Text className="text-black font-bold text-base">{t.common.save}</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View className="bg-surface rounded-2xl border border-gray-800 overflow-hidden">
                                {[
                                    { label: t.onboarding.gender, value: form.gender === 'male' ? t.onboarding.male : t.onboarding.female, icon: form.gender === 'male' ? '👨' : '👩' },
                                    { label: t.onboarding.age, value: `${form.age} ${t.onboarding.ageUnit}`, icon: '🎂' },
                                    { label: t.onboarding.weight, value: `${form.weight} kg`, icon: '⚖️' },
                                    { label: t.onboarding.height, value: `${form.height} cm`, icon: '📏' },
                                    { label: t.activity.label, value: activityLabel, icon: '🏃' },
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
