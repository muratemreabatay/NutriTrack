import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

type RulerPickerProps = {
    label: string;
    value: number;
    setValue: (val: number) => void;
    min: number;
    max: number;
    step?: number;
    unit: string;
};

const RulerPicker = ({ label, value, setValue, min, max, step = 1, unit }: RulerPickerProps) => {
    return (
        <View className="mb-6">
            <View className="flex-row justify-between items-end mb-2 px-2">
                <Text className="text-gray-400 font-medium">{label}</Text>
                <Text className="text-white text-2xl font-bold">
                    {value} <Text className="text-primary text-sm font-normal">{unit}</Text>
                </Text>
            </View>

            <View className="h-16 bg-gray-900 rounded-xl flex-row items-center px-4 border border-gray-800 relative overflow-hidden">
                <TouchableOpacity
                    onPress={() => setValue(Math.max(min, Math.round((value - step) * 10) / 10))}
                    className="p-3 bg-gray-800 rounded-lg absolute left-2 z-10"
                >
                    <Text className="text-white font-bold text-lg">-</Text>
                </TouchableOpacity>

                <View className="flex-1 items-center justify-center">
                    <View className="h-8 w-1 bg-primary rounded-full absolute" />
                    <View className="flex-row space-x-2 opacity-30">
                        {Array.from({ length: 15 }).map((_, i) => (
                            <View key={i} className={`w-0.5 bg-gray-500 rounded-full ${i === 7 ? 'h-6 bg-white opacity-100' : 'h-3'}`} />
                        ))}
                    </View>
                </View>

                <TouchableOpacity
                    onPress={() => setValue(Math.min(max, Math.round((value + step) * 10) / 10))}
                    className="p-3 bg-gray-800 rounded-lg absolute right-2 z-10"
                >
                    <Text className="text-white font-bold text-lg">+</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default RulerPicker;
