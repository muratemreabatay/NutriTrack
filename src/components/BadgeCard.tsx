import React from 'react';
import { View, Text } from 'react-native';
import type { Badge } from '../context/CalorieContext';

type BadgeCardProps = {
    badge: Badge;
    isEarned: boolean;
};

const BadgeCard = ({ badge, isEarned }: BadgeCardProps) => {
    return (
        <View className={`w-28 h-32 p-3 rounded-2xl border items-center justify-center ${isEarned ? 'bg-gray-900 border-primary/50' : 'bg-gray-900/50 border-gray-800 opacity-50'}`}>
            <View className={`w-12 h-12 rounded-full items-center justify-center mb-2 ${isEarned ? 'bg-primary/20' : 'bg-gray-800'}`}>
                <Text className="text-2xl">{isEarned ? badge.icon : '🔒'}</Text>
            </View>
            <Text className="text-white font-bold text-xs text-center mb-1">{badge.name}</Text>
            <Text className="text-gray-500 text-[10px] text-center leading-3">{badge.description}</Text>
        </View>
    );
};

export default BadgeCard;
