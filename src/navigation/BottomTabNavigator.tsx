import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/DashboardScreen';
import WaterTrackerScreen from '../screens/WaterTrackerScreen';
import CalendarScreen from '../screens/CalendarScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type BottomTabParamList = {
    Günlük: undefined;
    Su: undefined;
    Takvim: undefined;
    Profil: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

const TabIcon = ({ label, icon, focused }: { label: string; icon: string; focused: boolean }) => (
    <View className="items-center justify-center pt-2 w-16">
        <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{icon}</Text>
        <Text numberOfLines={1} adjustsFontSizeToFit className={`text-[10px] mt-1 font-medium text-center ${focused ? 'text-primary' : 'text-gray-500'}`}>{label}</Text>
    </View>
);

const BottomTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#111827',
                    borderTopColor: '#1F2937',
                    borderTopWidth: 1,
                    height: 70,
                    paddingBottom: 8,
                    paddingTop: 4,
                },
                tabBarShowLabel: false,
            }}
        >
            <Tab.Screen
                name="Günlük"
                component={DashboardScreen}
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon icon="📊" label="Günlük" focused={focused} />,
                }}
            />
            <Tab.Screen
                name="Su"
                component={WaterTrackerScreen}
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon icon="💧" label="Su" focused={focused} />,
                }}
            />
            <Tab.Screen
                name="Takvim"
                component={CalendarScreen}
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon icon="📅" label="Takvim" focused={focused} />,
                }}
            />
            <Tab.Screen
                name="Profil"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon icon="👤" label="Profil" focused={focused} />,
                }}
            />
        </Tab.Navigator>
    );
};

export default BottomTabNavigator;
