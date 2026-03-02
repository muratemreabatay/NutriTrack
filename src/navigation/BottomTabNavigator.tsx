import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Svg, { Path, Rect, Defs, LinearGradient, Stop, Circle, Line } from 'react-native-svg';
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

// ─── SVG Tab Icons ─────────────────────────────────────────

// Dashboard / Günlük — bar chart icon
const DashboardIcon = ({ focused }: { focused: boolean }) => {
    const color = focused ? '#34D399' : 'rgba(255,255,255,0.4)';
    return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Rect x={3} y={12} width={4} height={9} rx={1.5} fill={color} opacity={focused ? 0.6 : 0.5} />
            <Rect x={10} y={6} width={4} height={15} rx={1.5} fill={color} opacity={focused ? 0.85 : 0.5} />
            <Rect x={17} y={3} width={4} height={18} rx={1.5} fill={color} />
        </Svg>
    );
};

// Water / Su — glass icon
const WaterIcon = ({ focused }: { focused: boolean }) => {
    const strokeColor = focused ? '#38BDF8' : 'rgba(255,255,255,0.4)';
    const fillColor = focused ? 'rgba(56,189,248,0.25)' : 'transparent';
    return (
        <Svg width={22} height={24} viewBox="0 0 100 120" fill="none">
            <Defs>
                <LinearGradient id="navWater" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor="#60CFFF" stopOpacity="0.85" />
                    <Stop offset="1" stopColor="#1E6CB8" stopOpacity="0.9" />
                </LinearGradient>
            </Defs>
            <Path
                d="M 15 8 L 22 105 Q 50 113 78 105 L 85 8"
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={5}
                strokeLinejoin="round"
            />
            {focused && (
                <Path
                    d="M 24 55 L 26 101 Q 50 109 74 101 L 76 55 Z"
                    fill="url(#navWater)"
                />
            )}
            <Path
                d="M 12 8 L 88 8"
                stroke={strokeColor}
                strokeWidth={5}
                strokeLinecap="round"
            />
        </Svg>
    );
};

// Calendar / Takvim — calendar icon
const CalendarIcon = ({ focused }: { focused: boolean }) => {
    const color = focused ? '#34D399' : 'rgba(255,255,255,0.4)';
    return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            {/* Calendar body */}
            <Rect x={3} y={5} width={18} height={16} rx={3} stroke={color} strokeWidth={1.8} fill={focused ? 'rgba(52,211,153,0.08)' : 'none'} />
            {/* Top line */}
            <Line x1={3} y1={10} x2={21} y2={10} stroke={color} strokeWidth={1.5} />
            {/* Hooks */}
            <Line x1={8} y1={3} x2={8} y2={7} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
            <Line x1={16} y1={3} x2={16} y2={7} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
            {/* Dots for days */}
            <Circle cx={8} cy={14} r={1.2} fill={color} />
            <Circle cx={12} cy={14} r={1.2} fill={color} />
            <Circle cx={16} cy={14} r={1.2} fill={color} />
            <Circle cx={8} cy={18} r={1.2} fill={color} />
            <Circle cx={12} cy={18} r={1.2} fill={color} />
        </Svg>
    );
};

// Profile / Profil — person icon
const ProfileIcon = ({ focused }: { focused: boolean }) => {
    const color = focused ? '#34D399' : 'rgba(255,255,255,0.4)';
    return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            {/* Head */}
            <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={1.8} fill={focused ? 'rgba(52,211,153,0.12)' : 'none'} />
            {/* Body */}
            <Path
                d="M4 20C4 16.5 7.5 14 12 14C16.5 14 20 16.5 20 20"
                stroke={color}
                strokeWidth={1.8}
                strokeLinecap="round"
                fill={focused ? 'rgba(52,211,153,0.08)' : 'none'}
            />
        </Svg>
    );
};

// ─── Tab label component ─────────────────────────────────────
const TabLabel = ({ label, focused }: { label: string; focused: boolean }) => (
    <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        style={{
            fontSize: 10,
            marginTop: 4,
            fontWeight: '600',
            textAlign: 'center',
            color: focused ? '#34D399' : '#6B7280',
        }}
    >
        {label}
    </Text>
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
                    tabBarIcon: ({ focused }) => (
                        <View className="items-center justify-center pt-2 w-16">
                            <DashboardIcon focused={focused} />
                            <TabLabel label="Günlük" focused={focused} />
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="Su"
                component={WaterTrackerScreen}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <View className="items-center justify-center pt-2 w-16">
                            <WaterIcon focused={focused} />
                            <TabLabel label="Su" focused={focused} />
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="Takvim"
                component={CalendarScreen}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <View className="items-center justify-center pt-2 w-16">
                            <CalendarIcon focused={focused} />
                            <TabLabel label="Takvim" focused={focused} />
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="Profil"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <View className="items-center justify-center pt-2 w-16">
                            <ProfileIcon focused={focused} />
                            <TabLabel label="Profil" focused={focused} />
                        </View>
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

export default BottomTabNavigator;
