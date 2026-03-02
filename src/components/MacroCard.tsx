import React from 'react';
import { View, Text } from 'react-native';

type MacroCardProps = {
    label: string;
    consumed: number;
    target: number;
    color: string; // tailwind color class e.g. 'bg-blue-500'
};

const MacroCard = ({ label, consumed, target, color }: MacroCardProps) => {
    const percentage = target > 0 ? Math.min((consumed / target) * 100, 100) : 0;

    return (
        <View className="bg-gray-900/80 p-3 rounded-2xl flex-1 border border-gray-800">
            <Text className="text-gray-400 text-xs mb-1">{label}</Text>
            <Text className="text-white font-bold text-base">
                {consumed}g <Text className="text-gray-600 text-xs">/ {target}g</Text>
            </Text>
            <View className="h-1 bg-gray-700 mt-2 rounded-full overflow-hidden">
                <View style={{ width: `${percentage}%`, backgroundColor: color }} className="h-full rounded-full" />
            </View>
        </View>
    );
};

export default MacroCard;
