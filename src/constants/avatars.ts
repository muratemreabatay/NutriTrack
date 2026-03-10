export const AVATARS = {
    male: [
        { id: 'm1', source: require('../../assets/avatars/avatar_male_1_fixed_1772744133992.png') },
        { id: 'm2', source: require('../../assets/avatars/avatar_male_2_1772743733657.png') },
        { id: 'm3', source: require('../../assets/avatars/avatar_male_3_1772743746644.png') },
        { id: 'm4', source: require('../../assets/avatars/avatar_male4_v3_1772805381267.png') },
        { id: 'm5', source: require('../../assets/avatars/avatar_male5_v4_1772806037354.png') },
    ],
    female: [
        { id: 'f1', source: require('../../assets/avatars/avatar_female_1_1772743803079.png') },
        { id: 'f2', source: require('../../assets/avatars/avatar_female_2_v2_1772804738208.png') },
        { id: 'f3', source: require('../../assets/avatars/avatar_female_3_1772743830079.png') },
        { id: 'f4', source: require('../../assets/avatars/avatar_female_4_v2_1772804789689.png') },
        { id: 'f5', source: require('../../assets/avatars/avatar_female5_v3_1772805410142.png') },
    ],
    unisex: [
        { id: 'u1', source: require('../../assets/avatars/avatar_fun1_v3_1772805424335.png') },
        { id: 'u2', source: require('../../assets/avatars/avatar_fun2_v2_1772805683784.png') },
        { id: 'u3', source: require('../../assets/avatars/avatar_fun_3_1772744224759.png') },
        { id: 'u4', source: require('../../assets/avatars/avatar_fun_4_1772744239440.png') },
        { id: 'u5', source: require('../../assets/avatars/avatar_fun_5_1772805019931.png') },
    ]
};

// Pre-computed caches (avoid repeated array spreads)
const AVATARS_BY_GENDER: Record<'male' | 'female', typeof AVATARS.male> = {
    male: [...AVATARS.male, ...AVATARS.unisex],
    female: [...AVATARS.female, ...AVATARS.unisex],
};
const ALL_AVATARS = [...AVATARS.male, ...AVATARS.female, ...AVATARS.unisex];
const AVATAR_MAP = new Map(ALL_AVATARS.map(a => [a.id, a.source]));

export const getAvatarsForGender = (gender: 'male' | 'female') => AVATARS_BY_GENDER[gender];
export const getAllAvatars = () => ALL_AVATARS;
export const getAvatarSource = (id: string) => AVATAR_MAP.get(id);
