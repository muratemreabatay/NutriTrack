import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert, Animated } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { hapticMedium, hapticSuccess } from '../utils/haptics';
import { useLanguage } from '../i18n/LanguageContext';

// Google Gemini API Key
const googleAiKey = process.env.EXPO_PUBLIC_GOOGLE_AI_KEY;
if (!googleAiKey) {
    console.warn("EXPO_PUBLIC_GOOGLE_AI_KEY is missing from .env file");
}

const CameraScreen = () => {
    const navigation = useNavigation();
    const { t } = useLanguage();
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const [scanning, setScanning] = useState(false);
    const cameraRef = useRef<CameraView>(null);
    const scanAnim = useRef(new Animated.Value(0)).current;

    const startAIScan = async (uri: string) => {
        setPhotoUri(uri);
        setScanning(true);
        hapticMedium();

        const scanAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(scanAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
                Animated.timing(scanAnim, { toValue: 0, duration: 1200, useNativeDriver: true }),
            ])
        );
        scanAnimation.start();

        if (!googleAiKey) {
            Alert.alert(t.camera.apiMissing, t.camera.apiMissingDesc);
            setScanning(false);
            scanAnimation.stop();
            return;
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);

        try {
            const manipulated = await ImageManipulator.manipulateAsync(
                uri,
                [{ resize: { width: 1024 } }],
                { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
            );
            const base64Image = await FileSystem.readAsStringAsync(manipulated.uri, { encoding: 'base64' });

            const prompt = t.camera.prompt;

            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${googleAiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                signal: controller.signal,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: prompt },
                            { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
                        ],
                    }],
                    generationConfig: { temperature: 0.4, maxOutputTokens: 2048 },
                }),
            });

            clearTimeout(timeout);

            if (!response.ok) {
                const errBody = await response.text();
                console.error('Gemini API Error Response:', response.status, errBody);
                throw new Error(`Gemini API Error: ${response.status}`);
            }

            const data = await response.json();

            const parts = data?.candidates?.[0]?.content?.parts || [];
            const textParts = parts.filter((p: any) => p.text).map((p: any) => p.text);
            const rawText = textParts[textParts.length - 1] || textParts[0] || '';

            console.log('Gemini raw response:', rawText.substring(0, 200));

            let cleanedText = rawText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
            const jsonMatch = cleanedText.match(/\{[\s\S]*"name"[\s\S]*"calories"[\s\S]*\}/);
            if (jsonMatch) cleanedText = jsonMatch[0];

            const prediction = JSON.parse(cleanedText);

            setScanning(false);
            scanAnimation.stop();
            hapticSuccess();

            navigation.navigate('MealDetail', { photoUri: uri, prediction });
        } catch (error: any) {
            clearTimeout(timeout);
            console.error('AI Scan Error:', error);

            const isTimeout = error?.name === 'AbortError';

            Alert.alert(
                isTimeout ? t.camera.timeout : t.camera.aiError,
                isTimeout ? t.camera.timeoutDesc : `${t.camera.aiErrorDesc}\n\n${error?.message || 'Unknown error'}`
            );

            setScanning(false);
            scanAnimation.stop();
        }
    };

    const takePicture = async () => {
        if (!cameraRef.current) return;
        try {
            const photoData = await cameraRef.current.takePictureAsync({ quality: 0.7 });
            if (photoData?.uri) {
                setPhotoUri(photoData.uri);
            } else {
                Alert.alert(t.camera.error, t.camera.photoError);
            }
        } catch (e) {
            console.error('Camera capture error:', e);
            Alert.alert(t.camera.error, t.camera.cameraError);
        }
    };

    const pickFromGallery = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
            if (!result.canceled && result.assets[0]) {
                setPhotoUri(result.assets[0].uri);
            }
        } catch (e) {
            console.error('Gallery picker error:', e);
            Alert.alert(t.camera.error, t.camera.galleryError);
        }
    };

    const retake = () => {
        setPhotoUri(null);
        setScanning(false);
        scanAnim.stopAnimation();
        scanAnim.setValue(0);
    };

    // Photo preview + scanning
    if (photoUri) {
        return (
            <View style={{ flex: 1, backgroundColor: 'black' }}>
                <Image source={{ uri: photoUri }} style={{ flex: 1 }} resizeMode="cover" />

                {scanning && (
                    <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', zIndex: 20 }}>
                        <View style={{ width: 200, height: 200, position: 'relative' }}>
                            <View style={{ position: 'absolute', top: 0, left: 0, width: 40, height: 40, borderTopWidth: 3, borderLeftWidth: 3, borderColor: '#34D399', borderTopLeftRadius: 12 }} />
                            <View style={{ position: 'absolute', top: 0, right: 0, width: 40, height: 40, borderTopWidth: 3, borderRightWidth: 3, borderColor: '#34D399', borderTopRightRadius: 12 }} />
                            <View style={{ position: 'absolute', bottom: 0, left: 0, width: 40, height: 40, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: '#34D399', borderBottomLeftRadius: 12 }} />
                            <View style={{ position: 'absolute', bottom: 0, right: 0, width: 40, height: 40, borderBottomWidth: 3, borderRightWidth: 3, borderColor: '#34D399', borderBottomRightRadius: 12 }} />
                            <Animated.View style={{
                                position: 'absolute', left: 10, right: 10, height: 2, backgroundColor: '#34D399', opacity: 0.8, top: 0,
                                transform: [{ translateY: scanAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 180] }) }],
                            }} />
                        </View>
                        <Text style={{ color: '#34D399', fontSize: 18, fontWeight: 'bold', marginTop: 28 }}>{t.camera.scanning}</Text>
                        <Text style={{ color: '#9CA3AF', fontSize: 13, marginTop: 8 }}>{t.camera.detecting}</Text>
                    </View>
                )}

                {!scanning && (
                    <View style={{ position: 'absolute', bottom: 40, flexDirection: 'row', width: '100%', paddingHorizontal: 24, justifyContent: 'space-between', zIndex: 10 }}>
                        <TouchableOpacity onPress={retake} style={{ backgroundColor: '#1F2937', padding: 16, borderRadius: 9999, flex: 1, marginRight: 8, alignItems: 'center' }}>
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>{t.common.cancel}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => startAIScan(photoUri)} style={{ backgroundColor: '#34D399', padding: 16, borderRadius: 9999, flex: 2, marginLeft: 8, alignItems: 'center', shadowColor: '#34D399', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }}>
                            <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 16 }}>✨ {t.camera.analyze}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    }

    if (!permission) {
        return (
            <View style={{ flex: 1, backgroundColor: '#030712', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#9CA3AF' }}>{t.camera.cameraLoading}</Text>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#030712', padding: 24 }}>
                <Text style={{ fontSize: 48, marginBottom: 16 }}>📸</Text>
                <Text style={{ color: 'white', textAlign: 'center', fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
                    {t.camera.cameraPermission}
                </Text>
                <Text style={{ color: '#9CA3AF', textAlign: 'center', fontSize: 14, marginBottom: 24, lineHeight: 20 }}>
                    {t.camera.cameraPermissionDesc}
                </Text>
                <TouchableOpacity onPress={requestPermission} style={{ backgroundColor: '#34D399', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 16, marginBottom: 12 }}>
                    <Text style={{ fontWeight: 'bold', color: 'black', fontSize: 15 }}>{t.camera.grantAccess}</Text>
                </TouchableOpacity>
                <Text style={{ color: '#4B5563', fontSize: 12, marginBottom: 16 }}>{t.common.or}</Text>
                <TouchableOpacity onPress={pickFromGallery} style={{ backgroundColor: '#1F2937', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 16, borderWidth: 1, borderColor: '#374151' }}>
                    <Text style={{ fontWeight: '600', color: '#D1D5DB', fontSize: 14 }}>{t.camera.pickGallery} 🖼️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 32 }}>
                    <Text style={{ color: '#6B7280', fontSize: 14 }}>{t.camera.goBack}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: 'black' }}>
            <StatusBar hidden />
            <CameraView style={{ flex: 1 }} facing={facing} ref={cameraRef} />

            <SafeAreaView style={{ ...StyleSheet.absoluteFillObject, justifyContent: 'space-between' }} pointerEvents="box-none">
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 40, height: 40, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: 'white', fontSize: 20 }}>✕</Text>
                    </TouchableOpacity>
                    <View style={{ backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
                        <Text style={{ color: '#34D399', fontSize: 12, fontWeight: '600' }}>{t.camera.aiRecognition}</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>

                <View style={{ alignItems: 'center' }}>
                    <View style={{ width: 240, height: 240, borderWidth: 2, borderColor: 'rgba(52, 211, 153, 0.3)', borderRadius: 24, borderStyle: 'dashed' }} />
                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 12, fontWeight: '500' }}>
                        {t.camera.frameFood}
                    </Text>
                </View>

                <View style={{ padding: 24, paddingBottom: 32, backgroundColor: 'rgba(0,0,0,0.4)' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <TouchableOpacity onPress={pickFromGallery} style={{ width: 48, height: 48, backgroundColor: 'rgba(31,41,55,0.8)', borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#374151' }}>
                            <Text style={{ fontSize: 20 }}>🖼️</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={takePicture} style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: 'white', alignItems: 'center', justifyContent: 'center' }}>
                            <View style={{ width: 64, height: 64, backgroundColor: 'white', borderRadius: 32 }} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setFacing(current => (current === 'back' ? 'front' : 'back'))} style={{ width: 48, height: 48, backgroundColor: 'rgba(31,41,55,0.8)', borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#374151' }}>
                            <Text style={{ color: 'white', fontSize: 20 }}>↻</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
};

export default CameraScreen;
