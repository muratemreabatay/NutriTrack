import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Nutrients = {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
};

// Badge Types
export type Badge = {
    id: string;
    name: string;
    description: string;
    icon: string;
    condition: (context: any) => boolean;
};

export const BADGES: Badge[] = [
    // First steps
    { id: 'first_meal', name: 'First Step', description: 'You logged your first meal!', icon: '🥑', condition: (ctx) => ctx.consumed.calories > 0 },
    // Streak badges
    { id: 'streak_3', name: 'Consistent', description: '3 days in a row', icon: '🔥', condition: (ctx) => ctx.streak >= 3 },
    { id: 'streak_7', name: 'Week Warrior', description: '7-day streak!', icon: '⚔️', condition: (ctx) => ctx.streak >= 7 },
    { id: 'streak_14', name: 'Habit Master', description: '14 days non-stop tracking', icon: '🛡️', condition: (ctx) => ctx.streak >= 14 },
    { id: 'streak_30', name: 'Iron Will', description: '30 days every single day!', icon: '💎', condition: (ctx) => ctx.streak >= 30 },
    { id: 'streak_60', name: 'Gold Streak', description: '60 days non-stop! Legendary', icon: '👑', condition: (ctx) => ctx.streak >= 60 },
    { id: 'streak_90', name: 'Platinum Streak', description: '90-day streak — true champion!', icon: '🏆', condition: (ctx) => ctx.streak >= 90 },
    // Macro goals
    { id: 'protein_master', name: 'Protein Chef', description: 'Complete your daily protein goal', icon: '🥩', condition: (ctx) => ctx.consumed.protein >= ctx.targets.protein && ctx.targets.protein > 0 },
    { id: 'carb_loader', name: 'Energy Depot', description: 'Hit your carb target', icon: '🍞', condition: (ctx) => ctx.consumed.carbs >= ctx.targets.carbs && ctx.targets.carbs > 0 },
    { id: 'fat_balance', name: 'Fat Balance', description: 'Reach your fat goal', icon: '🥜', condition: (ctx) => ctx.consumed.fat >= ctx.targets.fat && ctx.targets.fat > 0 },
    { id: 'macro_perfect', name: 'Perfect Balance', description: 'Complete all macro goals in one day', icon: '⚖️', condition: (ctx) => ctx.consumed.protein >= ctx.targets.protein && ctx.consumed.carbs >= ctx.targets.carbs && ctx.consumed.fat >= ctx.targets.fat && ctx.targets.protein > 0 },
    // Calorie goals
    { id: 'cal_500', name: 'Getting Started', description: 'Log 500+ kcal in a day', icon: '📝', condition: (ctx) => ctx.consumed.calories >= 500 },
    { id: 'cal_1000', name: 'Mindful Eating', description: 'Log 1000+ kcal in a day', icon: '📊', condition: (ctx) => ctx.consumed.calories >= 1000 },
    { id: 'cal_1500', name: 'Tracking Pro', description: 'Track 1500+ kcal in a day', icon: '🏅', condition: (ctx) => ctx.consumed.calories >= 1500 },
    { id: 'cal_2000', name: 'Full Throttle', description: 'Log 2000+ kcal in a day', icon: '🚀', condition: (ctx) => ctx.consumed.calories >= 2000 },
    { id: 'goal_reached', name: 'Goal Reached!', description: 'Complete your daily calorie goal', icon: '🎯', condition: (ctx) => ctx.consumed.calories >= ctx.targets.calories && ctx.targets.calories > 0 },
    // Special
    { id: 'early_bird', name: 'Early Bird', description: 'Add a meal before 8 AM', icon: '🌅', condition: (ctx) => { const h = new Date().getHours(); return h < 8 && ctx.consumed.calories > 0; } },
    { id: 'night_owl', name: 'Night Owl', description: 'Log food after 10 PM', icon: '🦉', condition: (ctx) => { const h = new Date().getHours(); return h >= 22 && ctx.consumed.calories > 0; } },
    // Extra badges
    { id: 'water_champ', name: 'Water Champion', description: 'Drink 8 glasses of water a day', icon: '💧', condition: (ctx) => ctx.waterGlasses >= 8 },
    { id: 'meal_logger_5', name: 'Log Enthusiast', description: 'Log 5 meals in one day', icon: '📋', condition: (ctx) => ctx.mealCount >= 5 },
    { id: 'variety_king', name: 'Variety King', description: 'Use all 4 meal categories', icon: '🌈', condition: (ctx) => ctx.categoryCount >= 4 },
    { id: 'weekend_warrior', name: 'Weekend Warrior', description: 'Track on weekends too', icon: '🗓️', condition: (ctx) => { const d = new Date().getDay(); return (d === 0 || d === 6) && ctx.consumed.calories > 0; } },
    { id: 'breakfast_lover', name: 'Breakfast Lover', description: 'Add a meal before 10 AM', icon: '🥞', condition: (ctx) => { const h = new Date().getHours(); return h < 10 && ctx.consumed.calories > 0; } },
    { id: 'light_eater', name: 'Light Meal', description: 'Log a meal under 300 kcal', icon: '🥗', condition: (ctx) => ctx.hasLightMeal },
];

type UserProfile = {
    name?: string;
    weight: string;
    height: string;
    age: string;
    gender: 'male' | 'female';
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'extra';
    goal?: 'lose' | 'maintain' | 'gain';
    targetWeight?: string;
    bodyType?: 'ectomorph' | 'mesomorph' | 'endomorph' | 'unsure';
    avatar?: string;
};

export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type MealEntry = {
    id: string;
    name: string;
    nutrients: Nutrients;
    timestamp: string;
    category?: MealCategory;
};

export type DailyRecord = {
    date: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    waterGlasses: number;
};

export type FavoriteFood = {
    name: string;
    icon: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
};

// F2: Date-indexed meals type
export type MealsByDate = Record<string, MealEntry[]>;

type CalorieContextType = {
    consumed: Nutrients;
    targets: Nutrients;
    userProfile: UserProfile;
    streak: number;
    earnedBadges: string[];
    mealHistory: MealEntry[];
    badgeQueue: Badge[];
    onboardingComplete: boolean;
    isLoading: boolean;
    waterGlasses: number;
    waterTarget: number;
    dailyHistory: DailyRecord[];
    favorites: FavoriteFood[];
    updateProfile: (profile: UserProfile) => void;
    addMeal: (meal: Nutrients, name?: string, category?: MealCategory) => void;
    removeMeal: (id: string) => void;
    clearNewBadge: () => void;
    addWater: () => void;
    removeWater: () => void;
    toggleFavorite: (food: FavoriteFood) => void;
    isFavorite: (name: string) => boolean;
    allMeals: MealsByDate;
    addMealForDate: (meal: Nutrients, name: string, date: string, category?: MealCategory) => void;
    getMealsForDate: (date: string) => MealEntry[];
};

// F2: Helper — extract local date key from an ISO timestamp
const getDateKey = (isoTimestamp: string): string => {
    const d = new Date(isoTimestamp);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// F2: Helper — convert flat array to date-indexed record
const indexMealsByDate = (meals: MealEntry[]): MealsByDate => {
    const result: MealsByDate = {};
    meals.forEach(m => {
        const key = getDateKey(m.timestamp);
        if (!result[key]) result[key] = [];
        result[key].push(m);
    });
    return result;
};

// F2: Helper — prune entries older than N days
const pruneMealsByDate = (meals: MealsByDate, maxDays: number): MealsByDate => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - maxDays);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    const result: MealsByDate = {};
    Object.entries(meals).forEach(([date, entries]) => {
        if (date >= cutoffStr) result[date] = entries;
    });
    return result;
};

const defaultTargets = {
    calories: 2200,
    protein: 150,
    carbs: 250,
    fat: 70,
};

const defaultProfile: UserProfile = {
    name: '',
    weight: '70',
    height: '175',
    age: '25',
    gender: 'male',
    activityLevel: 'moderate',
    goal: 'maintain',
    targetWeight: '70',
    avatar: undefined,
};

const STORAGE_KEYS = {
    CONSUMED: '@calorie_consumed',
    TARGETS: '@calorie_targets',
    PROFILE: '@calorie_profile',
    STREAK: '@calorie_streak',
    LAST_LOG_DATE: '@calorie_last_log',
    BADGES: '@calorie_badges',
    CONSUMED_DATE: '@calorie_consumed_date',
    MEAL_HISTORY: '@calorie_meal_history',
    ONBOARDING: '@calorie_onboarding_complete',
    WATER: '@calorie_water',
    DAILY_HISTORY: '@calorie_daily_history',
    FAVORITES: '@calorie_favorites',
    ALL_MEALS: '@calorie_all_meals',
};

const CalorieContext = createContext<CalorieContextType>({
    consumed: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    targets: defaultTargets,
    userProfile: defaultProfile,
    streak: 0,
    earnedBadges: [],
    mealHistory: [],
    badgeQueue: [],
    onboardingComplete: false,
    isLoading: true,
    waterGlasses: 0,
    waterTarget: 8,
    dailyHistory: [],
    favorites: [],
    updateProfile: () => { },
    addMeal: () => { },
    removeMeal: () => { },
    clearNewBadge: () => { },
    addWater: () => { },
    removeWater: () => { },
    toggleFavorite: () => { },
    isFavorite: () => false,
    allMeals: {},
    addMealForDate: () => { },
    getMealsForDate: () => [],
});

export const CalorieProvider = ({ children }: { children: React.ReactNode }) => {
    const [consumed, setConsumed] = useState<Nutrients>({
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
    });

    const [userProfile, setUserProfile] = useState<UserProfile>(defaultProfile);
    const [targets, setTargets] = useState<Nutrients>(defaultTargets);
    const [streak, setStreak] = useState(0);
    const [lastLogDate, setLastLogDate] = useState<string | null>(null);
    const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
    const [mealHistory, setMealHistory] = useState<MealEntry[]>([]);
    const [badgeQueue, setBadgeQueue] = useState<Badge[]>([]);
    const [onboardingComplete, setOnboardingComplete] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [waterGlasses, setWaterGlasses] = useState(0);
    const waterTarget = 8;
    const [dailyHistory, setDailyHistory] = useState<DailyRecord[]>([]);
    const [favorites, setFavorites] = useState<FavoriteFood[]>([]);
    const [allMeals, setAllMeals] = useState<MealsByDate>({});

    // Load persisted data on mount
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const keys = Object.values(STORAGE_KEYS);
            const results = await AsyncStorage.multiGet(keys);
            const dataMap: Record<string, string | null> = {};
            results.forEach(([key, value]) => { dataMap[key] = value; });

            // Check if consumed data is from today, otherwise reset
            const today = new Date().toISOString().split('T')[0];
            const consumedDate = dataMap[STORAGE_KEYS.CONSUMED_DATE];

            if (dataMap[STORAGE_KEYS.PROFILE]) {
                const profile = JSON.parse(dataMap[STORAGE_KEYS.PROFILE]!);
                setUserProfile(profile);
            }

            if (dataMap[STORAGE_KEYS.TARGETS]) {
                setTargets(JSON.parse(dataMap[STORAGE_KEYS.TARGETS]!));
            }

            if (dataMap[STORAGE_KEYS.CONSUMED] && consumedDate === today) {
                setConsumed(JSON.parse(dataMap[STORAGE_KEYS.CONSUMED]!));
            } else if (dataMap[STORAGE_KEYS.CONSUMED] && consumedDate && consumedDate !== today) {
                // Archive yesterday's data before reset
                const oldConsumed = JSON.parse(dataMap[STORAGE_KEYS.CONSUMED]!);
                const oldWater = dataMap[STORAGE_KEYS.WATER] ? JSON.parse(dataMap[STORAGE_KEYS.WATER]!) : 0;
                const history: DailyRecord[] = dataMap[STORAGE_KEYS.DAILY_HISTORY]
                    ? JSON.parse(dataMap[STORAGE_KEYS.DAILY_HISTORY]!) : [];
                history.push({
                    date: consumedDate,
                    calories: oldConsumed.calories,
                    protein: oldConsumed.protein,
                    carbs: oldConsumed.carbs,
                    fat: oldConsumed.fat,
                    waterGlasses: oldWater,
                });
                // Keep only last 30 days
                const trimmed = history.slice(-30);
                setDailyHistory(trimmed);
                await AsyncStorage.setItem(STORAGE_KEYS.DAILY_HISTORY, JSON.stringify(trimmed));
            }
            // If consumed date is not today, consumed stays at {0,0,0,0} (daily reset)

            if (dataMap[STORAGE_KEYS.STREAK]) {
                setStreak(JSON.parse(dataMap[STORAGE_KEYS.STREAK]!));
            }

            if (dataMap[STORAGE_KEYS.LAST_LOG_DATE]) {
                setLastLogDate(dataMap[STORAGE_KEYS.LAST_LOG_DATE]!);
            }

            if (dataMap[STORAGE_KEYS.BADGES]) {
                setEarnedBadges(JSON.parse(dataMap[STORAGE_KEYS.BADGES]!));
            }

            if (dataMap[STORAGE_KEYS.MEAL_HISTORY] && consumedDate === today) {
                setMealHistory(JSON.parse(dataMap[STORAGE_KEYS.MEAL_HISTORY]!));
            }

            // F2: Load allMeals — migrate from flat array to date-indexed, prune to 90 days
            let rawAllMeals: any = dataMap[STORAGE_KEYS.ALL_MEALS]
                ? JSON.parse(dataMap[STORAGE_KEYS.ALL_MEALS]!) : {};
            // Backward compat: migrate flat array → date-indexed
            let loadedAllMeals: MealsByDate = Array.isArray(rawAllMeals)
                ? indexMealsByDate(rawAllMeals)
                : rawAllMeals;

            // Merge current mealHistory into allMeals (for backward compatibility)
            if (dataMap[STORAGE_KEYS.MEAL_HISTORY]) {
                const historyMeals: MealEntry[] = JSON.parse(dataMap[STORAGE_KEYS.MEAL_HISTORY]!);
                const allExistingIds = new Set(
                    Object.values(loadedAllMeals).flat().map(m => m.id)
                );
                const newEntries = historyMeals.filter(m => !allExistingIds.has(m.id));
                if (newEntries.length > 0) {
                    newEntries.forEach(m => {
                        const key = getDateKey(m.timestamp);
                        if (!loadedAllMeals[key]) loadedAllMeals[key] = [];
                        loadedAllMeals[key].push(m);
                    });
                }
            }
            // Prune to 90 days
            loadedAllMeals = pruneMealsByDate(loadedAllMeals, 90);
            setAllMeals(loadedAllMeals);
            await AsyncStorage.setItem(STORAGE_KEYS.ALL_MEALS, JSON.stringify(loadedAllMeals));

            if (dataMap[STORAGE_KEYS.ONBOARDING] === 'true') {
                setOnboardingComplete(true);
            }

            if (dataMap[STORAGE_KEYS.WATER] && consumedDate === today) {
                setWaterGlasses(JSON.parse(dataMap[STORAGE_KEYS.WATER]!));
            }

            // dailyHistory is already set during day-change archiving above (L274-287)
            // Only set from storage if no archiving happened (i.e. consumed date IS today or no consumed date)
            if (!consumedDate || consumedDate === today) {
                if (dataMap[STORAGE_KEYS.DAILY_HISTORY]) {
                    setDailyHistory(JSON.parse(dataMap[STORAGE_KEYS.DAILY_HISTORY]!));
                }
            }

            if (dataMap[STORAGE_KEYS.FAVORITES]) {
                setFavorites(JSON.parse(dataMap[STORAGE_KEYS.FAVORITES]!));
            }
        } catch (e) {
            console.error('Failed to load data:', e);
        } finally {
            setIsLoading(false);
        }
    };

    // Persist helper
    const persist = async (key: string, value: any, retries = 2) => {
        try {
            await AsyncStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        } catch (e) {
            console.error('Failed to persist:', key, e);
            if (retries > 0) {
                await new Promise(r => setTimeout(r, 500));
                return persist(key, value, retries - 1);
            }
        }
    };

    // Calculate BMR and Targets whenever profile changes
    useEffect(() => {
        calculateTargets(userProfile);
    }, [userProfile]);

    const calculateTargets = (profile: UserProfile) => {
        const w = parseFloat(profile.weight) || 70;
        const h = parseFloat(profile.height) || 175;
        const a = parseFloat(profile.age) || 25;

        let bmr = (10 * w) + (6.25 * h) - (5 * a);
        bmr += profile.gender === 'male' ? 5 : -161;

        const multipliers = {
            sedentary: 1.2,
            light: 1.375,
            moderate: 1.55,
            active: 1.725,
            extra: 1.9
        };

        const tdee = Math.round(bmr * multipliers[profile.activityLevel]);

        // Apply goal-based calorie adjustment
        const goalAdjustment = { lose: -300, maintain: 0, gain: 300 };
        // Apply body type adjustment
        const bodyTypeAdjustment = { ectomorph: 200, mesomorph: 0, endomorph: -200, unsure: 0 };
        const targetCalories = tdee + (goalAdjustment[profile.goal || 'maintain']) + (bodyTypeAdjustment[profile.bodyType || 'unsure']);

        const newTargets = {
            calories: targetCalories,
            protein: Math.round((targetCalories * 0.3) / 4),
            carbs: Math.round((targetCalories * 0.4) / 4),
            fat: Math.round((targetCalories * 0.3) / 9)
        };

        setTargets(newTargets);
        persist(STORAGE_KEYS.TARGETS, newTargets);
    };

    // F7: useCallback for all public functions
    const updateProfile = useCallback((profile: UserProfile) => {
        setUserProfile(profile);
        setOnboardingComplete(true);
        persist(STORAGE_KEYS.PROFILE, profile);
        persist(STORAGE_KEYS.ONBOARDING, 'true');
    }, []);

    const checkBadges = (currentConsumed: Nutrients, currentStreak: number, currentMealHistory?: MealEntry[]) => {
        const meals = currentMealHistory || mealHistory;
        const categorySet = new Set(meals.map(m => m.category).filter(Boolean));
        const hasLightMeal = meals.some(m => m.nutrients.calories > 0 && m.nutrients.calories < 300);
        const contextMock = {
            consumed: currentConsumed,
            streak: currentStreak,
            targets,
            waterGlasses,
            mealCount: meals.length,
            categoryCount: categorySet.size,
            hasLightMeal,
        };

        // F13: Set for O(1) badge lookup
        const earnedSet = new Set(earnedBadges);
        const newBadges: string[] = [];
        BADGES.forEach(badge => {
            if (!earnedSet.has(badge.id) && badge.condition(contextMock)) {
                newBadges.push(badge.id);
            }
        });

        if (newBadges.length > 0) {
            const updated = [...earnedBadges, ...newBadges];
            setEarnedBadges(updated);
            persist(STORAGE_KEYS.BADGES, updated);
            // Queue ALL new badges for sequential display
            const badgeObjects = newBadges.map(id => BADGES.find(b => b.id === id)!).filter(Boolean);
            setBadgeQueue(prev => [...prev, ...badgeObjects]);
        }
    };

    const clearNewBadge = useCallback(() => setBadgeQueue(prev => prev.slice(1)), []);

    const addMeal = useCallback((meal: Nutrients, name?: string, category?: MealCategory) => {
        const today = new Date().toISOString().split('T')[0];
        let newStreak = streak;

        if (lastLogDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (lastLogDate === yesterdayStr) {
                newStreak += 1;
            } else {
                newStreak = 1;
            }
            setStreak(newStreak);
            setLastLogDate(today);
            persist(STORAGE_KEYS.STREAK, newStreak);
            persist(STORAGE_KEYS.LAST_LOG_DATE, today);
        }

        const newConsumed = {
            calories: consumed.calories + meal.calories,
            protein: consumed.protein + meal.protein,
            carbs: consumed.carbs + meal.carbs,
            fat: consumed.fat + meal.fat,
        };

        const entry: MealEntry = {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 9),
            name: name || 'Meal',
            nutrients: meal,
            timestamp: new Date().toISOString(),
            category,
        };

        const newHistory = [...mealHistory, entry];

        setConsumed(newConsumed);
        setMealHistory(newHistory);

        // F2: Save to date-indexed allMeals
        setAllMeals(prev => {
            const key = today;
            const updated = { ...prev, [key]: [...(prev[key] || []), entry] };
            AsyncStorage.setItem(STORAGE_KEYS.ALL_MEALS, JSON.stringify(updated))
                .catch(e => console.error('Failed to persist allMeals:', e));
            return updated;
        });

        // Batch persist consumed + history
        AsyncStorage.multiSet([
            [STORAGE_KEYS.CONSUMED, JSON.stringify(newConsumed)],
            [STORAGE_KEYS.CONSUMED_DATE, today],
            [STORAGE_KEYS.MEAL_HISTORY, JSON.stringify(newHistory)],
        ]).catch(e => console.error('Failed to batch-persist addMeal:', e));

        checkBadges(newConsumed, newStreak, newHistory);
    }, [streak, lastLogDate, consumed, mealHistory, targets, waterGlasses, earnedBadges]);

    const removeMeal = useCallback((id: string) => {
        const entry = mealHistory.find(m => m.id === id);
        if (!entry) return;

        const newConsumed = {
            calories: Math.max(0, consumed.calories - entry.nutrients.calories),
            protein: Math.max(0, consumed.protein - entry.nutrients.protein),
            carbs: Math.max(0, consumed.carbs - entry.nutrients.carbs),
            fat: Math.max(0, consumed.fat - entry.nutrients.fat),
        };

        const newHistory = mealHistory.filter(m => m.id !== id);

        setConsumed(newConsumed);
        setMealHistory(newHistory);

        // F2: Remove from date-indexed allMeals
        setAllMeals(prev => {
            const updated = { ...prev };
            Object.keys(updated).forEach(key => {
                updated[key] = updated[key].filter(m => m.id !== id);
                if (updated[key].length === 0) delete updated[key];
            });
            AsyncStorage.setItem(STORAGE_KEYS.ALL_MEALS, JSON.stringify(updated))
                .catch(e => console.error('Failed to persist allMeals:', e));
            return updated;
        });

        // Batch persist consumed + history
        AsyncStorage.multiSet([
            [STORAGE_KEYS.CONSUMED, JSON.stringify(newConsumed)],
            [STORAGE_KEYS.MEAL_HISTORY, JSON.stringify(newHistory)],
        ]).catch(e => console.error('Failed to batch-persist removeMeal:', e));
    }, [mealHistory, consumed]);

    const addWater = useCallback(() => {
        const newVal = waterGlasses + 1;
        setWaterGlasses(newVal);
        persist(STORAGE_KEYS.WATER, newVal);
    }, [waterGlasses]);

    const removeWater = useCallback(() => {
        const newVal = Math.max(0, waterGlasses - 1);
        setWaterGlasses(newVal);
        persist(STORAGE_KEYS.WATER, newVal);
    }, [waterGlasses]);

    const toggleFavorite = useCallback((food: FavoriteFood) => {
        const exists = favorites.some(f => f.name === food.name);
        const updated = exists
            ? favorites.filter(f => f.name !== food.name)
            : [...favorites, food];
        setFavorites(updated);
        persist(STORAGE_KEYS.FAVORITES, updated);
    }, [favorites]);

    const isFavorite = useCallback((name: string) => favorites.some(f => f.name === name), [favorites]);

    // F2: Date-indexed addMealForDate — O(1) insert
    const addMealForDate = useCallback((meal: Nutrients, name: string, date: string, category?: MealCategory) => {
        const entry: MealEntry = {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 9),
            name,
            nutrients: meal,
            timestamp: new Date(date + 'T12:00:00').toISOString(),
            category,
        };
        setAllMeals(prev => {
            const updated = { ...prev, [date]: [...(prev[date] || []), entry] };
            persist(STORAGE_KEYS.ALL_MEALS, updated);
            return updated;
        });
    }, []);

    // F2: Date-indexed getMealsForDate — O(1) lookup
    const getMealsForDate = useCallback((date: string): MealEntry[] => {
        return allMeals[date] || [];
    }, [allMeals]);

    // F14: Memoized context value to prevent false re-renders
    const value = useMemo(() => ({
        consumed, targets, userProfile, streak, earnedBadges, mealHistory,
        badgeQueue, onboardingComplete, isLoading, waterGlasses, waterTarget,
        dailyHistory, favorites, allMeals,
        updateProfile, addMeal, removeMeal, clearNewBadge, addWater,
        removeWater, toggleFavorite, isFavorite, addMealForDate, getMealsForDate,
    }), [
        consumed, targets, userProfile, streak, earnedBadges, mealHistory,
        badgeQueue, onboardingComplete, isLoading, waterGlasses, waterTarget,
        dailyHistory, favorites, allMeals,
        updateProfile, addMeal, removeMeal, clearNewBadge, addWater,
        removeWater, toggleFavorite, isFavorite, addMealForDate, getMealsForDate,
    ]);

    return (
        <CalorieContext.Provider value={value}>
            {children}
        </CalorieContext.Provider>
    );
};

export const useCalories = () => useContext(CalorieContext);
