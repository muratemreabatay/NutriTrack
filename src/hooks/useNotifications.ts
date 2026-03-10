import { useEffect, useRef } from 'react';
import { useCalories } from '../context/CalorieContext';
import { useLanguage } from '../i18n/LanguageContext';
import {
    requestNotificationPermission,
    scheduleAllNotifications,
    checkGoalProximity,
} from '../utils/notifications';

/**
 * Hook that manages notification scheduling.
 * Place this inside a component that has access to both CalorieContext and LanguageContext.
 */
export function useNotifications() {
    const { consumed, targets, waterGlasses, waterTarget, streak, mealHistory, isLoading } = useCalories();
    const { lang } = useLanguage();
    const permissionRequested = useRef(false);

    // Request permission once on mount
    useEffect(() => {
        if (!permissionRequested.current) {
            permissionRequested.current = true;
            requestNotificationPermission();
        }
    }, []);

    // Reschedule notifications when relevant state changes
    useEffect(() => {
        if (isLoading) return; // Don't schedule until data is loaded

        scheduleAllNotifications({
            lang: lang as 'tr' | 'en',
            waterGlasses,
            waterTarget,
            streak,
            hasMealsToday: mealHistory.length > 0,
            consumedCalories: consumed.calories,
            targetCalories: targets.calories,
        });
    }, [isLoading, lang, waterGlasses, waterTarget, streak, mealHistory.length]);

    // Check goal proximity on calorie changes (dynamic notification #8)
    useEffect(() => {
        if (isLoading) return;
        if (consumed.calories > 0 && targets.calories > 0) {
            checkGoalProximity(consumed.calories, targets.calories, lang as 'tr' | 'en');
        }
    }, [consumed.calories, targets.calories, isLoading, lang]);
}
