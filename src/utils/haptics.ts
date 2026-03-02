import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Haptic feedback utilities
// Falls back gracefully on web/unsupported platforms

export const hapticLight = () => {
    if (Platform.OS === 'web') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
};

export const hapticMedium = () => {
    if (Platform.OS === 'web') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => { });
};

export const hapticSuccess = () => {
    if (Platform.OS === 'web') return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => { });
};

export const hapticSelection = () => {
    if (Platform.OS === 'web') return;
    Haptics.selectionAsync().catch(() => { });
};
