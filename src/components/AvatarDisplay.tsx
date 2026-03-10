import React from 'react';
import { Text, Image } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { getAvatarSource } from '../constants/avatars';

type AvatarDisplayProps = {
    avatar?: string;
    name?: string;
    size: 'sm' | 'lg';
};

const SIZES = {
    sm: { fontSize: 18, fontWeight: '800' as const, svgSize: 20 },
    lg: { fontSize: 32, fontWeight: '800' as const, svgSize: 36 },
};

const AvatarDisplay = ({ avatar, name, size }: AvatarDisplayProps) => {
    const s = SIZES[size];

    if (avatar) {
        const predefinedSource = getAvatarSource(avatar);
        const source = predefinedSource ? predefinedSource : { uri: avatar };
        return <Image source={source} className="w-full h-full rounded-full" resizeMode="cover" />;
    }
    if (name) {
        return <Text style={{ fontSize: s.fontSize, fontWeight: s.fontWeight, color: '#34D399' }}>{name.charAt(0).toUpperCase()}</Text>;
    }
    return (
        <Svg width={s.svgSize} height={s.svgSize} viewBox="0 0 24 24" fill="none">
            <Circle cx={12} cy={8} r={4} stroke="#34D399" strokeWidth={2} />
            <Path d="M4 21c0-3.87 3.13-7 7-7h2c3.87 0 7 3.13 7 7" stroke="#34D399" strokeWidth={2} strokeLinecap="round" />
        </Svg>
    );
};

export default AvatarDisplay;
