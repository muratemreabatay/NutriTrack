import { useLanguage } from '../i18n/LanguageContext';
import { MealCategory } from '../context/CalorieContext';

// ─── Meal Categories ────────────────────────────────────────────

export type FoodItem = {
    name: { tr: string; en: string };
    icon: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    trOnly?: boolean; // If true, only shown when language is Turkish
};

export type FoodCategory = {
    id: string;
    icon: string;
    items: FoodItem[];
};

// Backward-compat: resolved food item with string name
export type ResolvedFoodItem = {
    name: string;
    icon: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
};

// ─── Activity Levels ────────────────────────────────────────────
export type ActivityLevelId = 'sedentary' | 'light' | 'moderate' | 'active' | 'extra';

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevelId, string> = {
    sedentary: '1.2x',
    light: '1.4x',
    moderate: '1.6x',
    active: '1.7x',
    extra: '1.9x',
};

// ─── Food Database ──────────────────────────────────────────────
export const FOOD_DATABASE: FoodCategory[] = [
    {
        id: 'breakfast', icon: '🌅',
        items: [
            { name: { tr: 'Haşlanmış Yumurta', en: 'Boiled Egg' }, icon: '🥚', calories: 78, protein: 6, carbs: 1, fat: 5 },
            { name: { tr: 'Menemen (1 porsiyon)', en: 'Turkish Menemen' }, icon: '🍳', calories: 220, protein: 12, carbs: 8, fat: 16, trOnly: true },
            { name: { tr: 'Peynir (30g)', en: 'White Cheese (30g)' }, icon: '🧀', calories: 100, protein: 7, carbs: 1, fat: 8 },
            { name: { tr: 'Zeytin (10 adet)', en: 'Olives (10 pcs)' }, icon: '🫒', calories: 50, protein: 0, carbs: 1, fat: 5 },
            { name: { tr: 'Bal (1 yemek kaşığı)', en: 'Honey (1 tbsp)' }, icon: '🍯', calories: 64, protein: 0, carbs: 17, fat: 0 },
            { name: { tr: 'Domates (1 adet)', en: 'Tomato (1 pc)' }, icon: '🍅', calories: 22, protein: 1, carbs: 5, fat: 0 },
            { name: { tr: 'Salatalık (1 adet)', en: 'Cucumber (1 pc)' }, icon: '🥒', calories: 16, protein: 1, carbs: 4, fat: 0 },
            { name: { tr: 'Tereyağı (10g)', en: 'Butter (10g)' }, icon: '🧈', calories: 72, protein: 0, carbs: 0, fat: 8 },
            { name: { tr: 'Omlet (2 yumurta)', en: 'Omelette (2 eggs)' }, icon: '🍳', calories: 180, protein: 13, carbs: 1, fat: 14 },
            { name: { tr: 'Yulaf Ezmesi (40g)', en: 'Oatmeal (40g)' }, icon: '🥣', calories: 152, protein: 5, carbs: 27, fat: 3 },
            { name: { tr: 'Granola (50g)', en: 'Granola (50g)' }, icon: '🥣', calories: 220, protein: 5, carbs: 32, fat: 9 },
            { name: { tr: 'Krep (1 adet)', en: 'Crepe (1 pc)' }, icon: '🥞', calories: 150, protein: 4, carbs: 22, fat: 5 },
            { name: { tr: 'Pankek (2 adet)', en: 'Pancakes (2 pcs)' }, icon: '🥞', calories: 280, protein: 7, carbs: 38, fat: 10 },
            { name: { tr: 'Avokadolu Tost', en: 'Avocado Toast' }, icon: '🥑', calories: 250, protein: 6, carbs: 26, fat: 14 },
            { name: { tr: 'Peynirli Tost', en: 'Cheese Toast' }, icon: '🧀', calories: 310, protein: 14, carbs: 30, fat: 16 },
            { name: { tr: 'Açma', en: 'Turkish Pastry (Açma)' }, icon: '🥐', calories: 280, protein: 6, carbs: 32, fat: 14, trOnly: true },
            { name: { tr: 'Simit', en: 'Turkish Bagel (Simit)' }, icon: '🥯', calories: 280, protein: 8, carbs: 50, fat: 5, trOnly: true },
            { name: { tr: 'Poğaça', en: 'Turkish Pastry (Poğaça)' }, icon: '🥐', calories: 320, protein: 6, carbs: 38, fat: 16, trOnly: true },
        ]
    },
    {
        id: 'protein', icon: '🥩',
        items: [
            { name: { tr: 'Tavuk Göğsü (100g)', en: 'Chicken Breast (100g)' }, icon: '🍗', calories: 165, protein: 31, carbs: 0, fat: 4 },
            { name: { tr: 'Izgara Köfte (100g)', en: 'Grilled Meatballs (100g)' }, icon: '🥩', calories: 245, protein: 20, carbs: 3, fat: 17 },
            { name: { tr: 'Somon (100g)', en: 'Salmon (100g)' }, icon: '🐟', calories: 208, protein: 22, carbs: 0, fat: 13 },
            { name: { tr: 'Ton Balığı (100g)', en: 'Tuna (100g)' }, icon: '🐠', calories: 130, protein: 28, carbs: 0, fat: 2 },
            { name: { tr: 'Kıyma (100g)', en: 'Ground Beef (100g)' }, icon: '🥓', calories: 250, protein: 18, carbs: 0, fat: 20 },
            { name: { tr: 'Hindi Göğsü (100g)', en: 'Turkey Breast (100g)' }, icon: '🦃', calories: 135, protein: 30, carbs: 0, fat: 1 },
            { name: { tr: 'Mercimek (pişmiş, 200g)', en: 'Lentils (cooked, 200g)' }, icon: '🫘', calories: 230, protein: 18, carbs: 40, fat: 1 },
            { name: { tr: 'Nohut (pişmiş, 200g)', en: 'Chickpeas (cooked, 200g)' }, icon: '🫛', calories: 270, protein: 15, carbs: 45, fat: 4 },
            { name: { tr: 'Biftek (100g)', en: 'Steak (100g)' }, icon: '🥩', calories: 271, protein: 26, carbs: 0, fat: 18 },
            { name: { tr: 'Tavuk But (100g)', en: 'Chicken Thigh (100g)' }, icon: '🍗', calories: 209, protein: 26, carbs: 0, fat: 11 },
            { name: { tr: 'Karides (100g)', en: 'Shrimp (100g)' }, icon: '🦐', calories: 99, protein: 24, carbs: 0, fat: 1 },
            { name: { tr: 'Kuzu Pirzola (100g)', en: 'Lamb Chop (100g)' }, icon: '🥩', calories: 294, protein: 25, carbs: 0, fat: 21 },
            { name: { tr: 'Tofu (100g)', en: 'Tofu (100g)' }, icon: '🟫', calories: 76, protein: 8, carbs: 2, fat: 5 },
            { name: { tr: 'Tempeh (100g)', en: 'Tempeh (100g)' }, icon: '🟫', calories: 192, protein: 20, carbs: 8, fat: 11 },
        ]
    },
    {
        id: 'carbs', icon: '🍞',
        items: [
            { name: { tr: 'Pilav (1 porsiyon)', en: 'Rice (1 serving)' }, icon: '🍚', calories: 206, protein: 4, carbs: 45, fat: 1 },
            { name: { tr: 'Makarna (1 porsiyon)', en: 'Pasta (1 serving)' }, icon: '🍝', calories: 220, protein: 8, carbs: 43, fat: 1 },
            { name: { tr: 'Ekmek (1 dilim)', en: 'Bread (1 slice)' }, icon: '🍞', calories: 79, protein: 3, carbs: 15, fat: 1 },
            { name: { tr: 'Tam Buğday Ekmek', en: 'Whole Wheat Bread' }, icon: '🥖', calories: 69, protein: 4, carbs: 12, fat: 1 },
            { name: { tr: 'Bulgur Pilavı', en: 'Bulgur Pilaf' }, icon: '🌾', calories: 180, protein: 6, carbs: 34, fat: 2 },
            { name: { tr: 'Patates (haşlanmış, 150g)', en: 'Potato (boiled, 150g)' }, icon: '🥔', calories: 130, protein: 3, carbs: 30, fat: 0 },
            { name: { tr: 'Tatlı Patates (150g)', en: 'Sweet Potato (150g)' }, icon: '🍠', calories: 135, protein: 2, carbs: 31, fat: 0 },
            { name: { tr: 'Mısır (1 adet)', en: 'Corn on the Cob (1 pc)' }, icon: '🌽', calories: 90, protein: 3, carbs: 19, fat: 1 },
            { name: { tr: 'Kinoa (pişmiş, 150g)', en: 'Quinoa (cooked, 150g)' }, icon: '🌾', calories: 180, protein: 7, carbs: 30, fat: 3 },
            { name: { tr: 'Kuskus (pişmiş, 150g)', en: 'Couscous (cooked, 150g)' }, icon: '🌾', calories: 176, protein: 6, carbs: 36, fat: 0 },
            { name: { tr: 'Pirinç Noodle (100g)', en: 'Rice Noodles (100g)' }, icon: '🍜', calories: 109, protein: 1, carbs: 25, fat: 0 },
            { name: { tr: 'Tortilla Wrap', en: 'Tortilla Wrap' }, icon: '🌯', calories: 150, protein: 4, carbs: 26, fat: 3 },
        ]
    },
    {
        id: 'dairy', icon: '🥛',
        items: [
            { name: { tr: 'Yoğurt (200g)', en: 'Yogurt (200g)' }, icon: '🥛', calories: 120, protein: 7, carbs: 9, fat: 6 },
            { name: { tr: 'Süt (1 bardak)', en: 'Milk (1 glass)' }, icon: '🥛', calories: 122, protein: 8, carbs: 12, fat: 5 },
            { name: { tr: 'Ayran (1 bardak)', en: 'Ayran (1 glass)' }, icon: '🥤', calories: 66, protein: 3, carbs: 5, fat: 4, trOnly: true },
            { name: { tr: 'Lor Peyniri (100g)', en: 'Cottage Cheese (100g)' }, icon: '🧀', calories: 98, protein: 11, carbs: 3, fat: 4 },
            { name: { tr: 'Kaşar Peyniri (30g)', en: 'Cheddar Cheese (30g)' }, icon: '🧀', calories: 110, protein: 8, carbs: 1, fat: 9 },
            { name: { tr: 'Labne (1 yemek k.)', en: 'Labneh (1 tbsp)' }, icon: '🍶', calories: 50, protein: 2, carbs: 1, fat: 4, trOnly: true },
            { name: { tr: 'Yunan Yoğurdu (150g)', en: 'Greek Yogurt (150g)' }, icon: '🥛', calories: 146, protein: 15, carbs: 6, fat: 8 },
            { name: { tr: 'Kefir (200ml)', en: 'Kefir (200ml)' }, icon: '🥛', calories: 104, protein: 6, carbs: 9, fat: 5 },
            { name: { tr: 'Mozzarella (30g)', en: 'Mozzarella (30g)' }, icon: '🧀', calories: 85, protein: 6, carbs: 1, fat: 6 },
            { name: { tr: 'Feta Peyniri (30g)', en: 'Feta Cheese (30g)' }, icon: '🧀', calories: 75, protein: 4, carbs: 1, fat: 6 },
            { name: { tr: 'Krem Peynir (30g)', en: 'Cream Cheese (30g)' }, icon: '🧀', calories: 99, protein: 2, carbs: 1, fat: 10 },
        ]
    },
    {
        id: 'fruits', icon: '🍎',
        items: [
            { name: { tr: 'Elma', en: 'Apple' }, icon: '🍎', calories: 95, protein: 0, carbs: 25, fat: 0 },
            { name: { tr: 'Muz', en: 'Banana' }, icon: '🍌', calories: 105, protein: 1, carbs: 27, fat: 0 },
            { name: { tr: 'Portakal', en: 'Orange' }, icon: '🍊', calories: 62, protein: 1, carbs: 15, fat: 0 },
            { name: { tr: 'Çilek (150g)', en: 'Strawberries (150g)' }, icon: '🍓', calories: 48, protein: 1, carbs: 12, fat: 0 },
            { name: { tr: 'Üzüm (100g)', en: 'Grapes (100g)' }, icon: '🍇', calories: 69, protein: 1, carbs: 18, fat: 0 },
            { name: { tr: 'Karpuz (200g)', en: 'Watermelon (200g)' }, icon: '🍉', calories: 60, protein: 1, carbs: 15, fat: 0 },
            { name: { tr: 'Avokado (yarım)', en: 'Avocado (half)' }, icon: '🥑', calories: 120, protein: 2, carbs: 6, fat: 11 },
            { name: { tr: 'Şeftali', en: 'Peach' }, icon: '🍑', calories: 59, protein: 1, carbs: 14, fat: 0 },
            { name: { tr: 'Armut', en: 'Pear' }, icon: '🍐', calories: 101, protein: 1, carbs: 27, fat: 0 },
            { name: { tr: 'Ananas (150g)', en: 'Pineapple (150g)' }, icon: '🍍', calories: 75, protein: 1, carbs: 20, fat: 0 },
            { name: { tr: 'Mango (1 adet)', en: 'Mango (1 pc)' }, icon: '🥭', calories: 99, protein: 1, carbs: 25, fat: 1 },
            { name: { tr: 'Yaban Mersini (100g)', en: 'Blueberries (100g)' }, icon: '🫐', calories: 57, protein: 1, carbs: 14, fat: 0 },
            { name: { tr: 'Kiraz (100g)', en: 'Cherries (100g)' }, icon: '🍒', calories: 50, protein: 1, carbs: 12, fat: 0 },
        ]
    },
    {
        id: 'vegetables', icon: '🥬',
        items: [
            { name: { tr: 'Brokoli (100g)', en: 'Broccoli (100g)' }, icon: '🥦', calories: 34, protein: 3, carbs: 7, fat: 0 },
            { name: { tr: 'Ispanak (100g)', en: 'Spinach (100g)' }, icon: '🥬', calories: 23, protein: 3, carbs: 4, fat: 0 },
            { name: { tr: 'Havuç (1 adet)', en: 'Carrot (1 pc)' }, icon: '🥕', calories: 25, protein: 1, carbs: 6, fat: 0 },
            { name: { tr: 'Biber (1 adet)', en: 'Bell Pepper (1 pc)' }, icon: '🫑', calories: 30, protein: 1, carbs: 6, fat: 0 },
            { name: { tr: 'Patlıcan (100g)', en: 'Eggplant (100g)' }, icon: '🍆', calories: 25, protein: 1, carbs: 6, fat: 0 },
            { name: { tr: 'Kabak (100g)', en: 'Zucchini (100g)' }, icon: '🥒', calories: 17, protein: 1, carbs: 3, fat: 0 },
            { name: { tr: 'Mantar (100g)', en: 'Mushrooms (100g)' }, icon: '🍄', calories: 22, protein: 3, carbs: 3, fat: 0 },
            { name: { tr: 'Soğan (1 adet)', en: 'Onion (1 pc)' }, icon: '🧅', calories: 40, protein: 1, carbs: 9, fat: 0 },
            { name: { tr: 'Sarımsak (3 diş)', en: 'Garlic (3 cloves)' }, icon: '🧄', calories: 13, protein: 1, carbs: 3, fat: 0 },
            { name: { tr: 'Karnabahar (100g)', en: 'Cauliflower (100g)' }, icon: '🥦', calories: 25, protein: 2, carbs: 5, fat: 0 },
            { name: { tr: 'Yeşil Fasulye (100g)', en: 'Green Beans (100g)' }, icon: '🫘', calories: 31, protein: 2, carbs: 7, fat: 0 },
        ]
    },
    {
        id: 'soups', icon: '🍲',
        items: [
            { name: { tr: 'Mercimek Çorbası', en: 'Lentil Soup' }, icon: '🍲', calories: 150, protein: 8, carbs: 22, fat: 3 },
            { name: { tr: 'Ezogelin Çorbası', en: 'Turkish Ezogelin Soup' }, icon: '🍜', calories: 140, protein: 6, carbs: 24, fat: 2, trOnly: true },
            { name: { tr: 'Tavuk Suyu Çorba', en: 'Chicken Broth Soup' }, icon: '🥣', calories: 80, protein: 5, carbs: 10, fat: 2 },
            { name: { tr: 'Domates Çorbası', en: 'Tomato Soup' }, icon: '🍅', calories: 100, protein: 3, carbs: 16, fat: 3 },
            { name: { tr: 'Yayla Çorbası', en: 'Turkish Yogurt Soup' }, icon: '🥛', calories: 120, protein: 5, carbs: 14, fat: 5, trOnly: true },
            { name: { tr: 'İşkembe Çorbası', en: 'Tripe Soup' }, icon: '🍲', calories: 110, protein: 10, carbs: 8, fat: 5, trOnly: true },
            { name: { tr: 'Sebze Çorbası', en: 'Vegetable Soup' }, icon: '🥕', calories: 90, protein: 3, carbs: 15, fat: 2 },
            { name: { tr: 'Mantar Çorbası', en: 'Mushroom Soup' }, icon: '🍄', calories: 140, protein: 4, carbs: 12, fat: 8 },
        ]
    },
    {
        id: 'snacks', icon: '🍪',
        items: [
            { name: { tr: 'Badem (30g)', en: 'Almonds (30g)' }, icon: '🥜', calories: 170, protein: 6, carbs: 6, fat: 15 },
            { name: { tr: 'Ceviz (30g)', en: 'Walnuts (30g)' }, icon: '🌰', calories: 196, protein: 5, carbs: 4, fat: 20 },
            { name: { tr: 'Kuru Kayısı (5 adet)', en: 'Dried Apricots (5 pcs)' }, icon: '🟠', calories: 80, protein: 1, carbs: 20, fat: 0 },
            { name: { tr: 'Bitter Çikolata (20g)', en: 'Dark Chocolate (20g)' }, icon: '🍫', calories: 110, protein: 2, carbs: 8, fat: 8 },
            { name: { tr: 'Grissini (3 adet)', en: 'Breadsticks (3 pcs)' }, icon: '🥖', calories: 90, protein: 2, carbs: 16, fat: 2 },
            { name: { tr: 'Protein Bar', en: 'Protein Bar' }, icon: '💪', calories: 200, protein: 20, carbs: 22, fat: 8 },
            { name: { tr: 'Fıstık Ezmesi (1 yk)', en: 'Peanut Butter (1 tbsp)' }, icon: '🥜', calories: 94, protein: 4, carbs: 3, fat: 8 },
            { name: { tr: 'Pirinç Patlağı (30g)', en: 'Rice Cakes (30g)' }, icon: '🍘', calories: 110, protein: 2, carbs: 24, fat: 0 },
            { name: { tr: 'Yer Fıstığı (30g)', en: 'Peanuts (30g)' }, icon: '🥜', calories: 170, protein: 7, carbs: 5, fat: 14 },
            { name: { tr: 'Kaju (30g)', en: 'Cashews (30g)' }, icon: '🌰', calories: 163, protein: 5, carbs: 9, fat: 13 },
            { name: { tr: 'Humus (50g)', en: 'Hummus (50g)' }, icon: '🫘', calories: 83, protein: 4, carbs: 7, fat: 5 },
            { name: { tr: 'Chia Tohumu (15g)', en: 'Chia Seeds (15g)' }, icon: '🌿', calories: 73, protein: 2, carbs: 6, fat: 5 },
            { name: { tr: 'Kuru Üzüm (30g)', en: 'Raisins (30g)' }, icon: '🍇', calories: 90, protein: 1, carbs: 24, fat: 0 },
            { name: { tr: 'Hurma (2 adet)', en: 'Dates (2 pcs)' }, icon: '🟤', calories: 110, protein: 1, carbs: 29, fat: 0 },
        ]
    },
    {
        id: 'drinks', icon: '☕',
        items: [
            { name: { tr: 'Türk Kahvesi', en: 'Turkish Coffee' }, icon: '☕', calories: 5, protein: 0, carbs: 1, fat: 0, trOnly: true },
            { name: { tr: 'Çay (şekersiz)', en: 'Tea (unsweetened)' }, icon: '🍵', calories: 2, protein: 0, carbs: 0, fat: 0 },
            { name: { tr: 'Çay (1 şekerli)', en: 'Tea (1 sugar)' }, icon: '🍵', calories: 22, protein: 0, carbs: 5, fat: 0 },
            { name: { tr: 'Latte', en: 'Latte' }, icon: '☕', calories: 150, protein: 8, carbs: 12, fat: 7 },
            { name: { tr: 'Portakal Suyu', en: 'Orange Juice' }, icon: '🧃', calories: 112, protein: 2, carbs: 26, fat: 0 },
            { name: { tr: 'Kola (330ml)', en: 'Cola (330ml)' }, icon: '🥤', calories: 140, protein: 0, carbs: 39, fat: 0 },
            { name: { tr: 'Protein Shake', en: 'Protein Shake' }, icon: '🥤', calories: 180, protein: 25, carbs: 8, fat: 4 },
            { name: { tr: 'Americano', en: 'Americano' }, icon: '☕', calories: 15, protein: 0, carbs: 3, fat: 0 },
            { name: { tr: 'Cappuccino', en: 'Cappuccino' }, icon: '☕', calories: 120, protein: 6, carbs: 10, fat: 5 },
            { name: { tr: 'Smoothie (meyve)', en: 'Fruit Smoothie' }, icon: '🥤', calories: 180, protein: 2, carbs: 40, fat: 1 },
            { name: { tr: 'Yeşil Çay', en: 'Green Tea' }, icon: '🍵', calories: 2, protein: 0, carbs: 0, fat: 0 },
            { name: { tr: 'Badem Sütü (200ml)', en: 'Almond Milk (200ml)' }, icon: '🥛', calories: 30, protein: 1, carbs: 1, fat: 3 },
            { name: { tr: 'Soda (330ml)', en: 'Soda (330ml)' }, icon: '🥤', calories: 0, protein: 0, carbs: 0, fat: 0 },
            { name: { tr: 'Limonata (1 bardak)', en: 'Lemonade (1 glass)' }, icon: '🍋', calories: 100, protein: 0, carbs: 26, fat: 0 },
        ]
    },
    {
        id: 'fastfood', icon: '🍔',
        items: [
            { name: { tr: 'Hamburger', en: 'Hamburger' }, icon: '🍔', calories: 540, protein: 25, carbs: 40, fat: 30 },
            { name: { tr: 'Cheeseburger', en: 'Cheeseburger' }, icon: '🍔', calories: 600, protein: 30, carbs: 42, fat: 33 },
            { name: { tr: 'Pizza (1 dilim)', en: 'Pizza (1 slice)' }, icon: '🍕', calories: 285, protein: 12, carbs: 36, fat: 10 },
            { name: { tr: 'Döner (1 porsiyon)', en: 'Doner Kebab (1 serving)' }, icon: '🥙', calories: 450, protein: 25, carbs: 40, fat: 22, trOnly: true },
            { name: { tr: 'Lahmacun', en: 'Turkish Lahmacun' }, icon: '🫓', calories: 280, protein: 12, carbs: 35, fat: 10, trOnly: true },
            { name: { tr: 'Patates Kızartması (orta)', en: 'French Fries (medium)' }, icon: '🍟', calories: 365, protein: 4, carbs: 48, fat: 17 },
            { name: { tr: 'Tavuk Nugget (6 adet)', en: 'Chicken Nuggets (6 pcs)' }, icon: '🍗', calories: 280, protein: 14, carbs: 18, fat: 17 },
            { name: { tr: 'Hot Dog', en: 'Hot Dog' }, icon: '🌭', calories: 290, protein: 11, carbs: 24, fat: 17 },
            { name: { tr: 'Dürüm', en: 'Turkish Wrap (Dürüm)' }, icon: '🌯', calories: 550, protein: 28, carbs: 45, fat: 28, trOnly: true },
            { name: { tr: 'Pide (1 dilim)', en: 'Turkish Pide (1 slice)' }, icon: '🫓', calories: 320, protein: 14, carbs: 38, fat: 12, trOnly: true },
            { name: { tr: 'Taco (1 adet)', en: 'Taco (1 pc)' }, icon: '🌮', calories: 210, protein: 9, carbs: 21, fat: 10 },
            { name: { tr: 'Burrito', en: 'Burrito' }, icon: '🌯', calories: 500, protein: 20, carbs: 55, fat: 22 },
            { name: { tr: 'Falafel (4 adet)', en: 'Falafel (4 pcs)' }, icon: '🧆', calories: 220, protein: 8, carbs: 26, fat: 10 },
            { name: { tr: 'Kebap (Adana, 1 porsiyon)', en: 'Adana Kebab (1 serving)' }, icon: '🥩', calories: 380, protein: 30, carbs: 2, fat: 28, trOnly: true },
        ]
    },
    {
        id: 'desserts', icon: '🍰',
        items: [
            { name: { tr: 'Baklava (1 dilim)', en: 'Baklava (1 slice)' }, icon: '🍯', calories: 310, protein: 5, carbs: 35, fat: 18, trOnly: true },
            { name: { tr: 'Sütlaç (1 porsiyon)', en: 'Rice Pudding (1 serving)' }, icon: '🍮', calories: 200, protein: 5, carbs: 35, fat: 4, trOnly: true },
            { name: { tr: 'Künefe (1 porsiyon)', en: 'Künefe (1 serving)' }, icon: '🧀', calories: 450, protein: 10, carbs: 50, fat: 24, trOnly: true },
            { name: { tr: 'Dondurma (1 top)', en: 'Ice Cream (1 scoop)' }, icon: '🍦', calories: 137, protein: 2, carbs: 16, fat: 7 },
            { name: { tr: 'Çikolatalı Kek (1 dilim)', en: 'Chocolate Cake (1 slice)' }, icon: '🍰', calories: 350, protein: 4, carbs: 50, fat: 15 },
            { name: { tr: 'Puding (1 porsiyon)', en: 'Pudding (1 serving)' }, icon: '🍮', calories: 170, protein: 4, carbs: 28, fat: 5 },
            { name: { tr: 'Brownie', en: 'Brownie' }, icon: '🟫', calories: 280, protein: 3, carbs: 36, fat: 14 },
            { name: { tr: 'Cheesecake (1 dilim)', en: 'Cheesecake (1 slice)' }, icon: '🍰', calories: 400, protein: 6, carbs: 40, fat: 24 },
            { name: { tr: 'Kurabiye (2 adet)', en: 'Cookies (2 pcs)' }, icon: '🍪', calories: 160, protein: 2, carbs: 22, fat: 7 },
            { name: { tr: 'Tiramisu (1 porsiyon)', en: 'Tiramisu (1 serving)' }, icon: '🍰', calories: 450, protein: 7, carbs: 42, fat: 28 },
            { name: { tr: 'Lokum (3 adet)', en: 'Turkish Delight (3 pcs)' }, icon: '🟣', calories: 100, protein: 0, carbs: 24, fat: 0, trOnly: true },
        ]
    },
    {
        id: 'salads', icon: '🥗',
        items: [
            { name: { tr: 'Çoban Salata', en: 'Shepherd Salad' }, icon: '🥗', calories: 80, protein: 2, carbs: 10, fat: 4, trOnly: true },
            { name: { tr: 'Sezar Salata', en: 'Caesar Salad' }, icon: '🥗', calories: 350, protein: 15, carbs: 15, fat: 25 },
            { name: { tr: 'Yunan Salatası', en: 'Greek Salad' }, icon: '🥗', calories: 200, protein: 6, carbs: 12, fat: 14 },
            { name: { tr: 'Ton Balıklı Salata', en: 'Tuna Salad' }, icon: '🐟', calories: 280, protein: 25, carbs: 8, fat: 16 },
            { name: { tr: 'Tavuklu Salata', en: 'Chicken Salad' }, icon: '🍗', calories: 300, protein: 28, carbs: 10, fat: 16 },
            { name: { tr: 'Mercimek Salatası', en: 'Lentil Salad' }, icon: '🫘', calories: 180, protein: 10, carbs: 28, fat: 3 },
            { name: { tr: 'Akdeniz Salatası', en: 'Mediterranean Salad' }, icon: '🥗', calories: 220, protein: 5, carbs: 14, fat: 16 },
        ]
    },
    {
        id: 'seafood', icon: '🐟',
        items: [
            { name: { tr: 'Levrek (100g)', en: 'Sea Bass (100g)' }, icon: '🐟', calories: 97, protein: 20, carbs: 0, fat: 2 },
            { name: { tr: 'Çipura (100g)', en: 'Sea Bream (100g)' }, icon: '🐟', calories: 100, protein: 20, carbs: 0, fat: 2 },
            { name: { tr: 'Hamsi (100g)', en: 'Anchovy (100g)' }, icon: '🐟', calories: 131, protein: 20, carbs: 0, fat: 5, trOnly: true },
            { name: { tr: 'Kalamar (100g)', en: 'Calamari (100g)' }, icon: '🦑', calories: 92, protein: 16, carbs: 3, fat: 1 },
            { name: { tr: 'Midye Dolma (5 adet)', en: 'Stuffed Mussels (5 pcs)' }, icon: '🐚', calories: 250, protein: 12, carbs: 30, fat: 8, trOnly: true },
            { name: { tr: 'Sushi (6 adet)', en: 'Sushi (6 pcs)' }, icon: '🍣', calories: 250, protein: 12, carbs: 38, fat: 4 },
        ]
    },
    {
        id: 'international', icon: '🌍',
        items: [
            { name: { tr: 'Pad Thai', en: 'Pad Thai' }, icon: '🍜', calories: 400, protein: 16, carbs: 50, fat: 14 },
            { name: { tr: 'Ramen', en: 'Ramen' }, icon: '🍜', calories: 450, protein: 18, carbs: 55, fat: 16 },
            { name: { tr: 'Fried Rice (pişmiş pilav)', en: 'Fried Rice' }, icon: '🍚', calories: 340, protein: 10, carbs: 48, fat: 12 },
            { name: { tr: 'Tom Yum Çorba', en: 'Tom Yum Soup' }, icon: '🍲', calories: 120, protein: 8, carbs: 12, fat: 4 },
            { name: { tr: 'Curry (tavuklu)', en: 'Chicken Curry' }, icon: '🍛', calories: 400, protein: 22, carbs: 30, fat: 22 },
            { name: { tr: 'Dim Sum (4 adet)', en: 'Dim Sum (4 pcs)' }, icon: '🥟', calories: 200, protein: 8, carbs: 24, fat: 8 },
            { name: { tr: 'Nachos (peynirli)', en: 'Nachos (with cheese)' }, icon: '🌮', calories: 350, protein: 10, carbs: 38, fat: 18 },
            { name: { tr: 'Gyoza (5 adet)', en: 'Gyoza (5 pcs)' }, icon: '🥟', calories: 230, protein: 10, carbs: 28, fat: 9 },
            { name: { tr: 'Pho (Vietnam çorbası)', en: 'Pho (Vietnamese soup)' }, icon: '🍜', calories: 350, protein: 20, carbs: 40, fat: 10 },
            { name: { tr: 'Empanada (1 adet)', en: 'Empanada (1 pc)' }, icon: '🥟', calories: 280, protein: 10, carbs: 30, fat: 13 },
            { name: { tr: 'Bibimbap', en: 'Bibimbap' }, icon: '🍚', calories: 490, protein: 22, carbs: 60, fat: 16 },
        ]
    },
    {
        id: 'sauces', icon: '🫙',
        items: [
            { name: { tr: 'Zeytinyağı (1 yk)', en: 'Olive Oil (1 tbsp)' }, icon: '🫒', calories: 119, protein: 0, carbs: 0, fat: 14 },
            { name: { tr: 'Mayonez (1 yk)', en: 'Mayonnaise (1 tbsp)' }, icon: '🫙', calories: 94, protein: 0, carbs: 0, fat: 10 },
            { name: { tr: 'Ketçap (1 yk)', en: 'Ketchup (1 tbsp)' }, icon: '🟥', calories: 20, protein: 0, carbs: 5, fat: 0 },
            { name: { tr: 'Hardal (1 yk)', en: 'Mustard (1 tbsp)' }, icon: '🟡', calories: 10, protein: 1, carbs: 1, fat: 1 },
            { name: { tr: 'Soya Sosu (1 yk)', en: 'Soy Sauce (1 tbsp)' }, icon: '🟫', calories: 9, protein: 1, carbs: 1, fat: 0 },
            { name: { tr: 'Ranch Sos (1 yk)', en: 'Ranch Dressing (1 tbsp)' }, icon: '🫙', calories: 73, protein: 0, carbs: 1, fat: 8 },
            { name: { tr: 'Nar Ekşisi (1 yk)', en: 'Pomegranate Molasses (1 tbsp)' }, icon: '🟥', calories: 40, protein: 0, carbs: 10, fat: 0, trOnly: true },
            { name: { tr: 'Tahin (1 yk)', en: 'Tahini (1 tbsp)' }, icon: '🟤', calories: 89, protein: 3, carbs: 3, fat: 8 },
        ]
    },
];

// Filter items by language (trOnly items hidden in English)
export const filterFoodsByLang = (items: FoodItem[], lang: 'tr' | 'en'): FoodItem[] => {
    if (lang === 'tr') return items;
    return items.filter(item => !item.trOnly);
};

// Get full database filtered by language
export const getFoodDatabase = (lang: 'tr' | 'en'): FoodCategory[] => {
    return FOOD_DATABASE.map(cat => ({
        ...cat,
        items: filterFoodsByLang(cat.items, lang),
    })).filter(cat => cat.items.length > 0);
};

// Pre-computed popular foods filtered by language
export const getPopularFoods = (lang: 'tr' | 'en' = 'en'): FoodItem[] => {
    return filterFoodsByLang(FOOD_DATABASE.flatMap(c => c.items), lang).slice(0, 16);
};

// Quick-add foods
export const getQuickFoods = (): FoodItem[] => [
    FOOD_DATABASE[0].items[0],  // Boiled Egg
    FOOD_DATABASE[1].items[0],  // Chicken Breast
    FOOD_DATABASE[2].items[0],  // Rice
    { name: { tr: 'Salata', en: 'Salad' }, icon: '🥗', calories: 120, protein: 3, carbs: 12, fat: 7 },
    FOOD_DATABASE[3].items[0],  // Yogurt
    FOOD_DATABASE[2].items[2],  // Bread
    FOOD_DATABASE[6].items[0],  // Lentil Soup
    FOOD_DATABASE[4].items[1],  // Banana
];

// Helper to resolve food name based on language
export const resolveFoodName = (item: FoodItem, lang: 'tr' | 'en'): string => {
    return item.name[lang] || item.name.tr;
};

// Helper to resolve a food item fully
export const resolveFood = (item: FoodItem, lang: 'tr' | 'en'): ResolvedFoodItem => ({
    name: resolveFoodName(item, lang),
    icon: item.icon,
    calories: item.calories,
    protein: item.protein,
    carbs: item.carbs,
    fat: item.fat,
});
