# AGENTS.md

## Must-follow constraints

- **UI language is Turkish.** All user-facing strings (labels, placeholders, alerts, badge names, food names) must be in Turkish.
- **Never use `yarn` or `pnpm`.** This project uses `npm` only (`package-lock.json` is the lockfile).
- **`react-native-reanimated/plugin` must be the LAST plugin** in `babel.config.js`. Moving it breaks builds silently.
- **NativeWind v2** (not v4). Use `className` strings with Tailwind v3 syntax. Do not use `styled()` wrapper or NativeWind v4 APIs.
- **All state flows through `CalorieContext`** (`src/context/CalorieContext.tsx`). Do not create parallel storage or state systems — add to the existing context or extract sub-contexts from it.
- **AsyncStorage keys are prefixed with `@calorie_`** (see `STORAGE_KEYS` in `CalorieContext.tsx`). Never use bare keys. Changing existing key names will lose user data.
- **Env vars must be prefixed with `EXPO_PUBLIC_`** to be accessible at runtime (Expo convention). The API key is `EXPO_PUBLIC_OPENROUTER_API_KEY` in `.env`.
- **Do not commit `.env`** — it contains the OpenRouter API key.

## Validation before finishing

```bash
npx expo start --clear   # must boot without errors
npx tsc --noEmit         # must pass with zero errors
```

There are no automated tests in this project.

## Repo-specific conventions

- **Entry point**: `index.ts` → `App.tsx` (not default Expo `App.js`). Set via `"main": "index.ts"` in `package.json`.
- **Navigation**: React Navigation v7 with native stack. Screen names are defined in `src/navigation/types.ts` (`RootStackParamList`). New screens must be added there first.
- **Styling**: Mix of NativeWind `className` and inline `style={}` with hardcoded hex colors. Prefer NativeWind tokens from `tailwind.config.js` (`primary`, `secondary`, `accent`, `warning`, `surface`, `background`, `water`).
- **Shared constants**: `src/constants/index.ts` holds `MEAL_CATEGORIES`, `ACTIVITY_LEVELS`, `FOOD_DATABASE`, `QUICK_FOODS`, `POPULAR_FOODS`. Add new shared data there.
- **Persistence**: All data is stored via `@react-native-async-storage/async-storage`. Use the `persist()` helper or `AsyncStorage.multiSet()` for batch writes.
- **Daily reset logic**: `CalorieContext.loadData()` compares stored date to today's date. Consumed calories, water, and meal history reset daily. `allMeals` persists across days.
- **Splash → Onboarding → Main flow**: `App.tsx` shows `SplashScreen`, then `AppNavigator` checks `onboardingComplete` flag to route to onboarding or main tabs.

## Important locations

| What | Path |
|------|------|
| All app state + persistence | `src/context/CalorieContext.tsx` |
| Navigation types | `src/navigation/types.ts` |
| Food database + constants | `src/constants/index.ts` |
| AI food recognition (camera) | `src/screens/CameraScreen.tsx` |
| Tailwind theme tokens | `tailwind.config.js` |
| Known optimizations backlog | `OPTIMIZATIONS.md` |

## Change safety rules

- **Do not rename or remove `STORAGE_KEYS`** without migration logic — this will silently erase user data.
- **Do not change `MealEntry`, `DailyRecord`, or `UserProfile` shapes** without backward-compatible parsing in `loadData()` — old persisted data will crash on `JSON.parse`.
- **Adding new screens**: register in both `src/navigation/types.ts` (type) and `src/navigation/AppNavigator.tsx` (route).

## Known gotchas

- **`allMeals` grows unboundedly** in a single AsyncStorage key. Avoid operations that serialize the entire array on every interaction. See `OPTIMIZATIONS.md` F1.
- **The single monolithic context** causes all screens to re-render on any state change. Be aware when adding new state — consider if it can be memoized or split.
- **`expo-image-manipulator` is already a dependency** but images are not resized before the AI API call. Large photos cause memory spikes.
- **Hardcoded hex colors** (e.g., `#030712`, `#34D399`, `#111827`) appear throughout inline styles. When possible, use the Tailwind tokens instead.
