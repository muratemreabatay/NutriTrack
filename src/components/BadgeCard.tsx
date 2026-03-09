import React from 'react';
import { View, Text } from 'react-native';
import { useLanguage } from '../i18n/LanguageContext';
import type { Badge } from '../context/CalorieContext';

type BadgeCardProps = {
    badge: Badge;
    isEarned: boolean;
};

const BadgeCard = ({ badge, isEarned }: BadgeCardProps) => {
    const { t } = useLanguage();

    // Resolve badge name and description from translations
    const badgeKey = badge.id as keyof typeof t.badges;
    const translated = t.badges[badgeKey];
    const name = (translated && typeof translated === 'object' && 'name' in translated) ? translated.name : badge.name;
    const desc = (translated && typeof translated === 'object' && 'desc' in translated) ? translated.desc : badge.description;

    return (
        <View
            className={`p-3 rounded-2xl border items-center justify-between ${isEarned ? 'bg-gray-900 border-primary/50' : 'bg-gray-900/50 border-gray-800 opacity-50'}`}
            style={{ width: 110, minHeight: 120 }}
        >
            <View className={`w-11 h-11 rounded-full items-center justify-center mb-1.5 ${isEarned ? 'bg-primary/20' : 'bg-gray-800'}`}>
                <Text style={{ fontSize: 20 }}>{isEarned ? badge.icon : '🔒'}</Text>
            </View>
            <Text className="text-white font-bold text-center mb-0.5" style={{ fontSize: 10 }} numberOfLines={1}>
                {name}
            </Text>
            <Text className="text-gray-500 text-center" style={{ fontSize: 9, lineHeight: 12 }} numberOfLines={2}>
                {desc}
            </Text>
        </View>
    );
};

export default BadgeCard;
