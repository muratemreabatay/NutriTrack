import { MealCategory } from '../context/CalorieContext';

// ─── Meal Categories ────────────────────────────────────────────
// Used in: DashboardScreen, ManualEntryScreen, CalendarScreen
export const MEAL_CATEGORIES: { id: MealCategory; label: string; icon: string; timeRange?: string }[] = [
    { id: 'breakfast', label: 'Kahvaltı', icon: '🌅', timeRange: '06:00-10:00' },
    { id: 'lunch', label: 'Öğle', icon: '☀️', timeRange: '11:00-14:00' },
    { id: 'dinner', label: 'Akşam', icon: '🌙', timeRange: '17:00-21:00' },
    { id: 'snack', label: 'Atıştırma', icon: '🍪', timeRange: 'Her zaman' },
];

// ─── Activity Levels ────────────────────────────────────────────
// Used in: SmartOnboardingScreen, ProfileScreen
export type ActivityLevelId = 'sedentary' | 'light' | 'moderate' | 'active' | 'extra';

export const ACTIVITY_LEVELS: { id: ActivityLevelId; label: string; icon: string; desc: string; multiplier: string }[] = [
    { id: 'sedentary', label: 'Hareketsiz', icon: '🪑', desc: 'Masa başı iş, az hareket', multiplier: '1.2x' },
    { id: 'light', label: 'Hafif Aktif', icon: '🚶', desc: 'Hafif yürüyüş, hafif egzersiz', multiplier: '1.4x' },
    { id: 'moderate', label: 'Orta Aktif', icon: '🏃', desc: 'Haftada 3-5 gün egzersiz', multiplier: '1.6x' },
    { id: 'active', label: 'Çok Aktif', icon: '🏋️', desc: 'Yoğun günlük antrenman', multiplier: '1.7x' },
    { id: 'extra', label: 'Profesyonel', icon: '🏆', desc: 'Günde 2+ saat yoğun spor', multiplier: '1.9x' },
];

export const ACTIVITY_LABELS: Record<string, string> = Object.fromEntries(
    ACTIVITY_LEVELS.map(a => [a.id, a.label])
);

// ─── Food Database ──────────────────────────────────────────────
// Used in: ManualEntryScreen, CalendarScreen (QUICK_FOODS)
export type FoodItem = {
    name: string;
    icon: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
};

export type FoodCategory = {
    id: string;
    label: string;
    icon: string;
    items: FoodItem[];
};

export const FOOD_DATABASE: FoodCategory[] = [
    {
        id: 'breakfast', label: 'Kahvaltılık', icon: '🌅',
        items: [
            { name: 'Haşlanmış Yumurta', icon: '🥚', calories: 78, protein: 6, carbs: 1, fat: 5 },
            { name: 'Menemen (1 porsiyon)', icon: '🍳', calories: 220, protein: 12, carbs: 8, fat: 16 },
            { name: 'Peynir (30g)', icon: '🧀', calories: 100, protein: 7, carbs: 1, fat: 8 },
            { name: 'Zeytin (10 adet)', icon: '🫒', calories: 50, protein: 0, carbs: 1, fat: 5 },
            { name: 'Bal (1 yemek kaşığı)', icon: '🍯', calories: 64, protein: 0, carbs: 17, fat: 0 },
            { name: 'Domates (1 adet)', icon: '🍅', calories: 22, protein: 1, carbs: 5, fat: 0 },
            { name: 'Salatalık (1 adet)', icon: '🥒', calories: 16, protein: 1, carbs: 4, fat: 0 },
            { name: 'Tereyağı (10g)', icon: '🧈', calories: 72, protein: 0, carbs: 0, fat: 8 },
        ]
    },
    {
        id: 'protein', label: 'Protein', icon: '🥩',
        items: [
            { name: 'Tavuk Göğsü (100g)', icon: '🍗', calories: 165, protein: 31, carbs: 0, fat: 4 },
            { name: 'Izgara Köfte (100g)', icon: '🥩', calories: 245, protein: 20, carbs: 3, fat: 17 },
            { name: 'Somon (100g)', icon: '🐟', calories: 208, protein: 22, carbs: 0, fat: 13 },
            { name: 'Ton Balığı (100g)', icon: '🐠', calories: 130, protein: 28, carbs: 0, fat: 2 },
            { name: 'Kıyma (100g)', icon: '🥓', calories: 250, protein: 18, carbs: 0, fat: 20 },
            { name: 'Hindi Göğsü (100g)', icon: '🦃', calories: 135, protein: 30, carbs: 0, fat: 1 },
            { name: 'Mercimek (pişmiş, 200g)', icon: '🫘', calories: 230, protein: 18, carbs: 40, fat: 1 },
            { name: 'Nohut (pişmiş, 200g)', icon: '🫛', calories: 270, protein: 15, carbs: 45, fat: 4 },
        ]
    },
    {
        id: 'carbs', label: 'Tahıllar', icon: '🍞',
        items: [
            { name: 'Pilav (1 porsiyon)', icon: '🍚', calories: 206, protein: 4, carbs: 45, fat: 1 },
            { name: 'Makarna (1 porsiyon)', icon: '🍝', calories: 220, protein: 8, carbs: 43, fat: 1 },
            { name: 'Ekmek (1 dilim)', icon: '🍞', calories: 79, protein: 3, carbs: 15, fat: 1 },
            { name: 'Tam Buğday Ekmek', icon: '🥖', calories: 69, protein: 4, carbs: 12, fat: 1 },
            { name: 'Bulgur Pilavı', icon: '🌾', calories: 180, protein: 6, carbs: 34, fat: 2 },
            { name: 'Yulaf Ezmesi (40g)', icon: '🥣', calories: 152, protein: 5, carbs: 27, fat: 3 },
            { name: 'Simit', icon: '🥯', calories: 280, protein: 8, carbs: 50, fat: 5 },
            { name: 'Poğaça', icon: '🥐', calories: 320, protein: 6, carbs: 38, fat: 16 },
        ]
    },
    {
        id: 'dairy', label: 'Süt Ürünleri', icon: '🥛',
        items: [
            { name: 'Yoğurt (200g)', icon: '🥛', calories: 120, protein: 7, carbs: 9, fat: 6 },
            { name: 'Süt (1 bardak)', icon: '🥛', calories: 122, protein: 8, carbs: 12, fat: 5 },
            { name: 'Ayran (1 bardak)', icon: '🥤', calories: 66, protein: 3, carbs: 5, fat: 4 },
            { name: 'Lor Peyniri (100g)', icon: '🧀', calories: 98, protein: 11, carbs: 3, fat: 4 },
            { name: 'Kaşar Peyniri (30g)', icon: '🧀', calories: 110, protein: 8, carbs: 1, fat: 9 },
            { name: 'Labne (1 yemek k.)', icon: '🍶', calories: 50, protein: 2, carbs: 1, fat: 4 },
        ]
    },
    {
        id: 'fruits', label: 'Meyveler', icon: '🍎',
        items: [
            { name: 'Elma', icon: '🍎', calories: 95, protein: 0, carbs: 25, fat: 0 },
            { name: 'Muz', icon: '🍌', calories: 105, protein: 1, carbs: 27, fat: 0 },
            { name: 'Portakal', icon: '🍊', calories: 62, protein: 1, carbs: 15, fat: 0 },
            { name: 'Çilek (150g)', icon: '🍓', calories: 48, protein: 1, carbs: 12, fat: 0 },
            { name: 'Üzüm (100g)', icon: '🍇', calories: 69, protein: 1, carbs: 18, fat: 0 },
            { name: 'Karpuz (200g)', icon: '🍉', calories: 60, protein: 1, carbs: 15, fat: 0 },
            { name: 'Avokado (yarım)', icon: '🥑', calories: 120, protein: 2, carbs: 6, fat: 11 },
        ]
    },
    {
        id: 'soups', label: 'Çorbalar', icon: '🍲',
        items: [
            { name: 'Mercimek Çorbası', icon: '🍲', calories: 150, protein: 8, carbs: 22, fat: 3 },
            { name: 'Ezogelin Çorbası', icon: '🍜', calories: 140, protein: 6, carbs: 24, fat: 2 },
            { name: 'Tavuk Suyu Çorba', icon: '🥣', calories: 80, protein: 5, carbs: 10, fat: 2 },
            { name: 'Domates Çorbası', icon: '🍅', calories: 100, protein: 3, carbs: 16, fat: 3 },
            { name: 'Yayla Çorbası', icon: '🥛', calories: 120, protein: 5, carbs: 14, fat: 5 },
            { name: 'İşkembe Çorbası', icon: '🍲', calories: 110, protein: 10, carbs: 8, fat: 5 },
        ]
    },
    {
        id: 'snacks', label: 'Atıştırmalık', icon: '🍪',
        items: [
            { name: 'Badem (30g)', icon: '🥜', calories: 170, protein: 6, carbs: 6, fat: 15 },
            { name: 'Ceviz (30g)', icon: '🌰', calories: 196, protein: 5, carbs: 4, fat: 20 },
            { name: 'Kuru Kayısı (5 adet)', icon: '🟠', calories: 80, protein: 1, carbs: 20, fat: 0 },
            { name: 'Bitter Çikolata (20g)', icon: '🍫', calories: 110, protein: 2, carbs: 8, fat: 8 },
            { name: 'Grissini (3 adet)', icon: '🥖', calories: 90, protein: 2, carbs: 16, fat: 2 },
            { name: 'Protein Bar', icon: '💪', calories: 200, protein: 20, carbs: 22, fat: 8 },
        ]
    },
    {
        id: 'drinks', label: 'İçecekler', icon: '☕',
        items: [
            { name: 'Türk Kahvesi', icon: '☕', calories: 5, protein: 0, carbs: 1, fat: 0 },
            { name: 'Çay (şekersiz)', icon: '🍵', calories: 2, protein: 0, carbs: 0, fat: 0 },
            { name: 'Çay (1 şekerli)', icon: '🍵', calories: 22, protein: 0, carbs: 5, fat: 0 },
            { name: 'Latte', icon: '☕', calories: 150, protein: 8, carbs: 12, fat: 7 },
            { name: 'Portakal Suyu', icon: '🧃', calories: 112, protein: 2, carbs: 26, fat: 0 },
            { name: 'Kola (330ml)', icon: '🥤', calories: 140, protein: 0, carbs: 39, fat: 0 },
            { name: 'Protein Shake', icon: '🥤', calories: 180, protein: 25, carbs: 8, fat: 4 },
        ]
    },
];

// Pre-computed popular foods for ManualEntryScreen
export const POPULAR_FOODS = FOOD_DATABASE.flatMap(c => c.items).slice(0, 12);

// Quick-add foods for CalendarScreen (references same data as FOOD_DATABASE)
export const QUICK_FOODS: FoodItem[] = [
    FOOD_DATABASE[0].items[0],  // Haşlanmış Yumurta
    FOOD_DATABASE[1].items[0],  // Tavuk Göğsü
    FOOD_DATABASE[2].items[0],  // Pilav
    { name: 'Salata', icon: '🥗', calories: 120, protein: 3, carbs: 12, fat: 7 },
    FOOD_DATABASE[3].items[0],  // Yoğurt
    FOOD_DATABASE[2].items[2],  // Ekmek
    FOOD_DATABASE[5].items[0],  // Mercimek Çorbası
    FOOD_DATABASE[4].items[1],  // Muz
];
