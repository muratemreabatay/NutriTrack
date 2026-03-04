import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
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
    // İlk adımlar
    { id: 'first_meal', name: 'İlk Adım', description: 'İlk yemeğini kaydettin!', icon: '🥑', condition: (ctx) => ctx.consumed.calories > 0 },
    // Streak rozetleri
    { id: 'streak_3', name: 'İstikrarlı', description: '3 gün üst üste takip', icon: '🔥', condition: (ctx) => ctx.streak >= 3 },
    { id: 'streak_7', name: 'Hafta Savaşçısı', description: '7 günlük seri!', icon: '⚔️', condition: (ctx) => ctx.streak >= 7 },
    { id: 'streak_14', name: 'Alışkanlık Ustası', description: '14 gün aralıksız takip', icon: '🛡️', condition: (ctx) => ctx.streak >= 14 },
    { id: 'streak_30', name: 'Demir İrade', description: '30 gün boyunca her gün!', icon: '💎', condition: (ctx) => ctx.streak >= 30 },
    { id: 'streak_60', name: 'Altın Seri', description: '60 gün aralıksız! Efsane oluyorsun', icon: '👑', condition: (ctx) => ctx.streak >= 60 },
    { id: 'streak_90', name: 'Platin Seri', description: '90 günlük seri — gerçek bir şampiyon!', icon: '🏆', condition: (ctx) => ctx.streak >= 90 },
    // Makro hedefleri
    { id: 'protein_master', name: 'Protein Şefi', description: 'Günlük protein hedefini tamamla', icon: '🥩', condition: (ctx) => ctx.consumed.protein >= ctx.targets.protein && ctx.targets.protein > 0 },
    { id: 'carb_loader', name: 'Enerji Deposu', description: 'Karbonhidrat hedefini doldur', icon: '🍞', condition: (ctx) => ctx.consumed.carbs >= ctx.targets.carbs && ctx.targets.carbs > 0 },
    { id: 'fat_balance', name: 'Yağ Dengesi', description: 'Yağ hedefini yakala', icon: '🥜', condition: (ctx) => ctx.consumed.fat >= ctx.targets.fat && ctx.targets.fat > 0 },
    { id: 'macro_perfect', name: 'Mükemmel Denge', description: 'Tüm makro hedeflerini aynı gün tamamla', icon: '⚖️', condition: (ctx) => ctx.consumed.protein >= ctx.targets.protein && ctx.consumed.carbs >= ctx.targets.carbs && ctx.consumed.fat >= ctx.targets.fat && ctx.targets.protein > 0 },
    // Kalori hedefleri
    { id: 'cal_500', name: 'Başlangıç', description: 'Bir günde 500+ kcal kaydet', icon: '📝', condition: (ctx) => ctx.consumed.calories >= 500 },
    { id: 'cal_1000', name: 'Bilinçli Beslenme', description: 'Bir günde 1000+ kcal kaydet', icon: '📊', condition: (ctx) => ctx.consumed.calories >= 1000 },
    { id: 'cal_1500', name: 'Takip Uzmanı', description: 'Bir günde 1500+ kcal takip et', icon: '🏅', condition: (ctx) => ctx.consumed.calories >= 1500 },
    { id: 'cal_2000', name: 'Tam Gaz', description: 'Bir günde 2000+ kcal kayıt', icon: '🚀', condition: (ctx) => ctx.consumed.calories >= 2000 },
    { id: 'goal_reached', name: 'Hedefe Ulaştın!', description: 'Günlük kalori hedefini doldur', icon: '🎯', condition: (ctx) => ctx.consumed.calories >= ctx.targets.calories && ctx.targets.calories > 0 },
    // Özel
    { id: 'early_bird', name: 'Erken Kuş', description: 'Sabah 8\'den önce öğün ekle', icon: '🌅', condition: (ctx) => { const h = new Date().getHours(); return h < 8 && ctx.consumed.calories > 0; } },
    { id: 'night_owl', name: 'Gece Kuşu', description: 'Gece 22\'den sonra kayıt yap', icon: '🦉', condition: (ctx) => { const h = new Date().getHours(); return h >= 22 && ctx.consumed.calories > 0; } },
    // Yeni rozetler
    { id: 'water_champ', name: 'Su Şampiyonu', description: 'Günde 8 bardak su iç', icon: '💧', condition: (ctx) => ctx.waterGlasses >= 8 },
    { id: 'meal_logger_5', name: 'Kayıt Meraklısı', description: 'Bir günde 5 öğün kaydet', icon: '📋', condition: (ctx) => ctx.mealCount >= 5 },
    { id: 'variety_king', name: 'Çeşitlilik Kralı', description: '4 farklı öğün kategorisi kullan', icon: '🌈', condition: (ctx) => ctx.categoryCount >= 4 },
    { id: 'weekend_warrior', name: 'Hafta Sonu Savaşçısı', description: 'Hafta sonu da takip et', icon: '🗓️', condition: (ctx) => { const d = new Date().getDay(); return (d === 0 || d === 6) && ctx.consumed.calories > 0; } },
    { id: 'breakfast_lover', name: 'Kahvaltı Aşığı', description: 'Sabah 10\'dan önce öğün ekle', icon: '🥞', condition: (ctx) => { const h = new Date().getHours(); return h < 10 && ctx.consumed.calories > 0; } },
    { id: 'light_eater', name: 'Hafif Öğün', description: '300 kcal altı bir öğün kaydet', icon: '🥗', condition: (ctx) => ctx.hasLightMeal },
];

type UserProfile = {
    weight: string;
    height: string;
    age: string;
    gender: 'male' | 'female';
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'extra';
    goal?: 'lose' | 'maintain' | 'gain';
    targetWeight?: string;
    bodyType?: 'ectomorph' | 'mesomorph' | 'endomorph' | 'unsure';
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
    allMeals: MealEntry[];
    addMealForDate: (meal: Nutrients, name: string, date: string, category?: MealCategory) => void;
    getMealsForDate: (date: string) => MealEntry[];
};

const defaultTargets = {
    calories: 2200,
    protein: 150,
    carbs: 250,
    fat: 70,
};

const defaultProfile: UserProfile = {
    weight: '70',
    height: '175',
    age: '25',
    gender: 'male',
    activityLevel: 'moderate',
    goal: 'maintain',
    targetWeight: '70',
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
    allMeals: [],
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
    const [allMeals, setAllMeals] = useState<MealEntry[]>([]);

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

            // Load allMeals and sync with mealHistory
            let loadedAllMeals: MealEntry[] = dataMap[STORAGE_KEYS.ALL_MEALS]
                ? JSON.parse(dataMap[STORAGE_KEYS.ALL_MEALS]!) : [];

            // Merge current mealHistory into allMeals (for backward compatibility)
            if (dataMap[STORAGE_KEYS.MEAL_HISTORY]) {
                const historyMeals: MealEntry[] = JSON.parse(dataMap[STORAGE_KEYS.MEAL_HISTORY]!);
                const existingIds = new Set(loadedAllMeals.map(m => m.id));
                const newEntries = historyMeals.filter(m => !existingIds.has(m.id));
                if (newEntries.length > 0) {
                    loadedAllMeals = [...loadedAllMeals, ...newEntries];
                    await AsyncStorage.setItem(STORAGE_KEYS.ALL_MEALS, JSON.stringify(loadedAllMeals));
                }
            }
            setAllMeals(loadedAllMeals);

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

    const updateProfile = (profile: UserProfile) => {
        setUserProfile(profile);
        setOnboardingComplete(true);
        persist(STORAGE_KEYS.PROFILE, profile);
        persist(STORAGE_KEYS.ONBOARDING, 'true');
    };

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

        const newBadges: string[] = [];
        BADGES.forEach(badge => {
            if (!earnedBadges.includes(badge.id) && badge.condition(contextMock)) {
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

    const clearNewBadge = () => setBadgeQueue(prev => prev.slice(1));

    const addMeal = (meal: Nutrients, name?: string, category?: MealCategory) => {
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
            name: name || 'Öğün',
            nutrients: meal,
            timestamp: new Date().toISOString(),
            category,
        };

        const newHistory = [...mealHistory, entry];

        setConsumed(newConsumed);
        setMealHistory(newHistory);

        // Also save to allMeals
        const newAllMeals = [...allMeals, entry];
        setAllMeals(newAllMeals);

        // F9: Batch all writes atomically with multiSet
        AsyncStorage.multiSet([
            [STORAGE_KEYS.CONSUMED, JSON.stringify(newConsumed)],
            [STORAGE_KEYS.CONSUMED_DATE, today],
            [STORAGE_KEYS.MEAL_HISTORY, JSON.stringify(newHistory)],
            [STORAGE_KEYS.ALL_MEALS, JSON.stringify(newAllMeals)],
        ]).catch(e => console.error('Failed to batch-persist addMeal:', e));

        checkBadges(newConsumed, newStreak, newHistory);
    };

    const removeMeal = (id: string) => {
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

        // Also remove from allMeals
        const newAllMeals = allMeals.filter(m => m.id !== id);
        setAllMeals(newAllMeals);

        // F9: Batch all writes atomically
        AsyncStorage.multiSet([
            [STORAGE_KEYS.CONSUMED, JSON.stringify(newConsumed)],
            [STORAGE_KEYS.MEAL_HISTORY, JSON.stringify(newHistory)],
            [STORAGE_KEYS.ALL_MEALS, JSON.stringify(newAllMeals)],
        ]).catch(e => console.error('Failed to batch-persist removeMeal:', e));
    };

    const addWater = () => {
        const newVal = waterGlasses + 1;
        setWaterGlasses(newVal);
        persist(STORAGE_KEYS.WATER, newVal);
    };

    const removeWater = () => {
        const newVal = Math.max(0, waterGlasses - 1);
        setWaterGlasses(newVal);
        persist(STORAGE_KEYS.WATER, newVal);
    };

    const toggleFavorite = (food: FavoriteFood) => {
        const exists = favorites.some(f => f.name === food.name);
        const updated = exists
            ? favorites.filter(f => f.name !== food.name)
            : [...favorites, food];
        setFavorites(updated);
        persist(STORAGE_KEYS.FAVORITES, updated);
    };

    const isFavorite = (name: string) => favorites.some(f => f.name === name);

    const addMealForDate = (meal: Nutrients, name: string, date: string, category?: MealCategory) => {
        const entry: MealEntry = {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 9),
            name,
            nutrients: meal,
            timestamp: new Date(date + 'T12:00:00').toISOString(),
            category,
        };
        const newAllMeals = [...allMeals, entry];
        setAllMeals(newAllMeals);
        persist(STORAGE_KEYS.ALL_MEALS, newAllMeals);
    };

    const getMealsForDate = (date: string): MealEntry[] => {
        return allMeals.filter(m => {
            const d = new Date(m.timestamp);
            const localDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            return localDate === date;
        });
    };

    return (
        <CalorieContext.Provider value={{ consumed, targets, userProfile, streak, earnedBadges, mealHistory, badgeQueue, onboardingComplete, isLoading, waterGlasses, waterTarget, dailyHistory, favorites, allMeals, updateProfile, addMeal, removeMeal, clearNewBadge, addWater, removeWater, toggleFavorite, isFavorite, addMealForDate, getMealsForDate }}>
            {children}
        </CalorieContext.Provider>
    );
};

export const useCalories = () => useContext(CalorieContext);
