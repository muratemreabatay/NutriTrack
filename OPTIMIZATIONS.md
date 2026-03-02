# NutriTrack — Full Optimization Audit

> **Audited**: 21 source files across `src/` (screens, components, context, navigation, utils)
> **Framework**: React Native (Expo 54) + NativeWind + AsyncStorage

---

## 1) Optimization Summary

### Current Health
The app is a mid-stage MVP with reasonable architecture. The biggest risks are in **state management / storage growth**, **unnecessary re-renders**, and **unprotected API calls**. No critical showstoppers, but several medium-severity issues will degrade UX and maintainability as usage scales.

### Top 3 Highest-Impact Improvements
1. **Unbounded `allMeals` growth** — every meal ever added is kept in a single `AsyncStorage` key with no pagination or pruning. After months of use this will cause multi-second startup times and OOM risk.
2. **Context re-renders cascade** — a single monolithic `CalorieContext` with 15+ state values means *every* state change (e.g. adding water) re-renders every subscribed screen.
3. **Base64 image in API payload** — the full uncompressed base64 image is held in memory and sent over the network without size limits, causing latency spikes and potential crashes on large photos.

### Biggest Risk If No Changes Are Made
Startup time and memory usage will degrade linearly with each day of use because `allMeals` and `mealHistory` grow without bounds in `AsyncStorage`.

---

## 2) Findings (Prioritized)

---

### F1: Unbounded `allMeals` Storage Growth
- **Category**: Memory / I/O / Storage
- **Severity**: Critical
- **Impact**: Startup latency, memory usage, storage quota
- **Evidence**: `CalorieContext.tsx` L308–L321 — `allMeals` is loaded in full from `AsyncStorage` on every app launch. L468–L470 — every `addMeal` appends without limit.
- **Why it's inefficient**: `AsyncStorage.getItem` deserializes the entire JSON blob into memory. At 60 meals/day for 6 months, this is ~10,800 entries × ~200B = ~2 MB of JSON parsed on every cold start. `JSON.parse` of 2 MB on a low-end Android device takes 200–500 ms.
- **Recommended fix**: 
  - Store meals by date key (e.g. `@meals_2026-03-02`) instead of one monolithic key.
  - On load, only fetch the current date's meals. Fetch historical data lazily when navigating to CalendarScreen.
  - Prune old data (e.g. keep only 90 days in storage, archive older data or discard).
- **Tradeoffs / Risks**: Requires storage migration logic for existing users.
- **Expected impact estimate**: 60–80% reduction in startup latency after 3+ months of use.
- **Removal Safety**: Needs Verification (migration required)
- **Reuse Scope**: Module (CalorieContext + CalendarScreen)

---

### F2: Monolithic Context Causes Excessive Re-renders
- **Category**: CPU / Frontend
- **Severity**: High
- **Impact**: Frame drops, UI jank, battery drain
- **Evidence**: `CalorieContext.tsx` — single `CalorieContext.Provider` with 15+ state values. `DashboardScreen.tsx` L40 — destructures 10 values from context. `WaterTrackerScreen.tsx` L10 — only needs water state but subscribes to everything.
- **Why it's inefficient**: Every `setWaterGlasses`, `setConsumed`, or `setMealHistory` call triggers a re-render in **every** component that calls `useCalories()`, including screens that don't use the changed value.
- **Recommended fix**:
  - Split into focused contexts: `WaterContext`, `MealContext`, `ProfileContext`, `BadgeContext`.
  - Or use `useMemo` to split the provider value into stable sub-objects and compose separate hooks (e.g. `useWater()`, `useMeals()`, `useProfile()`).
  - Alternative: migrate to Zustand or Jotai for atomic state slices (both are <5KB).
- **Tradeoffs / Risks**: Moderate refactor; component API changes.
- **Expected impact estimate**: 40–60% fewer re-renders on DashboardScreen during water tracking.
- **Removal Safety**: Likely Safe
- **Reuse Scope**: Service-wide

---

### F3: Base64 Image Loaded Fully Into Memory for API Call
- **Category**: Memory / Network
- **Severity**: High
- **Impact**: Memory spikes (50–100 MB for a 12 MP photo), potential OOM crash, slow API request
- **Evidence**: `CameraScreen.tsx` L50 — `FileSystem.readAsStringAsync(uri, { encoding: 'base64' })` reads full image into a JS string. L73 — the entire base64 string is then embedded in a JSON body.
- **Why it's inefficient**: A 3 MB JPEG becomes ~4 MB base64, held twice in memory (original + JSON-serialized). On low-RAM devices this can trigger garbage collection pauses or crashes.
- **Recommended fix**:
  - Resize image before reading (use `expo-image-manipulator` to resize to max 1024px and compress to quality 0.5).
  - Consider uploading the image as `multipart/form-data` or using a streaming upload instead of embedding in JSON.
  - Add a file size guard: if image > 1 MB after resize, warn the user.
- **Tradeoffs / Risks**: Adds a dependency (`expo-image-manipulator`) and slight processing time (~200ms).
- **Expected impact estimate**: 70–90% memory reduction for AI scan, 50% faster API round-trip.
- **Removal Safety**: Safe
- **Reuse Scope**: Local file (CameraScreen)

---

### F4: No Timeout or Abort Controller on OpenRouter API Call
- **Category**: Reliability / Network
- **Severity**: High
- **Impact**: User stuck on infinite loading spinner if network stalls
- **Evidence**: `CameraScreen.tsx` L65–L90 — raw `fetch()` with no timeout, no `AbortController`, no retry logic.
- **Why it's inefficient**: If the API is slow or the network drops mid-request, the scanning animation loops forever until the user force-quits or the OS kills the app.
- **Recommended fix**:
  ```typescript
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  const response = await fetch(url, { ...options, signal: controller.signal });
  clearTimeout(timeout);
  ```
  Also add exponential backoff retry (max 2 retries) before falling back to `FALLBACK_PREDICTIONS`.
- **Tradeoffs / Risks**: None significant.
- **Expected impact estimate**: Eliminates stuck-state bug; improved perceived reliability.
- **Removal Safety**: Safe
- **Reuse Scope**: Local file (CameraScreen)

---

### F5: `getMealsByCategory` Called Multiple Times Per Render in Dashboard
- **Category**: CPU / Algorithm
- **Severity**: Medium
- **Impact**: Redundant iteration, minor frame drops on large meal lists
- **Evidence**: `DashboardScreen.tsx` L78–L94 — `getMealsByCategory` and `getCategoryCalories` each iterate `mealHistory`. In the JSX (L183–L185), both are called per category = 8 full array scans per render.
- **Why it's inefficient**: O(C × N) where C=4 categories and N=meals. Each render does 8 passes over the same array. With 20+ daily meals this becomes noticeable.
- **Recommended fix**: Compute a single `useMemo` that groups meals by category once:
  ```typescript
  const mealsByCategory = useMemo(() => {
    const groups: Record<string, MealEntry[]> = {};
    mealHistory.forEach(m => {
      const cat = m.category || inferCategory(m);
      (groups[cat] ??= []).push(m);
    });
    return groups;
  }, [mealHistory]);
  ```
- **Tradeoffs / Risks**: None.
- **Expected impact estimate**: ~75% reduction in render-time array iteration.
- **Removal Safety**: Safe
- **Reuse Scope**: Local file (DashboardScreen)

---

### F6: `getFilteredFoods` Recomputed on Every Render
- **Category**: CPU / Algorithm
- **Severity**: Medium
- **Impact**: Unnecessary CPU on each keystroke in search
- **Evidence**: `ManualEntryScreen.tsx` L217–L233 — `getFilteredFoods()` called unconditionally at L233 on every render. It does a nested loop over all `FOOD_DATABASE` categories × items.
- **Why it's inefficient**: With 8 categories × 8 items = 64 items, the cost is trivial per-call, but it runs on every state change (portion selection, category toggle, etc.), not just search input changes.
- **Recommended fix**: Wrap in `useMemo(() => getFilteredFoods(), [searchQuery])`.
- **Tradeoffs / Risks**: None.
- **Expected impact estimate**: Eliminates ~50% of unnecessary search computations.
- **Removal Safety**: Safe
- **Reuse Scope**: Local file (ManualEntryScreen)

---

### F7: `Date.now().toString()` as Meal ID — Collision Risk
- **Category**: Reliability
- **Severity**: Medium
- **Impact**: Duplicate IDs if two meals are added within the same millisecond (e.g. quick-add favorites)
- **Evidence**: `CalorieContext.tsx` L452 — `id: Date.now().toString()`. Also L525.
- **Why it's inefficient**: `Date.now()` has millisecond resolution. Rapid successive `addMeal` calls (e.g. programmatic batch or very fast taps) can produce the same ID, causing silent data loss when filtering/removing by ID.
- **Recommended fix**: Use `crypto.randomUUID()` or `Date.now().toString(36) + Math.random().toString(36).slice(2)`.
- **Tradeoffs / Risks**: None. Backward-compatible since IDs are opaque strings.
- **Expected impact estimate**: Eliminates a rare but data-corrupting bug.
- **Removal Safety**: Safe
- **Reuse Scope**: Module (CalorieContext)

---

### F8: `FOOD_DATABASE.flatMap(c => c.items).slice(0, 12)` on Every Render
- **Category**: CPU / Memory
- **Severity**: Low
- **Impact**: Unnecessary array allocation
- **Evidence**: `ManualEntryScreen.tsx` L367 — creates a new 64-element array, then slices to 12, on every render.
- **Why it's inefficient**: Minor, but `FOOD_DATABASE` is static. The flattened + sliced array should be computed once.
- **Recommended fix**: Compute it as a module-level constant:
  ```typescript
  const POPULAR_FOODS = FOOD_DATABASE.flatMap(c => c.items).slice(0, 12);
  ```
- **Tradeoffs / Risks**: None.
- **Expected impact estimate**: Marginal; eliminates one allocation per render.
- **Removal Safety**: Safe
- **Reuse Scope**: Local file

---

### F9: Multiple Individual `persist()` Calls Instead of Batched Writes
- **Category**: I/O
- **Severity**: Medium
- **Impact**: Disk I/O, potential partial-write inconsistency
- **Evidence**: `CalorieContext.tsx` L463–L470 — `addMeal` fires 5 separate `persist()` calls (`CONSUMED`, `CONSUMED_DATE`, `MEAL_HISTORY`, `ALL_MEALS`, + streak/log date). Each is an independent `AsyncStorage.setItem`.
- **Why it's inefficient**: 5 separate async disk writes per meal add. If the app crashes between writes, state can become inconsistent (e.g. consumed updated but meal history not).
- **Recommended fix**: Use `AsyncStorage.multiSet()` to batch all writes into a single atomic operation:
  ```typescript
  await AsyncStorage.multiSet([
    [STORAGE_KEYS.CONSUMED, JSON.stringify(newConsumed)],
    [STORAGE_KEYS.CONSUMED_DATE, today],
    [STORAGE_KEYS.MEAL_HISTORY, JSON.stringify(newHistory)],
    [STORAGE_KEYS.ALL_MEALS, JSON.stringify(newAllMeals)],
  ]);
  ```
- **Tradeoffs / Risks**: Need to handle the `multiSet` error path. Retry logic in `persist()` would need adaptation.
- **Expected impact estimate**: ~60% fewer I/O operations per meal add; improved data consistency.
- **Removal Safety**: Likely Safe
- **Reuse Scope**: Module (CalorieContext)

---

### F10: `persist()` Is Not `useCallback`-Wrapped — Stale Closure Risk
- **Category**: Reliability / Frontend
- **Severity**: Medium
- **Impact**: Potential stale closure bugs; functions referencing old state
- **Evidence**: `CalorieContext.tsx` — `addMeal`, `removeMeal`, `checkBadges`, `addWater`, etc. are all plain functions inside the component body. They capture `consumed`, `mealHistory`, `allMeals`, etc. via closure. None are wrapped in `useCallback`.
- **Why it's inefficient**: Every render creates new function instances. More critically, `checkBadges` (L402) reads `earnedBadges` via closure — if a badge is earned and state updates but the closure hasn't refreshed, duplicate badge awards could occur.
- **Recommended fix**: Wrap core functions in `useCallback` with proper dependencies, or use `useReducer` for state transitions to eliminate closure issues entirely.
- **Tradeoffs / Risks**: Moderate refactor.
- **Expected impact estimate**: Prevents subtle state bugs; minor perf improvement from stable function references.
- **Removal Safety**: Needs Verification
- **Reuse Scope**: Module (CalorieContext)

---

### F11: `dailyHistory` Parsed Twice on Load
- **Category**: CPU / I/O
- **Severity**: Low
- **Impact**: Redundant JSON.parse
- **Evidence**: `CalorieContext.tsx` L274–L287 — when date changes, `dailyHistory` is parsed from storage, modified, and saved. Then at L331–L334, the same key is parsed *again* and used to set state, overwriting the value already set at L286.
- **Why it's inefficient**: Double-parse + the second parse (L332) overwrites the first `setDailyHistory(trimmed)` from L286, making L286 a no-op.
- **Recommended fix**: Remove the second parse block (L331–L334) or reorganize to only parse once and reuse the result.
- **Tradeoffs / Risks**: Need to verify the overwrite order is correct.
- **Expected impact estimate**: Eliminates one unnecessary JSON.parse on day-change.
- **Removal Safety**: Needs Verification
- **Reuse Scope**: Local file

---

### F12: OpenRouter API Key Checked at Module Level on Import
- **Category**: Reliability / Security
- **Severity**: Medium
- **Impact**: Console warning pollution; no runtime guard
- **Evidence**: `CameraScreen.tsx` L21–L24 — `if (!openRouterApiKey)` runs at import time and only logs a `console.warn`. There's no guard before the API call at L65 — if the key is `undefined`, the request will fail with a confusing auth error.
- **Why it's inefficient**: A missing key should prevent the scan button from being tappable or show a clear user-facing error, not silently fail deep in the API call.
- **Recommended fix**: Add a guard at the start of `startAIScan`: if no key, show an `Alert` immediately and return. Optionally disable the "Analiz Et" button if the key is missing.
- **Tradeoffs / Risks**: None.
- **Expected impact estimate**: Better DX and user experience when misconfigured.
- **Removal Safety**: Safe
- **Reuse Scope**: Local file

---

### F13: `WeeklyChart.getWeekData` Recomputed Every Render
- **Category**: CPU
- **Severity**: Low
- **Impact**: Minor redundant computation
- **Evidence**: `WeeklyChart.tsx` L21–L48 — `getWeekData()` called directly at L48 on every render, iterating 7 days and scanning `dailyHistory` with `.find()` for each.
- **Why it's inefficient**: O(7 × H) where H = history length (up to 30). Trivial cost, but should be memoized since props (`dailyHistory`, `todayCalories`) are the only dependencies.
- **Recommended fix**: `const weekData = useMemo(() => getWeekData(), [dailyHistory, todayCalories, targetCalories]);`
- **Tradeoffs / Risks**: None.
- **Expected impact estimate**: Marginal.
- **Removal Safety**: Safe
- **Reuse Scope**: Local file

---

### F14: `CalendarScreen.dateHasMeals` Called Per-Day-Cell Without Memoization
- **Category**: CPU / Algorithm
- **Severity**: Medium
- **Impact**: O(D × M) where D = days in month, M = total all-time meals
- **Evidence**: `CalendarScreen.tsx` L66 — `dateHasMeals` calls `getMealsForDate` which filters the entire `allMeals` array. Called 28–31 times per render (once per day cell in the month grid).
- **Why it's inefficient**: For a user with 500 historical meals, that's 31 × 500 = 15,500 comparisons per render, plus date string construction per item.
- **Recommended fix**: Pre-compute a `Set<string>` of dates that have meals:
  ```typescript
  const datesWithMeals = useMemo(
    () => new Set(allMeals.map(m => m.timestamp.split('T')[0])),
    [allMeals]
  );
  const dateHasMeals = (d: string) => datesWithMeals.has(d);
  ```
- **Tradeoffs / Risks**: None.
- **Expected impact estimate**: O(M) → O(1) per cell lookup after one-time O(M) set construction.
- **Removal Safety**: Safe
- **Reuse Scope**: Local file

---

### F15: `StreakBadge` Animations Never Cleaned Up on Unmount
- **Category**: Memory / Reliability
- **Severity**: Low
- **Impact**: Potential memory leak from orphaned animation loops
- **Evidence**: `StreakBadge.tsx` L23–L42 — `Animated.loop().start()` is called but no cleanup function is returned from `useEffect`. The animation loops will continue running after the component unmounts.
- **Why it's inefficient**: Orphaned animations hold references to the component's animated values, preventing garbage collection.
- **Recommended fix**: Store the animation reference and call `.stop()` in the cleanup:
  ```typescript
  useEffect(() => {
    const anim = Animated.loop(...);
    anim.start();
    return () => anim.stop();
  }, [streak]);
  ```
- **Tradeoffs / Risks**: None.
- **Expected impact estimate**: Prevents memory leak.
- **Removal Safety**: Safe
- **Reuse Scope**: Local file

---

### F16: Duplicated Meal Category UI Definition (3 Places)
- **Category**: Code Reuse
- **Severity**: Medium
- **Impact**: Maintenance cost, drift risk
- **Evidence**:
  - `DashboardScreen.tsx` L14–L19 — `MEAL_CATEGORIES`
  - `ManualEntryScreen.tsx` L480–L485 — inline meal category array
  - `CalendarScreen.tsx` L258–L263 — inline meal category array
- **Why it's inefficient**: The same `{ id, label, icon }` structure for breakfast/lunch/dinner/snack is defined in 3 places. If a category is renamed or a new one is added, all 3 must be updated.
- **Recommended fix**: Extract to a shared constant in a `constants/` file or in `CalorieContext.tsx`:
  ```typescript
  export const MEAL_CATEGORIES = [
    { id: 'breakfast' as MealCategory, label: 'Kahvaltı', icon: '🌅' },
    ...
  ];
  ```
- **Tradeoffs / Risks**: None.
- **Expected impact estimate**: Eliminates 3-way drift risk.
- **Removal Safety**: Safe
- **Reuse Scope**: Service-wide

---

### F17: Duplicated `QUICK_FOODS` / `FOOD_DATABASE` Overlap
- **Category**: Code Reuse
- **Severity**: Low
- **Impact**: Maintenance drift
- **Evidence**: `CalendarScreen.tsx` L12–L21 `QUICK_FOODS` duplicates items from `ManualEntryScreen.tsx` `FOOD_DATABASE` (e.g. Haşlanmış Yumurta, Pilav, Mercimek Çorbası with identical calorie values).
- **Why it's inefficient**: If nutritional values are updated in one place but not the other, users see inconsistent data.
- **Recommended fix**: Import popular foods from a shared `data/foods.ts` module.
- **Tradeoffs / Risks**: Minor refactor.
- **Expected impact estimate**: Single source of truth for nutritional data.
- **Removal Safety**: Safe
- **Reuse Scope**: Service-wide

---

### F18: Duplicated Activity Level Labels
- **Category**: Code Reuse
- **Severity**: Low
- **Impact**: Drift risk
- **Evidence**:
  - `ProfileScreen.tsx` L9–L15 — `ACTIVITY_LABELS`
  - `SmartOnboardingScreen.tsx` L25–L31 — `ACTIVITY_OPTIONS`
  - `ProfileScreen.tsx` L178–L184 — inline activity array
- **Why it's inefficient**: Activity level labels and icons are defined in 3 places with slightly different structures.
- **Recommended fix**: Centralize in a `constants/activityLevels.ts` shared module.
- **Tradeoffs / Risks**: None.
- **Expected impact estimate**: Eliminates 3-way drift.
- **Removal Safety**: Safe
- **Reuse Scope**: Service-wide

---

### F19: Unused `loadError` State Variable
- **Category**: Dead Code
- **Severity**: Low
- **Impact**: Minor memory; confusion for future developers
- **Evidence**: `CalorieContext.tsx` L236 — `const [loadError, setLoadError] = useState<string | null>(null)`. Set at L341 but never read or displayed anywhere.
- **Why it's inefficient**: Dead state that is set but never consumed.
- **Recommended fix**: Either remove `loadError` / `setLoadError` entirely, or add an error state UI to the loading screen.
- **Tradeoffs / Risks**: None (if removing).
- **Expected impact estimate**: Code cleanup.
- **Removal Safety**: Safe
- **Reuse Scope**: Local file

---

### F20: Unused `ringAnim` in DashboardScreen
- **Category**: Dead Code
- **Severity**: Low
- **Impact**: Minor memory
- **Evidence**: `DashboardScreen.tsx` L45 — `const ringAnim = useRef(new Animated.Value(0)).current;` — created but never used in any animation or JSX.
- **Why it's inefficient**: Allocated Animated.Value that does nothing.
- **Recommended fix**: Remove L45.
- **Tradeoffs / Risks**: None.
- **Expected impact estimate**: Trivial cleanup.
- **Removal Safety**: Safe
- **Reuse Scope**: Local file

---

### F21: Unused `useToast` Hook / `ToastProvider` in App
- **Category**: Dead Code
- **Severity**: Low
- **Impact**: Bundle size; unnecessary context provider in tree
- **Evidence**: `App.tsx` L11 — `ToastProvider` is imported and wraps the app. But `useToast()` is never called in any screen. `ManualEntryScreen` has its own inline toast animation instead of using `AppToast`.
- **Why it's inefficient**: An unused context provider adds a layer to the component tree. The `AppToast` component is never triggered.
- **Recommended fix**: Either remove `ToastProvider` from `App.tsx` and delete `AppToast.tsx`, or refactor `ManualEntryScreen` to use the shared toast.
- **Tradeoffs / Risks**: Choose one toast system.
- **Expected impact estimate**: Cleaner architecture; one fewer re-render layer.
- **Removal Safety**: Safe (if removing) / Needs Verification (if consolidating)
- **Reuse Scope**: Service-wide

---

### F22: `hapticHeavy`, `hapticWarning`, `hapticError` Never Used
- **Category**: Dead Code
- **Severity**: Low
- **Impact**: Minor bundle size
- **Evidence**: `haptics.ts` exports 7 functions. `hapticHeavy` (L17), `hapticWarning` (L27), `hapticError` (L32) are never imported anywhere in the codebase.
- **Why it's inefficient**: Dead exports increase bundle size marginally and clutter the API surface.
- **Recommended fix**: Remove unused exports, or keep if you plan to use them soon (mark with `// TODO: use in error states`).
- **Tradeoffs / Risks**: None.
- **Expected impact estimate**: Trivial cleanup.
- **Removal Safety**: Safe
- **Reuse Scope**: Local file

---

### F23: `targetWeight` in Onboarding Never Persisted or Used
- **Category**: Dead Code
- **Severity**: Low
- **Impact**: UI element collects data that is discarded
- **Evidence**: `SmartOnboardingScreen.tsx` L44 — `const [targetWeight, setTargetWeight] = useState(65)`. The user enters a target weight, but `handleFinish` (L98) never includes it in the profile. `UserProfile` type doesn't have a `targetWeight` field.
- **Why it's inefficient**: User spends time entering data that is immediately lost — bad UX.
- **Recommended fix**: Either add `targetWeight` to `UserProfile` and persist it, or remove the `RulerPicker` for target weight from the onboarding flow.
- **Tradeoffs / Risks**: User-facing decision.
- **Expected impact estimate**: Eliminates misleading UX.
- **Removal Safety**: Needs Verification (UX decision)
- **Reuse Scope**: Module

---

### F24: `goal` State in Onboarding Never Used
- **Category**: Dead Code
- **Severity**: Low
- **Impact**: UI element collects data that is discarded
- **Evidence**: `SmartOnboardingScreen.tsx` L38 — `const [goal, setGoal] = useState<'lose' | 'maintain' | 'gain'>('lose')`. Used in step 0 UI but never passed to `updateProfile` or used in any calculation.
- **Why it's inefficient**: User's selected goal (lose/maintain/gain weight) is collected but not applied to calorie target calculations (e.g. the -300 kcal deficit in `calculateTargets` is hardcoded).
- **Recommended fix**: Wire `goal` into `calculateTargets()` — e.g. lose=-300, maintain=0, gain=+300.
- **Tradeoffs / Risks**: Changes calorie calculations.
- **Expected impact estimate**: Fixes a feature completeness gap.
- **Removal Safety**: Needs Verification
- **Reuse Scope**: Module

---

### F25: Hardcoded Color Values Instead of Theme Constants
- **Category**: Maintainability
- **Severity**: Low
- **Impact**: Maintenance cost when theming
- **Evidence**: Throughout the codebase, colors like `'#030712'`, `'#34D399'`, `'#111827'`, `'#1F2937'` appear as raw hex strings in both `style={}` and `className=""` props. Some screens use NativeWind tokens (`text-primary`, `bg-surface`), others use inline hex.
- **Why it's inefficient**: Inconsistent theming approach. If the design system changes a color, every inline hex must be found and updated manually.
- **Recommended fix**: Standardize on NativeWind tokens via `tailwind.config.js` for all colors. Replace inline `style={{ backgroundColor: '#030712' }}` with `className="bg-background"`.
- **Tradeoffs / Risks**: Large but mechanical refactor.
- **Expected impact estimate**: Improved maintainability; enables dark/light mode toggling.
- **Removal Safety**: Safe
- **Reuse Scope**: Service-wide

---

## 3) Quick Wins (Do First)

| # | Finding | Time | Impact |
|---|---------|------|--------|
| 1 | **F5**: Memoize `getMealsByCategory` in Dashboard | 10 min | Medium |
| 2 | **F6**: Wrap `getFilteredFoods` in `useMemo` | 5 min | Low-Med |
| 3 | **F8**: Extract `POPULAR_FOODS` as constant | 2 min | Low |
| 4 | **F14**: Pre-compute `datesWithMeals` Set | 10 min | Medium |
| 5 | **F15**: Add cleanup to StreakBadge animations | 5 min | Low |
| 6 | **F19**: Remove unused `loadError` state | 2 min | Low |
| 7 | **F20**: Remove unused `ringAnim` | 1 min | Low |
| 8 | **F22**: Remove unused haptic exports | 2 min | Low |
| 9 | **F7**: Fix meal ID generation | 5 min | Medium |
| 10 | **F4**: Add timeout/AbortController to API call | 10 min | High |

---

## 4) Deeper Optimizations (Do Next)

| # | Finding | Effort | Impact |
|---|---------|--------|--------|
| 1 | **F1**: Shard meal storage by date | 3–4 hrs | Critical |
| 2 | **F2**: Split context into focused contexts | 2–3 hrs | High |
| 3 | **F3**: Resize/compress images before API call | 1–2 hrs | High |
| 4 | **F9**: Batch `AsyncStorage.multiSet` | 1 hr | Medium |
| 5 | **F10**: Wrap context functions in `useCallback`/`useReducer` | 2 hrs | Medium |
| 6 | **F16/F17/F18**: Extract shared constants | 1 hr | Medium |
| 7 | **F21**: Consolidate toast systems | 30 min | Low |
| 8 | **F23/F24**: Wire `goal` and `targetWeight` into calculations | 1 hr | Medium |
| 9 | **F25**: Standardize color tokens | 2–3 hrs | Low-Med |

---

## 5) Validation Plan

### Automated Tests
- **Startup benchmark**: Measure `loadData()` time with 100, 1000, and 5000 meals using a test script that pre-populates `AsyncStorage`.
- **Re-render count**: Use React DevTools Profiler or `useRenderCounter()` hook on Dashboard, WaterTracker, and CalendarScreen. Log render counts for: adding water, adding meal, navigating between tabs.
- **Memory profiling**: Use Xcode Instruments (iOS) or Android Studio Profiler to measure heap usage during AI scan with large images (8 MP, 12 MP, 20 MP).

### Manual Verification
- **Regression test**: After each fix, verify:
  - Onboarding → Dashboard flow works
  - Camera scan (with and without API key) works
  - Manual meal entry and removal works
  - Calendar past-date entry works
  - Water tracking persists across app restart
  - Badge earning triggers notification
- **Edge case**: Rapidly tap "Add Water" 20 times → verify no duplicate persistence issues
- **Day-change**: Set device date forward → verify `allMeals` migration and daily reset work correctly

### Metrics to Compare Before/After
| Metric | Tool | Before (expected) | Target |
|--------|------|--------------------|--------|
| Cold start time | Console timer in `loadData` | ~500ms (with 500 meals) | <200ms |
| Dashboard render count on addWater | React DevTools | 1 full re-render | 0 (only WaterTrackerScreen) |
| Memory during AI scan | Xcode Instruments | 80–120 MB spike | <30 MB |
| Disk writes per addMeal | AsyncStorage debug | 5 writes | 1 batched write |

---

## 6) Optimized Code / Patches

### Patch A: Memoized Meal Grouping (F5)
```diff
// DashboardScreen.tsx
+import { useMemo } from 'react';

 const DashboardScreen = () => {
     ...
-    const getMealsByCategory = (categoryId: string) => {
-        return mealHistory.filter(m => { ... });
-    };
-    const getCategoryCalories = (categoryId: string) => {
-        return getMealsByCategory(categoryId).reduce(...);
-    };
+    const mealsByCategory = useMemo(() => {
+        const groups: Record<string, MealEntry[]> = { breakfast: [], lunch: [], dinner: [], snack: [] };
+        mealHistory.forEach(m => {
+            const cat = m.category || inferCategoryByTime(m.timestamp);
+            (groups[cat] ??= []).push(m);
+        });
+        return groups;
+    }, [mealHistory]);
+
+    const getCategoryCalories = (categoryId: string) =>
+        (mealsByCategory[categoryId] || []).reduce((sum, m) => sum + m.nutrients.calories, 0);
```

### Patch B: API Timeout (F4)
```diff
// CameraScreen.tsx — inside startAIScan()
+   const controller = new AbortController();
+   const timeout = setTimeout(() => controller.abort(), 30000);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
+       signal: controller.signal,
        headers: { ... },
        body: JSON.stringify({ ... }),
    });
+   clearTimeout(timeout);
```

### Patch C: Calendar Date Lookup (F14)
```diff
// CalendarScreen.tsx
+import { useMemo } from 'react';

 const CalendarScreen = () => {
     ...
-    const dateHasMeals = (dateStr: string) => getMealsForDate(dateStr).length > 0;
+    const datesWithMeals = useMemo(() => {
+        const set = new Set<string>();
+        allMeals.forEach(m => {
+            const d = new Date(m.timestamp);
+            set.add(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`);
+        });
+        return set;
+    }, [allMeals]);
+    const dateHasMeals = (dateStr: string) => datesWithMeals.has(dateStr);
```

### Patch D: Unique ID Generation (F7)
```diff
// CalorieContext.tsx
-    id: Date.now().toString(),
+    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 9),
```

### Patch E: StreakBadge Cleanup (F15)
```diff
// StreakBadge.tsx
 useEffect(() => {
+    let pulseAnimation: Animated.CompositeAnimation | null = null;
+    let glowAnimation: Animated.CompositeAnimation | null = null;
     if (streak >= 7) {
-        Animated.loop(...).start();
+        pulseAnimation = Animated.loop(...);
+        pulseAnimation.start();
     }
     if (streak >= 14) {
-        Animated.loop(...).start();
+        glowAnimation = Animated.loop(...);
+        glowAnimation.start();
     }
+    return () => {
+        pulseAnimation?.stop();
+        glowAnimation?.stop();
+    };
 }, [streak]);
```
