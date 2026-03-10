import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { useCalories } from '../context/CalorieContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useNotifications } from '../hooks/useNotifications';
import WelcomeScreen from '../screens/WelcomeScreen';
import SmartOnboardingScreen from '../screens/SmartOnboardingScreen';
import BottomTabNavigator from './BottomTabNavigator';
import CameraScreen from '../screens/CameraScreen';
import MealDetailScreen from '../screens/MealDetailScreen';
import ManualEntryScreen from '../screens/ManualEntryScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
    const { onboardingComplete, isLoading } = useCalories();
    const { isFirstLaunch } = useLanguage();

    // Initialize notification system
    useNotifications();

    if (isLoading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#030712', alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color="#34D399" />
            </View>
        );
    }

    // Determine initial route
    const initialRoute = isFirstLaunch ? 'Welcome' : (onboardingComplete ? 'Main' : 'Onboarding');

    return (
        <Stack.Navigator
            initialRouteName={initialRoute}
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right'
            }}
        >
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Onboarding" component={SmartOnboardingScreen} />
            <Stack.Screen name="Main" component={BottomTabNavigator} />
            <Stack.Screen name="Camera" component={CameraScreen} />
            <Stack.Screen name="MealDetail" component={MealDetailScreen} />
            <Stack.Screen
                name="ManualEntry"
                component={ManualEntryScreen}
                options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
        </Stack.Navigator>
    );
};
