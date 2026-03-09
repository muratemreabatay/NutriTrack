import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Animated, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLanguage, Language } from '../i18n/LanguageContext';
import { useCalories } from '../context/CalorieContext';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import trTranslations from '../i18n/tr';
import enTranslations from '../i18n/en';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const WelcomeScreen = () => {
    const navigation = useNavigation();
    const { t, lang, completeFirstLaunch } = useLanguage();
    const { updateProfile, userProfile } = useCalories();

    const [selectedLang, setSelectedLang] = useState<Language>(lang);
    const [name, setName] = useState('');
    const [step, setStep] = useState(0); // 0 = language, 1 = name
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const logoScale = useRef(new Animated.Value(0.5)).current;
    const contentFade = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(logoScale, { toValue: 1, friction: 5, tension: 40, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]).start();
    }, []);

    const animateToStep = (nextStep: number) => {
        Animated.timing(contentFade, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
            setStep(nextStep);
            Animated.timing(contentFade, { toValue: 1, duration: 300, useNativeDriver: true }).start();
        });
    };

    // Get translations based on selectedLang (so UI updates when dropdown changes)
    const allTranslations = { tr: trTranslations, en: enTranslations };
    const translations = allTranslations[selectedLang];

    const handleComplete = () => {
        completeFirstLaunch(selectedLang);
        updateProfile({ ...userProfile, name: name.trim() || '' });
        navigation.reset({ index: 0, routes: [{ name: 'Onboarding' as never }] });
    };

    const LANGUAGES = [
        { id: 'en' as Language, flag: '🇬🇧', label: 'English' },
        { id: 'tr' as Language, flag: '🇹🇷', label: 'Türkçe' },
    ];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#030712' }}>
            <StatusBar style="light" />
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>

                    {/* Logo */}
                    <Animated.View style={{
                        transform: [{ scale: logoScale }],
                        opacity: fadeAnim,
                        marginBottom: 32,
                        alignItems: 'center',
                    }}>
                        <View style={{
                            width: 80, height: 80, borderRadius: 24,
                            backgroundColor: '#111827', borderWidth: 2, borderColor: 'rgba(52,211,153,0.3)',
                            alignItems: 'center', justifyContent: 'center',
                            shadowColor: '#34D399', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 20,
                        }}>
                            <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
                                <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#34D399" opacity={0.15} />
                                <Path d="M7 12.5c0-3 2.5-5.5 5-5.5s5 2.5 5 5.5c0 3-2 5.5-5 5.5s-5-2.5-5-5.5z" stroke="#34D399" strokeWidth={1.5} fill="none" />
                                <Path d="M12 7V4M12 4c-1 0-2 1-2 2M12 4c1 0 2 1 2 2" stroke="#34D399" strokeWidth={1.5} strokeLinecap="round" />
                            </Svg>
                        </View>
                        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 16, letterSpacing: 0.5 }}>
                            NutriTrack
                        </Text>
                        <Text style={{ color: '#6B7280', fontSize: 13, marginTop: 4 }}>
                            {translations.welcome.subtitle}
                        </Text>
                    </Animated.View>

                    {/* Content */}
                    <Animated.View style={{
                        opacity: Animated.multiply(fadeAnim, contentFade),
                        transform: [{ translateY: slideAnim }],
                        width: '100%',
                    }}>
                        {step === 0 ? (
                            /* Step 1: Language Selection */
                            <View>
                                <Text style={{ color: '#9CA3AF', fontSize: 14, fontWeight: '600', marginBottom: 12, textAlign: 'center' }}>
                                    {translations.welcome.selectLanguage}
                                </Text>

                                {/* Dropdown trigger */}
                                <TouchableOpacity
                                    onPress={() => setDropdownOpen(!dropdownOpen)}
                                    activeOpacity={0.8}
                                    style={{
                                        backgroundColor: '#111827', borderRadius: 16,
                                        borderWidth: 1, borderColor: '#1F2937',
                                        paddingHorizontal: 16, paddingVertical: 14,
                                        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                                    }}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 22, marginRight: 10 }}>
                                            {LANGUAGES.find(l => l.id === selectedLang)?.flag}
                                        </Text>
                                        <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>
                                            {LANGUAGES.find(l => l.id === selectedLang)?.label}
                                        </Text>
                                    </View>
                                    <Text style={{ fontSize: 12, color: '#6B7280', transform: [{ rotate: dropdownOpen ? '180deg' : '0deg' }] }}>▼</Text>
                                </TouchableOpacity>

                                {/* Dropdown options */}
                                {dropdownOpen && (
                                    <View style={{
                                        backgroundColor: '#111827', borderRadius: 16,
                                        borderWidth: 1, borderColor: '#1F2937',
                                        marginTop: 8, overflow: 'hidden',
                                    }}>
                                        {LANGUAGES.map((option, i) => (
                                            <TouchableOpacity
                                                key={option.id}
                                                onPress={() => {
                                                    setSelectedLang(option.id);
                                                    setDropdownOpen(false);
                                                }}
                                                activeOpacity={0.7}
                                                style={{
                                                    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                                                    paddingHorizontal: 16, paddingVertical: 14,
                                                    borderBottomWidth: i < LANGUAGES.length - 1 ? 1 : 0,
                                                    borderBottomColor: '#1F2937',
                                                    backgroundColor: selectedLang === option.id ? 'rgba(52,211,153,0.08)' : 'transparent',
                                                }}
                                            >
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <Text style={{ fontSize: 22, marginRight: 10 }}>{option.flag}</Text>
                                                    <Text style={{
                                                        fontWeight: '600', fontSize: 15,
                                                        color: selectedLang === option.id ? '#34D399' : '#D1D5DB',
                                                    }}>{option.label}</Text>
                                                </View>
                                                {selectedLang === option.id && (
                                                    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                                                        <Path d="M20 6L9 17l-5-5" stroke="#34D399" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                                                    </Svg>
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}

                                {/* Continue button */}
                                <TouchableOpacity
                                    onPress={() => animateToStep(1)}
                                    activeOpacity={0.8}
                                    style={{
                                        backgroundColor: '#34D399', paddingVertical: 16, borderRadius: 20,
                                        alignItems: 'center', marginTop: 24,
                                        shadowColor: '#34D399', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12,
                                    }}
                                >
                                    <Text style={{ color: '#000', fontWeight: '800', fontSize: 16, letterSpacing: 0.5 }}>
                                        {translations.common.next}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            /* Step 2: Name Input */
                            <View>
                                <Text style={{ color: '#9CA3AF', fontSize: 14, fontWeight: '600', marginBottom: 16, textAlign: 'center' }}>
                                    {translations.welcome.enterName}
                                </Text>

                                <TextInput
                                    value={name}
                                    onChangeText={setName}
                                    placeholder={translations.welcome.namePlaceholder}
                                    placeholderTextColor="#4B5563"
                                    autoFocus
                                    style={{
                                        backgroundColor: '#111827', borderRadius: 16,
                                        borderWidth: 1, borderColor: '#1F2937',
                                        paddingHorizontal: 20, paddingVertical: 16,
                                        color: '#fff', fontSize: 18, fontWeight: '600',
                                        textAlign: 'center',
                                    }}
                                />

                                <TouchableOpacity
                                    onPress={handleComplete}
                                    activeOpacity={0.8}
                                    style={{
                                        backgroundColor: '#34D399', paddingVertical: 16, borderRadius: 20,
                                        alignItems: 'center', marginTop: 24,
                                        shadowColor: '#34D399', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12,
                                    }}
                                >
                                    <Text style={{ color: '#000', fontWeight: '800', fontSize: 16, letterSpacing: 0.5 }}>
                                        {translations.welcome.getStarted}
                                    </Text>
                                </TouchableOpacity>

                                {/* Back button */}
                                <TouchableOpacity
                                    onPress={() => animateToStep(0)}
                                    style={{ alignItems: 'center', marginTop: 16 }}
                                >
                                    <Text style={{ color: '#6B7280', fontSize: 14 }}>← {translations.common.back !== '←' ? translations.common.back : 'Back'}</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </Animated.View>

                    {/* Step indicator */}
                    <View style={{ flexDirection: 'row', marginTop: 32, gap: 8 }}>
                        {[0, 1].map(i => (
                            <View key={i} style={{
                                width: step === i ? 24 : 8, height: 8, borderRadius: 4,
                                backgroundColor: step === i ? '#34D399' : '#1F2937',
                            }} />
                        ))}
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default WelcomeScreen;
