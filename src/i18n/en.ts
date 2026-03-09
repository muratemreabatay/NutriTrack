// English translations
import type { TranslationKeys } from './tr';

const en: TranslationKeys = {
    // ─── Common ─────────────────────────────────────────────
    common: {
        save: 'SAVE',
        cancel: 'Cancel',
        edit: 'Edit',
        done: 'Done',
        add: 'Add',
        delete: 'Delete',
        confirm: 'Confirm',
        back: '←',
        next: 'Continue',
        start: "Let's Go!",
        great: 'AWESOME!',
        nextBadge: 'NEXT →',
        kcal: 'kcal',
        protein: 'Protein',
        carbs: 'Carbs',
        fat: 'Fat',
        or: 'or enter manually',
    },

    // ─── Splash ─────────────────────────────────────────────
    splash: {
        tagline: 'SMART DIET TRACKING',
        motto: 'Healthy living, every bite 🌿',
    },

    // ─── Welcome ────────────────────────────────────────────
    welcome: {
        title: 'Welcome to NutriTrack',
        subtitle: 'Your smart diet companion',
        selectLanguage: 'Choose your language',
        enterName: 'What should we call you?',
        namePlaceholder: 'Your name',
        getStarted: "Let's Get Started",
    },

    // ─── Onboarding ─────────────────────────────────────────
    onboarding: {
        steps: [
            { title: 'Set Your Goal', subtitle: "Let's create the best plan for you" },
            { title: 'Your Body Type', subtitle: 'Helps us understand your metabolism' },
            { title: 'About You', subtitle: 'We need some info for accurate calculations' },
            { title: 'Your Measurements', subtitle: 'Required for personalized targets' },
            { title: 'Activity Level', subtitle: "Let's calculate your daily energy needs" },
            { title: 'Choose Avatar', subtitle: 'How should you look in the app?' },
        ],
        stepIcons: ['🎯', '🧬', '👤', '📏', '⚡', '🎨'],
        goals: {
            lose: { label: 'Lose Weight', desc: 'Lose weight in a healthy way' },
            maintain: { label: 'Maintain Weight', desc: 'Keep my current weight' },
            gain: { label: 'Gain Weight', desc: 'Build muscle mass and gain weight' },
        },
        bodyTypes: {
            ectomorph: { label: 'Ectomorph', desc: "I have trouble gaining weight" },
            mesomorph: { label: 'Mesomorph', desc: 'I can easily gain or lose weight' },
            endomorph: { label: 'Endomorph', desc: "I have trouble losing weight" },
            unsure: { label: "I'm New", desc: "I'm new to this and not sure" },
        },
        gender: 'Gender',
        male: 'Male',
        female: 'Female',
        age: 'Age',
        ageUnit: 'years',
        height: 'Height',
        heightUnit: 'cm',
        weight: 'Weight',
        weightUnit: 'kg',
        targetWeight: 'Target Weight',
        celebration: 'Awesome!',
        preparing: 'Preparing your plan...',
        avatarTitle: 'Select an avatar or upload your own photo',
    },

    // ─── Activity Levels ────────────────────────────────────
    activity: {
        label: 'Activity',
        sedentary: { label: 'Sedentary', desc: 'Desk job, little movement' },
        light: { label: 'Lightly Active', desc: 'Light walking, light exercise' },
        moderate: { label: 'Moderately Active', desc: 'Exercise 3-5 days/week' },
        active: { label: 'Very Active', desc: 'Intense daily training' },
        extra: { label: 'Professional', desc: '2+ hours of intense sport daily' },
    },

    // ─── Dashboard ──────────────────────────────────────────
    dashboard: {
        greetingMorning: 'Good Morning',
        greetingAfternoon: 'Good Afternoon',
        greetingEvening: 'Good Evening',
        todaySummary: "Today's Summary",
        target: 'Target',
        remaining: 'Remaining',
        eaten: 'eaten',
        meals: 'Meals',
        addMeal: '+ Add Meal',
        aiScan: '📸 AI Scan',
        noMeals: 'No meals added yet',
        deleteMeal: 'Are you sure you want to delete this meal?',
        motivation: {
            low: 'Start your day with energy! 💪',
            mid: "You're doing great! 🔥",
            high: "You're almost there! 🎯",
            done: 'Daily goal completed! 🎉',
            over: 'Over target, be careful! ⚠️',
        },
        goalReachedDesc: 'You completed your daily goal. Keep consistent!',
    },

    // ─── Tabs ───────────────────────────────────────────────
    tabs: {
        daily: 'Daily',
        water: 'Water',
        calendar: 'Calendar',
        profile: 'Profile',
    },

    // ─── Water Tracker ──────────────────────────────────────
    water: {
        title: 'Water Tracking',
        glasses: 'glasses',
        mlDrank: 'ml consumed',
        mlLeft: 'ml remaining',
        messages: {
            start: "Let's drink your first glass! 🥛",
            low: 'Good start, keep going!',
            mid: "You're doing great! 💪",
            high: "You've passed the halfway mark!",
            almost: 'Almost at your goal! 🎯',
            done: 'Daily goal completed! 🎉',
        },
    },

    // ─── Calendar ───────────────────────────────────────────
    calendar: {
        title: 'Calendar',
        subtitle: 'View and edit past meal records',
        today: 'Today',
        addMeal: 'Add Meal',
        quickAdd: 'Quick Add',
        noRecord: 'No records for this day.\nYou can add meals.',
        futureDate: 'Cannot add records for future dates.',
        mealName: 'Meal name',
        dayNames: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        monthNames: ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'],
    },

    // ─── Manual Entry ───────────────────────────────────────
    manual: {
        title: 'Add Meal',
        search: '🔍 Search food...',
        results: 'Results',
        noResults: 'No results found',
        favorites: '❤️ Favorites',
        popular: 'Popular',
        mealName: 'Meal Name',
        caloriesLabel: 'Calories (kcal) *',
        proteinLabel: 'Protein (g)',
        carbsLabel: 'Carbs (g)',
        fatLabel: 'Fat (g)',
        addButton: 'ADD MEAL ✓',
        added: '✓ Added!',
        meals: 'meals',
        portion: 'portion',
        selectPortion: 'Select Portion',
        mealCategory: 'Meal',
        example: 'E.g. Grilled Chicken',
    },

    // ─── Camera / AI ────────────────────────────────────────
    camera: {
        title: 'AI Scan',
        scanning: 'Analyzing...',
        takePhoto: 'Take Photo',
        retake: 'Retake',
        gallery: 'Gallery',
        analyze: 'Analyze',
        aiRecognition: 'AI Food Recognition',
        frameFood: 'Frame the food',
        detecting: 'Detecting food and portion size',
        cameraLoading: 'Loading camera...',
        cameraPermission: 'Camera Permission Required',
        cameraPermissionDesc: 'We need camera access to identify food with AI.',
        grantAccess: 'Grant Camera Access',
        pickGallery: 'Pick from Gallery',
        goBack: 'Go Back',
        apiMissing: 'API Key Missing',
        apiMissingDesc: 'Google AI API key not found in .env file.',
        timeout: 'Timeout',
        timeoutDesc: 'AI service did not respond within 30 seconds. Please try again.',
        aiError: 'AI Analysis Error',
        aiErrorDesc: 'Error connecting to Google AI service.',
        error: 'Error',
        cameraError: 'Camera error. Try selecting from gallery.',
        photoError: 'Could not take photo. Try selecting from gallery.',
        galleryError: 'Could not open gallery.',
        prompt: `You are a witty and friendly dietitian. Identify the food in this photo and return its nutritional values (average portion).
RESPOND ONLY IN JSON FORMAT. Do not use markdown, only return a valid JSON object.
If there's no food in the photo, write "Unknown" for name, set values to 0, and explain what you see in a witty way in the comment.
In the comment field, write a short, witty and friendly comment (you can use emojis). Don't exaggerate but be fun.
Respond entirely in ENGLISH.
Expected JSON format:
{
  "name": "Food Name",
  "calories": 400,
  "protein": 20,
  "carbs": 30,
  "fat": 15,
  "comment": "Witty and friendly AI comment 😋"
}`,
    },

    // ─── Meal Detail ────────────────────────────────────────
    mealDetail: {
        aiComment: '🤖 AI Comment',
        nutrients: 'Nutritional Values',
        addToLog: 'Add to Log',
        close: 'Close',
        aiDetection: 'AI Detection',
        mediumPortion: 'Medium Portion',
        noPhoto: 'No Photo',
        fallbackName: 'Food analyzed.',
    },

    // ─── Profile ────────────────────────────────────────────
    profile: {
        title: 'Profile',
        dayStreak: 'Day Streak',
        badges: 'Badges',
        meals: 'Meals',
        dailyTarget: 'Daily Calorie Target',
        calculated: 'Calculated based on your physical profile',
        achievements: 'Achievements',
        editInfo: 'Edit Information',
        language: 'Language',
        turkish: 'Türkçe',
        english: 'English',
        changeAvatar: 'Change Avatar',
        chooseFromGallery: 'Choose from Gallery',
    },

    // ─── Badges ─────────────────────────────────────────────
    badges: {
        newBadge: 'New Badge!',
        first_meal: { name: 'First Step', desc: 'You logged your first meal!' },
        streak_3: { name: 'Consistent', desc: '3 days in a row' },
        streak_7: { name: 'Week Warrior', desc: '7-day streak!' },
        streak_14: { name: 'Habit Master', desc: '14 days non-stop tracking' },
        streak_30: { name: 'Iron Will', desc: '30 days every single day!' },
        streak_60: { name: 'Gold Streak', desc: '60 days non-stop! Legendary' },
        streak_90: { name: 'Platinum Streak', desc: '90-day streak — true champion!' },
        protein_master: { name: 'Protein Chef', desc: 'Complete your daily protein goal' },
        carb_loader: { name: 'Energy Depot', desc: 'Hit your carb target' },
        fat_balance: { name: 'Fat Balance', desc: 'Reach your fat goal' },
        macro_perfect: { name: 'Perfect Balance', desc: 'Complete all macro goals in one day' },
        cal_500: { name: 'Getting Started', desc: 'Log 500+ kcal in a day' },
        cal_1000: { name: 'Mindful Eating', desc: 'Log 1000+ kcal in a day' },
        cal_1500: { name: 'Tracking Pro', desc: 'Track 1500+ kcal in a day' },
        cal_2000: { name: 'Full Throttle', desc: 'Log 2000+ kcal in a day' },
        goal_reached: { name: 'Goal Reached!', desc: 'Complete your daily calorie goal' },
        early_bird: { name: 'Early Bird', desc: 'Add a meal before 8 AM' },
        night_owl: { name: 'Night Owl', desc: 'Log food after 10 PM' },
        water_champ: { name: 'Water Champion', desc: 'Drink 8 glasses of water a day' },
        meal_logger_5: { name: 'Log Enthusiast', desc: 'Log 5 meals in one day' },
        variety_king: { name: 'Variety King', desc: 'Use all 4 meal categories' },
        weekend_warrior: { name: 'Weekend Warrior', desc: 'Track on weekends too' },
        breakfast_lover: { name: 'Breakfast Lover', desc: 'Add a meal before 10 AM' },
        light_eater: { name: 'Light Meal', desc: 'Log a meal under 300 kcal' },
    },

    // ─── Meal Categories ────────────────────────────────────
    mealCategories: {
        breakfast: 'Breakfast',
        lunch: 'Lunch',
        dinner: 'Dinner',
        snack: 'Snack',
    },

    // ─── Food Database Categories ───────────────────────────
    foodCategories: {
        breakfast: 'Breakfast',
        protein: 'Protein',
        carbs: 'Grains',
        dairy: 'Dairy',
        fruits: 'Fruits',
        vegetables: 'Vegetables',
        soups: 'Soups',
        snacks: 'Snacks',
        drinks: 'Drinks',
        fastfood: 'Fast Food',
        desserts: 'Desserts',
        salads: 'Salads',
        seafood: 'Seafood',
        international: 'International',
        sauces: 'Sauces & Extras',
    },

    // ─── Weekly Chart ───────────────────────────────────────
    weeklyChart: {
        title: 'Weekly Summary',
        average: 'Weekly Avg:',
        dayLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },

    // ─── Streak Labels ──────────────────────────────────────
    streak: {
        legendary: 'Legendary',
        super: 'Super',
        hot: 'Hot',
        good: 'Good',
    },

    // ─── Fallback meal name ─────────────────────────────────
    fallback: {
        mealName: 'Meal',
        manualEntry: 'Manual Entry',
    },
};

export default en;
