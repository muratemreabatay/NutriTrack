/**
 * Shared badge name/description resolution via i18n translations.
 * Eliminates duplication across DashboardScreen and ProfileScreen.
 */

export const resolveBadgeName = (badge: { id: string; name: string }, badges: Record<string, any>): string => {
    const tr = badges[badge.id];
    if (tr && typeof tr === 'object' && 'name' in tr) return tr.name;
    return badge.name;
};

export const resolveBadgeDesc = (badge: { id: string; description: string }, badges: Record<string, any>): string => {
    const tr = badges[badge.id];
    if (tr && typeof tr === 'object' && 'desc' in tr) return tr.desc;
    return badge.description;
};
