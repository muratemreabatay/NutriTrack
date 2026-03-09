import React from 'react';
import { View, Text } from 'react-native';
import { useLanguage } from '../i18n/LanguageContext';
import AnimatedFlame from './AnimatedFlame';

type StreakBadgeProps = {
    streak: number;
};

const StreakBadge = ({ streak }: StreakBadgeProps) => {
    const { t } = useLanguage();

    const getStreakConfig = (s: number) => {
        if (s >= 30) return { color: '#A855F7', label: t.streak.legendary };
        if (s >= 14) return { color: '#F59E0B', label: t.streak.super };
        if (s >= 7) return { color: '#EF4444', label: t.streak.hot };
        if (s >= 3) return { color: '#F97316', label: t.streak.good };
        return { color: '#6B7280', label: '' };
    };

    const config = getStreakConfig(streak);

    if (streak === 0) return null;

    return (
        <View className="flex-row items-center rounded-full overflow-visible" style={{ position: 'relative' }}>
            <View
                className="flex-row items-center px-3 py-2 rounded-full border"
                style={{
                    backgroundColor: config.color + '15',
                    borderColor: config.color + '40',
                }}
            >
                <AnimatedFlame streak={streak} overrideSize={18} />
                <Text style={{ color: config.color, fontWeight: 'bold', marginLeft: 6, fontSize: 14 }}>
                    {streak}
                </Text>
                {config.label ? (
                    <View
                        className="ml-1 px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: config.color + '25' }}
                    >
                        <Text style={{ color: config.color, fontSize: 9, fontWeight: '800' }}>{config.label}</Text>
                    </View>
                ) : null}
            </View>
        </View>
    );
};

export default StreakBadge;
