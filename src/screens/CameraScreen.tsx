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

// Randomized AI predictions for fallback
const FALLBACK_PREDICTIONS = [
    { name: 'Izgara Somon & Salata', calories: 520, protein: 45, carbs: 12, fat: 28 },
    { name: 'Tavuk Döner', calories: 480, protein: 32, carbs: 38, fat: 22 },
    { name: 'Mercimek Çorbası & Ekmek', calories: 280, protein: 14, carbs: 42, fat: 6 },
    { name: 'Lahmacun', calories: 350, protein: 18, carbs: 40, fat: 12 },
    { name: 'Karışık Izgara Tabağı', calories: 650, protein: 55, carbs: 8, fat: 42 },
];

// OpenRouter API Key
const openRouterApiKey = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;
if (!openRouterApiKey) {
    console.warn("EXPO_PUBLIC_OPENROUTER_API_KEY is missing from .env file");
}

const CameraScreen = () => {
    const navigation = useNavigation();
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

        // Scanning animation (store ref for cleanup)
        const scanAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(scanAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
                Animated.timing(scanAnim, { toValue: 0, duration: 1200, useNativeDriver: true }),
            ])
        );
        scanAnimation.start();

        // F12: Guard against missing API key
        if (!openRouterApiKey) {
            const fallback = FALLBACK_PREDICTIONS[Math.floor(Math.random() * FALLBACK_PREDICTIONS.length)];
            Alert.alert('API Anahtarı Eksik', 'OpenRouter API anahtarı .env dosyasında bulunamadı.\n\nDemo sonucu kullanılıyor.');
            setScanning(false);
            scanAnimation.stop();
            hapticSuccess();
            navigation.navigate('MealDetail', { photoUri: uri, prediction: fallback });
            return;
        }

        // F4: AbortController with 30s timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);

        try {
            // F3: Resize and compress image before base64 encoding to reduce memory usage
            const manipulated = await ImageManipulator.manipulateAsync(
                uri,
                [{ resize: { width: 1024 } }],
                { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
            );
            const base64Image = await FileSystem.readAsStringAsync(manipulated.uri, { encoding: 'base64' });

            // Call OpenRouter API with a free vision model using standard fetch
            const prompt = `Sen uzman bir diyetisyensin. Bu fotoğraftaki yemeğin ne olduğunu tahmin et ve besin değerlerini (ortalama bir porsiyon için) döndür.
SADECE JSON FORMATINDA YANIT VER. Markdown kullanma (yani \`\`\`json vs. yazma), sadece geçerli bir JSON objesi döndür.
Eğer fotoğrafta yemek yoksa tahmini bir yemek uydurma, "Belirsiz" gibi bir isim ver ve değerlere 0 yaz.
Beklenen JSON formatı:
{
  "name": "Yemek Adı (Örn: Izgara Tavuk ve Pilav)",
  "calories": 400,
  "protein": 20,
  "carbs": 30,
  "fat": 15
}`;

            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                signal: controller.signal,
                headers: {
                    "Authorization": `Bearer ${openRouterApiKey}`,
                    "HTTP-Referer": "https://nutritrack.app",
                    "X-Title": "NutriTrack",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "google/gemma-3-27b-it:free",
                    messages: [
                        {
                            role: "user",
                            content: [
                                { type: "text", text: prompt },
                                {
                                    type: "image_url",
                                    image_url: {
                                        url: `data:image/jpeg;base64,${base64Image}`
                                    }
                                }
                            ]
                        }
                    ]
                })
            });

            clearTimeout(timeout);

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`OpenRouter API Hatası: ${response.status} - ${errText}`);
            }

            const data = await response.json();
            const text = data?.choices?.[0]?.message?.content || "";

            // Clean markdown formatting if Gemini included it despite instructions
            const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const prediction = JSON.parse(cleanedText);

            setScanning(false);
            scanAnimation.stop();
            hapticSuccess();

            navigation.navigate('MealDetail', {
                photoUri: uri,
                prediction,
            });
        } catch (error: any) {
            clearTimeout(timeout);
            console.error('AI Scan Error:', error);

            const fallback = FALLBACK_PREDICTIONS[Math.floor(Math.random() * FALLBACK_PREDICTIONS.length)];
            const isTimeout = error?.name === 'AbortError';

            Alert.alert(
                isTimeout ? 'Zaman Aşımı' : 'AI Analiz Hatası / Yoğunluk',
                isTimeout
                    ? 'AI servisi 30 saniye içinde yanıt vermedi.\n\nDemo sonucu kullanılıyor.'
                    : 'Ücretsiz AI servisinde anlık yoğunluk (Rate Limit) veya bağlantı hatası oluştu.\n\nDemoyu incelemeniz için simülasyon sonucu kullanılıyor.'
            );

            setScanning(false);
            scanAnimation.stop();
            hapticSuccess();

            navigation.navigate('MealDetail', {
                photoUri: uri,
                prediction: fallback,
            });
        }
    };

    const takePicture = async () => {
        if (!cameraRef.current) return;
        try {
            const photoData = await cameraRef.current.takePictureAsync({
                quality: 0.7,
            });
            if (photoData?.uri) {
                setPhotoUri(photoData.uri); // Sadece önizlemeye al, hemen tarama
            } else {
                Alert.alert('Hata', 'Fotoğraf çekilemedi. Galeriden seçmeyi deneyin.');
            }
        } catch (e) {
            console.error('Camera capture error:', e);
            Alert.alert('Hata', 'Kamera hatası oluştu. Galeriden seçmeyi deneyin.');
        }
    };

    const pickFromGallery = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                quality: 0.7,
            });
            if (!result.canceled && result.assets[0]) {
                setPhotoUri(result.assets[0].uri); // Sadece önizlemeye al
            }
        } catch (e) {
            console.error('Gallery picker error:', e);
            Alert.alert('Hata', 'Galeri açılamadı.');
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

                {/* Scanning Overlay */}
                {scanning && (
                    <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', zIndex: 20 }}>
                        {/* Scanning frame */}
                        <View style={{ width: 200, height: 200, position: 'relative' }}>
                            <View style={{ position: 'absolute', top: 0, left: 0, width: 40, height: 40, borderTopWidth: 3, borderLeftWidth: 3, borderColor: '#34D399', borderTopLeftRadius: 12 }} />
                            <View style={{ position: 'absolute', top: 0, right: 0, width: 40, height: 40, borderTopWidth: 3, borderRightWidth: 3, borderColor: '#34D399', borderTopRightRadius: 12 }} />
                            <View style={{ position: 'absolute', bottom: 0, left: 0, width: 40, height: 40, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: '#34D399', borderBottomLeftRadius: 12 }} />
                            <View style={{ position: 'absolute', bottom: 0, right: 0, width: 40, height: 40, borderBottomWidth: 3, borderRightWidth: 3, borderColor: '#34D399', borderBottomRightRadius: 12 }} />

                            {/* Scan line */}
                            <Animated.View
                                style={{
                                    position: 'absolute',
                                    left: 10,
                                    right: 10,
                                    height: 2,
                                    backgroundColor: '#34D399',
                                    opacity: 0.8,
                                    top: 0,
                                    transform: [{ translateY: scanAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 180] }) }],
                                }}
                            />
                        </View>
                        <Text style={{ color: '#34D399', fontSize: 18, fontWeight: 'bold', marginTop: 28 }}>AI Analiz Ediyor...</Text>
                        <Text style={{ color: '#9CA3AF', fontSize: 13, marginTop: 8 }}>Yemek ve porsiyon tespit ediliyor</Text>
                    </View>
                )}

                {/* Action Buttons (Only show if not scanning) */}
                {!scanning && (
                    <View style={{ position: 'absolute', bottom: 40, flexDirection: 'row', width: '100%', paddingHorizontal: 24, justifyContent: 'space-between', zIndex: 10 }}>
                        <TouchableOpacity onPress={retake} style={{ backgroundColor: '#1F2937', padding: 16, borderRadius: 9999, flex: 1, marginRight: 8, alignItems: 'center' }}>
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>İptal</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => startAIScan(photoUri)} style={{ backgroundColor: '#34D399', padding: 16, borderRadius: 9999, flex: 2, marginLeft: 8, alignItems: 'center', shadowColor: '#34D399', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }}>
                            <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 16 }}>✨ Analiz Et</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    }

    // Camera permission handling
    if (!permission) {
        return (
            <View style={{ flex: 1, backgroundColor: '#030712', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#9CA3AF' }}>Kamera yükleniyor...</Text>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#030712', padding: 24 }}>
                <Text style={{ fontSize: 48, marginBottom: 16 }}>📸</Text>
                <Text style={{ color: 'white', textAlign: 'center', fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
                    Kamera İzni Gerekli
                </Text>
                <Text style={{ color: '#9CA3AF', textAlign: 'center', fontSize: 14, marginBottom: 24, lineHeight: 20 }}>
                    Yediğin yemeği AI ile tanımak için kamerana ihtiyacımız var.
                </Text>
                <TouchableOpacity
                    onPress={requestPermission}
                    style={{ backgroundColor: '#34D399', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 16, marginBottom: 12 }}
                >
                    <Text style={{ fontWeight: 'bold', color: 'black', fontSize: 15 }}>Kamera İzni Ver</Text>
                </TouchableOpacity>
                <Text style={{ color: '#4B5563', fontSize: 12, marginBottom: 16 }}>veya</Text>
                <TouchableOpacity
                    onPress={pickFromGallery}
                    style={{ backgroundColor: '#1F2937', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 16, borderWidth: 1, borderColor: '#374151' }}
                >
                    <Text style={{ fontWeight: '600', color: '#D1D5DB', fontSize: 14 }}>Galeriden Seç 🖼️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 32 }}>
                    <Text style={{ color: '#6B7280', fontSize: 14 }}>Geri Dön</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Camera view
    return (
        <View style={{ flex: 1, backgroundColor: 'black' }}>
            <StatusBar hidden />
            <CameraView style={{ flex: 1 }} facing={facing} ref={cameraRef} />

            {/* OVERLAY UI */}
            <SafeAreaView style={{ ...StyleSheet.absoluteFillObject, justifyContent: 'space-between' }} pointerEvents="box-none">
                {/* Top Bar */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 }}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={{ width: 40, height: 40, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
                    >
                        <Text style={{ color: 'white', fontSize: 20 }}>✕</Text>
                    </TouchableOpacity>
                    <View style={{ backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
                        <Text style={{ color: '#34D399', fontSize: 12, fontWeight: '600' }}>AI Yemek Tanıma</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>

                {/* Center Guide */}
                <View style={{ alignItems: 'center' }}>
                    <View style={{ width: 240, height: 240, borderWidth: 2, borderColor: 'rgba(52, 211, 153, 0.3)', borderRadius: 24, borderStyle: 'dashed' }} />
                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 12, fontWeight: '500' }}>
                        Yemeği çerçeveye al
                    </Text>
                </View>

                {/* Bottom Controls */}
                <View style={{ padding: 24, paddingBottom: 32, backgroundColor: 'rgba(0,0,0,0.4)' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        {/* Gallery */}
                        <TouchableOpacity
                            onPress={pickFromGallery}
                            style={{ width: 48, height: 48, backgroundColor: 'rgba(31,41,55,0.8)', borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#374151' }}
                        >
                            <Text style={{ fontSize: 20 }}>🖼️</Text>
                        </TouchableOpacity>

                        {/* Shutter Button */}
                        <TouchableOpacity
                            onPress={takePicture}
                            style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: 'white', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <View style={{ width: 64, height: 64, backgroundColor: 'white', borderRadius: 32 }} />
                        </TouchableOpacity>

                        {/* Flip Camera */}
                        <TouchableOpacity
                            onPress={() => setFacing(current => (current === 'back' ? 'front' : 'back'))}
                            style={{ width: 48, height: 48, backgroundColor: 'rgba(31,41,55,0.8)', borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#374151' }}
                        >
                            <Text style={{ color: 'white', fontSize: 20 }}>↻</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
};

export default CameraScreen;
