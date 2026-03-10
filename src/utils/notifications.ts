import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// ─── Configuration ──────────────────────────────────────────

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

const STORAGE_KEY = '@nutritrack_notif_scheduled';

// ─── Types ──────────────────────────────────────────────────

type Lang = 'tr' | 'en';

type NotificationMessages = {
    [key: string]: { tr: { title: string; body: string }; en: { title: string; body: string } };
};

// ─── Notification Messages ──────────────────────────────────

const MESSAGES: NotificationMessages = {
    morning_motivation: {
        tr: { title: '✨ Yeni Bir Gün!', body: 'Yeni bir gün, yeni bir fırsat! Bugün hedefine ulaş 💪' },
        en: { title: '✨ New Day!', body: 'New day, new opportunity! Reach your goal today 💪' },
    },
    breakfast: {
        tr: { title: '🌅 Günaydın!', body: 'Kahvaltını kaydetmeyi unutma! Güne enerjik başla.' },
        en: { title: '🌅 Good Morning!', body: "Don't forget to log your breakfast! Start your day right." },
    },
    lunch: {
        tr: { title: '☀️ Öğle Vakti!', body: 'Öğle yemeğini kaydettin mi? Hadi ekle!' },
        en: { title: '☀️ Lunch Time!', body: 'Did you log your lunch? Add it now!' },
    },
    dinner: {
        tr: { title: '🌙 Akşam Yemeği', body: 'Akşam yemeğini kaydetmeyi unutma!' },
        en: { title: '🌙 Dinner Time', body: "Don't forget to log your dinner!" },
    },
    water_reminder: {
        tr: { title: '💧 Su İç!', body: 'Su içmeyi unutma! Hedefe ulaşmak için devam et.' },
        en: { title: '💧 Drink Water!', body: 'Stay hydrated! Keep going to reach your goal.' },
    },
    water_status: {
        tr: { title: '💧 Günlük Su Durumu', body: 'Bugün {{current}}/{{target}} bardak su içtin. Hedefe az kaldı!' },
        en: { title: '💧 Daily Water Status', body: "You've had {{current}}/{{target}} glasses today. Almost there!" },
    },
    streak_protect: {
        tr: { title: '🔥 Serin Kırılmasın!', body: 'Bugün henüz kayıt yapmadın! {{streak}} günlük serin kırılmasın.' },
        en: { title: '🔥 Protect Your Streak!', body: "You haven't logged today! Don't break your {{streak}}-day streak." },
    },
    weekly_summary: {
        tr: { title: '📊 Haftalık Özet', body: 'Bu haftanın istatistiklerini görmek için gel!' },
        en: { title: '📊 Weekly Summary', body: 'Check out your weekly stats!' },
    },
    goal_proximity: {
        tr: { title: '🎯 Hedefe Çok Yakınsın!', body: 'Günlük kalori hedefine sadece {{remaining}} kcal kaldı! Devam et!' },
        en: { title: '🎯 Almost There!', body: 'Only {{remaining}} kcal left to reach your daily goal! Keep going!' },
    },
};

// ─── Permission ─────────────────────────────────────────────

export async function requestNotificationPermission(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'NutriTrack',
            importance: Notifications.AndroidImportance.DEFAULT,
            vibrationPattern: [0, 250, 250, 250],
        });
    }

    return finalStatus === 'granted';
}

// ─── Schedule Helpers ───────────────────────────────────────

async function cancelAllScheduled() {
    await Notifications.cancelAllScheduledNotificationsAsync();
}

function scheduleDailyAt(hour: number, minute: number, id: string, lang: Lang) {
    const msg = MESSAGES[id];
    if (!msg) return;

    return Notifications.scheduleNotificationAsync({
        content: {
            title: msg[lang].title,
            body: msg[lang].body,
            data: { type: id },
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour,
            minute,
        },
    });
}

function scheduleWeeklyAt(hour: number, minute: number, weekday: number, id: string, lang: Lang) {
    const msg = MESSAGES[id];
    if (!msg) return;

    return Notifications.scheduleNotificationAsync({
        content: {
            title: msg[lang].title,
            body: msg[lang].body,
            data: { type: id },
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            hour,
            minute,
            weekday, // 1=Sunday, 2=Monday, ..., 7=Saturday in expo
        },
    });
}

// ─── Main Scheduling Function ───────────────────────────────

export type NotificationState = {
    lang: Lang;
    waterGlasses: number;
    waterTarget: number;
    streak: number;
    hasMealsToday: boolean;
    consumedCalories: number;
    targetCalories: number;
};

export async function scheduleAllNotifications(state: NotificationState) {
    const { lang, waterGlasses, waterTarget, streak, hasMealsToday, consumedCalories, targetCalories } = state;

    // Cancel all existing scheduled notifications first
    await cancelAllScheduled();

    const promises: Promise<any>[] = [];

    // #10 — Morning motivation (07:30)
    promises.push(scheduleDailyAt(7, 30, 'morning_motivation', lang)!);

    // #1 — Breakfast reminder (08:00)
    promises.push(scheduleDailyAt(8, 0, 'breakfast', lang)!);

    // #2 — Lunch reminder (12:30)
    promises.push(scheduleDailyAt(12, 30, 'lunch', lang)!);

    // #3 — Dinner reminder (19:00)
    promises.push(scheduleDailyAt(19, 0, 'dinner', lang)!);

    // #4 — Water reminders (10:00, 14:00, 16:00) — skip if water goal already met
    if (waterGlasses < waterTarget) {
        promises.push(scheduleDailyAt(10, 0, 'water_reminder', lang)!);
        promises.push(scheduleDailyAt(14, 0, 'water_reminder', lang)!);
        promises.push(scheduleDailyAt(16, 0, 'water_reminder', lang)!);
    }

    // #5 — Water status (20:00) — skip if water goal already met
    if (waterGlasses < waterTarget) {
        const waterMsg = MESSAGES.water_status[lang];
        promises.push(
            Notifications.scheduleNotificationAsync({
                content: {
                    title: waterMsg.title,
                    body: waterMsg.body
                        .replace('{{current}}', String(waterGlasses))
                        .replace('{{target}}', String(waterTarget)),
                    data: { type: 'water_status' },
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DAILY,
                    hour: 20,
                    minute: 0,
                },
            })
        );
    }

    // #6 — Streak protection (21:00) — only if no meals logged today
    if (!hasMealsToday && streak > 0) {
        const streakMsg = MESSAGES.streak_protect[lang];
        promises.push(
            Notifications.scheduleNotificationAsync({
                content: {
                    title: streakMsg.title,
                    body: streakMsg.body.replace('{{streak}}', String(streak)),
                    data: { type: 'streak_protect' },
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DAILY,
                    hour: 21,
                    minute: 0,
                },
            })
        );
    }

    // #7 — Weekly summary (Sunday 10:00)
    promises.push(scheduleWeeklyAt(10, 0, 1, 'weekly_summary', lang)!); // 1 = Sunday

    // #8 — Goal proximity — triggered dynamically, not scheduled here
    // (handled in checkGoalProximity below)

    await Promise.all(promises.filter(Boolean));
    await AsyncStorage.setItem(STORAGE_KEY, new Date().toISOString());
}

// ─── Dynamic: Goal Proximity (#8) ──────────────────────────

let goalNotifSentToday = false;
let lastGoalNotifDate = '';

export async function checkGoalProximity(
    consumedCalories: number,
    targetCalories: number,
    lang: Lang
) {
    // Reset flag on new day
    const today = new Date().toISOString().split('T')[0];
    if (lastGoalNotifDate !== today) {
        goalNotifSentToday = false;
        lastGoalNotifDate = today;
    }

    if (goalNotifSentToday) return;
    if (targetCalories <= 0) return;

    const remaining = targetCalories - consumedCalories;
    const ratio = consumedCalories / targetCalories;

    // Send when between 80%-99% of goal
    if (ratio >= 0.8 && ratio < 1.0 && remaining > 0) {
        goalNotifSentToday = true;
        const msg = MESSAGES.goal_proximity[lang];
        await Notifications.scheduleNotificationAsync({
            content: {
                title: msg.title,
                body: msg.body.replace('{{remaining}}', String(remaining)),
                data: { type: 'goal_proximity' },
            },
            trigger: null, // Immediate
        });
    }
}
