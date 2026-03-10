import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { useCalories } from '../context/CalorieContext';
import { useLanguage } from '../i18n/LanguageContext';
import { ACTIVITY_MULTIPLIERS, ActivityLevelId, ACTIVITY_LEVEL_DEFS } from '../constants';
import { getAvatarsForGender } from '../constants/avatars';
import RulerPicker from '../components/RulerPicker';
import { hapticLight, hapticSuccess } from '../utils/haptics';

const { width } = Dimensions.get('window');

const SmartOnboardingScreen = () => {
    const navigation = useNavigation();
    const { updateProfile } = useCalories();
    const { t, lang } = useLanguage();

    const [step, setStep] = useState(0);
    const [goal, setGoal] = useState<'lose' | 'maintain' | 'gain'>('lose');
    const [bodyType, setBodyType] = useState<'ectomorph' | 'mesomorph' | 'endomorph' | 'unsure'>('unsure');
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [activityLevel, setActivityLevel] = useState<ActivityLevelId>('moderate');
    const [age, setAge] = useState(25);
    const [height, setHeight] = useState(175);
    const [weight, setWeight] = useState(70);
    const [targetWeight, setTargetWeight] = useState(65);
    const [avatar, setAvatar] = useState<string | undefined>(undefined);

    const fadeAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const progressAnim = useRef(new Animated.Value(0.2)).current;
    const contentAnim = useRef(new Animated.Value(1)).current;
    const buttonPulse = useRef(new Animated.Value(1)).current;
    const [showCelebration, setShowCelebration] = useState(false);

    const STEPS = t.onboarding.steps;
    const STEP_ICONS = t.onboarding.stepIcons;

    const GOALS = [
        { id: 'lose' as const, label: t.onboarding.goals.lose.label, icon: '🔥', desc: t.onboarding.goals.lose.desc, color: '#F87171' },
        { id: 'maintain' as const, label: t.onboarding.goals.maintain.label, icon: '⚖️', desc: t.onboarding.goals.maintain.desc, color: '#34D399' },
        { id: 'gain' as const, label: t.onboarding.goals.gain.label, icon: '💪', desc: t.onboarding.goals.gain.desc, color: '#60A5FA' },
    ];

    const BODY_TYPES = [
        { id: 'ectomorph' as const, label: t.onboarding.bodyTypes.ectomorph.label, icon: '🏃', desc: t.onboarding.bodyTypes.ectomorph.desc, color: '#60A5FA' },
        { id: 'mesomorph' as const, label: t.onboarding.bodyTypes.mesomorph.label, icon: '⚖️', desc: t.onboarding.bodyTypes.mesomorph.desc, color: '#34D399' },
        { id: 'endomorph' as const, label: t.onboarding.bodyTypes.endomorph.label, icon: '🐻', desc: t.onboarding.bodyTypes.endomorph.desc, color: '#F87171' },
        { id: 'unsure' as const, label: t.onboarding.bodyTypes.unsure.label, icon: '🤔', desc: t.onboarding.bodyTypes.unsure.desc, color: '#A78BFA' },
    ];

    const ACTIVITY_LEVELS = ACTIVITY_LEVEL_DEFS.map(item => ({
        ...item,
        label: t.activity[item.id]?.label || item.id,
        desc: t.activity[item.id]?.desc || '',
        multiplier: ACTIVITY_MULTIPLIERS[item.id],
    }));

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(buttonPulse, { toValue: 1.03, duration: 1200, useNativeDriver: true }),
                Animated.timing(buttonPulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, []);

    const animateTransition = (nextStep: number) => {
        const direction = nextStep > step ? 1 : -1;
        hapticLight();
        Animated.timing(progressAnim, {
            toValue: (nextStep + 1) / STEPS.length,
            duration: 400,
            useNativeDriver: false,
        }).start();

        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: -50 * direction, duration: 180, useNativeDriver: true }),
            Animated.timing(contentAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        ]).start(() => {
            setStep(nextStep);
            slideAnim.setValue(50 * direction);
            scaleAnim.setValue(0.8);
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
                Animated.spring(slideAnim, { toValue: 0, friction: 6, tension: 60, useNativeDriver: true }),
                Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
                Animated.timing(contentAnim, { toValue: 1, duration: 400, delay: 100, useNativeDriver: true }),
            ]).start();
        });
    };

    const handleFinish = () => {
        setShowCelebration(true);
        hapticSuccess();
        Animated.sequence([
            Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
            Animated.delay(600),
        ]).start(() => {
            updateProfile({
                weight: String(weight),
                height: String(height),
                age: String(age),
                gender,
                activityLevel,
                goal,
                targetWeight: String(targetWeight),
                bodyType,
                avatar,
            });
            navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
        });
    };

    const renderStep = () => {
        switch (step) {
            case 0:
                return (
                    <View className="mt-6">
                        {GOALS.map((g) => (
                            <TouchableOpacity key={g.id} onPress={() => setGoal(g.id)} activeOpacity={0.7}
                                className={`flex-row items-center p-5 rounded-2xl border-2 mb-3 ${goal === g.id ? 'border-primary bg-primary/10' : 'border-gray-800 bg-surface'}`}
                            >
                                <View className="w-12 h-12 rounded-xl items-center justify-center mr-4" style={{ backgroundColor: g.color + '20' }}>
                                    <Text style={{ fontSize: 24 }}>{g.icon}</Text>
                                </View>
                                <View className="flex-1">
                                    <Text className={`font-bold text-base ${goal === g.id ? 'text-primary' : 'text-white'}`}>{g.label}</Text>
                                    <Text className="text-gray-500 text-xs mt-1">{g.desc}</Text>
                                </View>
                                {goal === g.id && (
                                    <View className="w-6 h-6 bg-primary rounded-full items-center justify-center">
                                        <Text className="text-black text-xs font-bold">✓</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                );

            case 1:
                return (
                    <View className="mt-6">
                        {BODY_TYPES.map((b) => (
                            <TouchableOpacity key={b.id} onPress={() => setBodyType(b.id)} activeOpacity={0.7}
                                className={`flex-row items-center p-5 rounded-2xl border-2 mb-3 ${bodyType === b.id ? 'border-primary bg-primary/10' : 'border-gray-800 bg-surface'}`}
                            >
                                <View className="w-12 h-12 rounded-xl items-center justify-center mr-4" style={{ backgroundColor: b.color + '20' }}>
                                    <Text style={{ fontSize: 24 }}>{b.icon}</Text>
                                </View>
                                <View className="flex-1">
                                    <Text className={`font-bold text-base ${bodyType === b.id ? 'text-primary' : 'text-white'}`}>{b.label}</Text>
                                    <Text className="text-gray-500 text-xs mt-1">{b.desc}</Text>
                                </View>
                                {bodyType === b.id && (
                                    <View className="w-6 h-6 bg-primary rounded-full items-center justify-center">
                                        <Text className="text-black text-xs font-bold">✓</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                );

            case 2:
                return (
                    <View className="mt-6">
                        <Text className="text-gray-400 text-xs uppercase tracking-wider mb-3 ml-1">{t.onboarding.gender}</Text>
                        <View className="flex-row mb-8" style={{ gap: 12 }}>
                            <TouchableOpacity onPress={() => setGender('male')} activeOpacity={0.7}
                                className={`flex-1 p-5 rounded-2xl border-2 items-center ${gender === 'male' ? 'border-secondary bg-secondary/10' : 'border-gray-800 bg-surface'}`}
                            >
                                <Text style={{ fontSize: 40 }}>👨</Text>
                                <Text className={`font-bold mt-2 ${gender === 'male' ? 'text-secondary' : 'text-gray-400'}`}>{t.onboarding.male}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setGender('female')} activeOpacity={0.7}
                                className={`flex-1 p-5 rounded-2xl border-2 items-center ${gender === 'female' ? 'border-pink-400 bg-pink-400/10' : 'border-gray-800 bg-surface'}`}
                            >
                                <Text style={{ fontSize: 40 }}>👩</Text>
                                <Text className={`font-bold mt-2 ${gender === 'female' ? 'text-pink-400' : 'text-gray-400'}`}>{t.onboarding.female}</Text>
                            </TouchableOpacity>
                        </View>
                        <RulerPicker label={t.onboarding.age} value={age} setValue={setAge} min={12} max={100} unit={t.onboarding.ageUnit} />
                    </View>
                );

            case 3:
                return (
                    <View className="mt-6">
                        <RulerPicker label={t.onboarding.height} value={height} setValue={setHeight} min={100} max={250} unit={t.onboarding.heightUnit} />
                        <RulerPicker label={t.onboarding.weight} value={weight} setValue={setWeight} min={30} max={200} step={0.5} unit={t.onboarding.weightUnit} />
                        <RulerPicker label={t.onboarding.targetWeight} value={targetWeight} setValue={setTargetWeight} min={30} max={200} step={0.5} unit={t.onboarding.weightUnit} />
                    </View>
                );

            case 4:
                return (
                    <View className="mt-4">
                        {ACTIVITY_LEVELS.map((item) => (
                            <TouchableOpacity key={item.id} onPress={() => setActivityLevel(item.id)} activeOpacity={0.7}
                                className={`flex-row items-center p-4 rounded-2xl border-2 mb-2 ${activityLevel === item.id ? 'bg-primary/10 border-primary' : 'bg-surface border-gray-800'}`}
                            >
                                <View className="w-10 h-10 bg-gray-800 rounded-xl items-center justify-center mr-3">
                                    <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                                </View>
                                <View className="flex-1">
                                    <Text className={`font-bold ${activityLevel === item.id ? 'text-primary' : 'text-white'}`}>{item.label}</Text>
                                    <Text className="text-gray-500 text-xs">{item.desc}</Text>
                                </View>
                                <Text className="text-gray-600 text-xs font-mono">{item.multiplier}</Text>
                                {activityLevel === item.id && (
                                    <View className="w-5 h-5 bg-primary rounded-full items-center justify-center ml-2">
                                        <Text className="text-black text-[10px] font-bold">✓</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                );

            case 5:
                const availableAvatars = getAvatarsForGender(gender);
                return (
                    <View className="mt-4 pb-10">
                        <Text className="text-gray-400 text-sm mb-6 text-center">{t.onboarding.avatarTitle}</Text>
                        <View className="flex-row flex-wrap justify-between" style={{ gap: 12 }}>
                            {availableAvatars.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    onPress={() => setAvatar(item.id)}
                                    activeOpacity={0.8}
                                    className={`rounded-full p-1 border-2 ${avatar === item.id ? 'border-primary bg-primary/20' : 'border-transparent'}`}
                                    style={{ width: (width - 48 - 24) / 3, aspectRatio: 1 }}
                                >
                                    <View className="w-full h-full rounded-full overflow-hidden bg-gray-800">
                                        <Image source={item.source} className="w-full h-full" resizeMode="cover" />
                                    </View>
                                    {avatar === item.id && (
                                        <View className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-full items-center justify-center border-2 border-gray-900">
                                            <Text className="text-black text-[10px] font-bold">✓</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                );

            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#030712' }}>
            <StatusBar style="light" />

            <View className="px-6 pt-4 pb-2">
                <View className="flex-row items-center mb-2">
                    {step > 0 && (
                        <TouchableOpacity onPress={() => animateTransition(step - 1)} className="mr-3 p-1">
                            <Text className="text-gray-400 text-xl">←</Text>
                        </TouchableOpacity>
                    )}
                    <View className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <Animated.View
                            className="h-full bg-primary rounded-full"
                            style={{ width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }}
                        />
                    </View>
                    <Text className="text-gray-500 text-xs ml-3">{step + 1}/{STEPS.length}</Text>
                </View>
            </View>

            <Animated.View
                style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
                className="px-6"
            >
                <View className="flex-row items-center mb-2">
                    <Animated.Text style={{ fontSize: 32, transform: [{ scale: scaleAnim }] }}>{STEP_ICONS[step]}</Animated.Text>
                    <View className="ml-3">
                        <Text className="text-white text-2xl font-bold">{STEPS[step].title}</Text>
                        <Animated.Text style={{ opacity: contentAnim }} className="text-gray-400 text-sm mt-1">{STEPS[step].subtitle}</Animated.Text>
                    </View>
                </View>
            </Animated.View>

            <Animated.ScrollView
                style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
                className="px-6"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {renderStep()}
            </Animated.ScrollView>

            <View className="absolute bottom-6 left-6 right-6">
                <Animated.View style={{ transform: [{ scale: buttonPulse }] }}>
                    <TouchableOpacity
                        onPress={step < STEPS.length - 1 ? () => animateTransition(step + 1) : handleFinish}
                        activeOpacity={0.8}
                        className="bg-primary py-4 rounded-2xl items-center flex-row justify-center"
                        style={{ shadowColor: '#34D399', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 16 }}
                    >
                        <Text className="text-black font-bold text-lg">
                            {step < STEPS.length - 1 ? t.common.next : t.common.start}
                        </Text>
                        <Text className="text-black text-lg ml-2">{step < STEPS.length - 1 ? '→' : '🚀'}</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>

            {showCelebration && (
                <View className="absolute top-0 bottom-0 left-0 right-0 h-full w-full items-center justify-center bg-black/60 z-50">
                    <Text style={{ fontSize: 64 }}>🎉</Text>
                    <Text className="text-white text-2xl font-bold mt-4">{t.onboarding.celebration}</Text>
                    <Text className="text-gray-300 text-base mt-2">{t.onboarding.preparing}</Text>
                </View>
            )}
        </SafeAreaView>
    );
};

export default SmartOnboardingScreen;
