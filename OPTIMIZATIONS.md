# NutriTrack — Full Optimization Audit

**Audited:** 2026-03-10
**Scope:** All screens, components, contexts, constants, navigation, i18n

---

## 1) Optimization Summary

**Overall Health:** Moderate — The app works, but has several structural issues that will compound as users accumulate data and the codebase grows.

**Top 3 Highest-Impact Improvements:**

1. **Split the monolithic `CalorieContext`** — Every state change (water tap, meal add, badge unlock) re-renders the _entire_ component tree.
2. **Cap / prune `allMeals` storage** — Currently unbounded, grows forever. After months of use, `loadData()`, `getMealsForDate()`, and CalendarScreen's `datesWithMeals` computation will noticeably lag.
3. **Extract duplicated code** — `renderAvatarDisplay`, `getBadgeName`, `CATEGORY_DEFS`, and `ACTIVITY_LEVELS` are copy-pasted across multiple files, increasing maintenance cost and bug surface.

**Biggest Risk if No Changes:** As `allMeals` grows to thousands of entries, the app will see progressive startup lag (deserializing the full array on every launch), slow calendar view (linear scan per date), and AsyncStorage write failures (storage size limits on some devices).

---

## 2) Findings (Prioritized)

### F1. Monolithic Context Causing Excessive Re-renders

| Field | Value |
|---|---|
| **Category** | Frontend / Memory |
| **Severity** | High |
| **Impact** | Latency, battery, frame drops |
| **Evidence** | `CalorieContext.tsx` exports a single `CalorieContext.Provider` with 15+ state values. Any call to `addWater()`, `toggleFavorite()`, `clearNewBadge()`, etc. triggers `setState` → re-render of **every** consumer: `DashboardScreen`, `ProfileScreen`, `CalendarScreen`, `WaterTrackerScreen`, `ManualEntryScreen`, and all components. |
| **Why it's inefficient** | React context doesn't support partial subscriptions. Consuming `useCalories()` subscribes the component to all 15+ values, even if it only reads `waterGlasses`. |
| **Recommended fix** | **Option A (minimal):** Split into 2–3 contexts: `UserProfileContext` (profile, targets, onboardingComplete), `NutritionContext` (consumed, mealHistory, allMeals, streak, badges), `HydrationContext` (waterGlasses, waterTarget). Each context's state changes re-render only relevant consumers. **Option B (better):** Use Zustand or Jotai with selectors for atomic subscriptions. |
| **Tradeoffs / Risks** | Option A requires threading multiple providers in `App.tsx`, Option B adds a dependency. |
| **Expected impact** | ~40–60% reduction in unnecessary re-renders on water/badge interactions. |
| **Removal Safety** | N/A (refactor) |
| **Reuse Scope** | Service-wide |

---

### F2. Unbounded `allMeals` Storage Growth

| Field | Value |
|---|---|
| **Category** | Memory / I/O / Reliability |
| **Severity** | High |
| **Impact** | Startup latency, AsyncStorage write failures, calendar lag |
| **Evidence** | `CalorieContext.tsx:447–455` — Every meal is appended to `allMeals` and serialized to `STORAGE_KEYS.ALL_MEALS`. No pruning is ever performed. `dailyHistory` is capped at 30 entries (L249), but `allMeals` is not. `getMealsForDate()` (L525–531) does a linear scan of the entire unbounded array. `CalendarScreen.tsx:59–66` builds a `Set` from _all_ meals every time `allMeals` changes. |
| **Why it's inefficient** | After 60 days × 4 meals/day = 240 entries, JSON serialization of the full array on every `addMeal` call will take measurable time. After 1 year (~1,500 entries), it will cause noticeable startup lag and potential AsyncStorage size issues (~500KB+). |
| **Recommended fix** | 1. Cap `allMeals` to the last 90 days (trim entries older than 90 days during `loadData()`). 2. Index meals by date (`Record<string, MealEntry[]>`) instead of flat array to make `getMealsForDate()` O(1) instead of O(N). 3. Consider moving older data to a secondary key (archival). |
| **Tradeoffs / Risks** | Pruning old data means losing historical meal data beyond 90 days. Consider making the cap configurable. |
| **Expected impact** | O(N) → O(1) for `getMealsForDate()`. Startup I/O reduced proportionally to cap. |
| **Removal Safety** | Needs Verification (data migration for existing users) |
| **Reuse Scope** | Module |

---

### F3. Duplicated `renderAvatarDisplay` Function

| Field | Value |
|---|---|
| **Category** | Code Reuse |
| **Severity** | Medium |
| **Impact** | Maintainability, bundle size |
| **Evidence** | Near-identical `renderAvatarDisplay` function exists in: `DashboardScreen.tsx:49–64`, `ProfileScreen.tsx:63–78` (differences: font sizes `18` vs `32`, SVG sizes `20` vs `36`). |
| **Why it's inefficient** | Two copies that can drift. Any avatar display bug must be fixed in both places. |
| **Recommended fix** | Extract to `src/components/AvatarDisplay.tsx` accepting `size` prop (`'sm' | 'lg'`). |
| **Tradeoffs / Risks** | None — pure consolidation. |
| **Expected impact** | ~30 lines removed, single source of truth. |
| **Removal Safety** | Safe |
| **Reuse Scope** | Service-wide |

---

### F4. Duplicated `getBadgeName` / `getBadgeDesc` Functions

| Field | Value |
|---|---|
| **Category** | Code Reuse |
| **Severity** | Medium |
| **Impact** | Maintainability |
| **Evidence** | `DashboardScreen.tsx:117–128` and `ProfileScreen.tsx:95–100` contain identical `getBadgeName` logic. Dashboard also has `getBadgeDesc`. |
| **Recommended fix** | Extract to `src/utils/badges.ts` or `src/constants/badges.ts`. Accept `t.badges` as param: `resolveBadgeName(badge, translations)`. |
| **Tradeoffs / Risks** | None. |
| **Expected impact** | ~20 lines removed, single source of truth. |
| **Removal Safety** | Safe |
| **Reuse Scope** | Service-wide |

---

### F5. Duplicated `CATEGORY_DEFS` / `ACTIVITY_LEVELS` Constants

| Field | Value |
|---|---|
| **Category** | Code Reuse |
| **Severity** | Medium |
| **Impact** | Maintainability |
| **Evidence** | `CATEGORY_DEFS` defined in: `DashboardScreen.tsx:21–26`, `ManualEntryScreen.tsx:18–23`, `CalendarScreen.tsx:10–15`. Each has slightly different shape (`{ id, icon }` vs `{ id, icon, timeRange }`). `ACTIVITY_LEVELS` array is constructed inline in both `ProfileScreen.tsx:86–92` and `SmartOnboardingScreen.tsx:55–61` with identical structure. |
| **Recommended fix** | 1. Move the superset CATEGORY_DEFS to `src/constants/index.ts`. Screens pick what they need. 2. Move ACTIVITY_LEVELS to `src/constants/index.ts` alongside existing `ACTIVITY_MULTIPLIERS`. |
| **Tradeoffs / Risks** | None. |
| **Expected impact** | Eliminates 3 sources of truth for categories, 2 for activity levels. |
| **Removal Safety** | Safe |
| **Reuse Scope** | Service-wide |

---

### F6. `getFoodDatabase()` Called Every Render Without Memoization

| Field | Value |
|---|---|
| **Category** | Algorithm / Frontend |
| **Severity** | Medium |
| **Impact** | CPU on every keystroke during food search |
| **Evidence** | `ManualEntryScreen.tsx:116` — `getFoodDatabase(lang)` is called inside `useMemo` for `searchResults`, but also at L128, L131, and L236 — each of these calls recreates the filtered array. `getFoodDatabase()` maps over all 15 categories and filters items on every invocation. |
| **Why it's inefficient** | ~160 food items × 15 categories mapped and filtered multiple times per render. Language doesn't change during a session. |
| **Recommended fix** | Memoize at the top of the component: `const foodDb = useMemo(() => getFoodDatabase(lang), [lang]);` then use `foodDb` everywhere. Or cache the result inside `getFoodDatabase` itself. |
| **Tradeoffs / Risks** | None. |
| **Expected impact** | ~3x fewer array allocations per render in ManualEntryScreen. |
| **Removal Safety** | Safe |
| **Reuse Scope** | Module |

---

### F7. Missing `useCallback` on Context Functions

| Field | Value |
|---|---|
| **Category** | Frontend |
| **Severity** | Medium |
| **Impact** | Re-renders, referential instability |
| **Evidence** | `CalorieContext.tsx` — `addMeal`, `removeMeal`, `addWater`, `removeWater`, `toggleFavorite`, `isFavorite`, `checkBadges`, `addMealForDate`, `getMealsForDate` are all plain function declarations inside the component body. They are recreated on every render, breaking shallow comparison in consuming components and making `React.memo` ineffective. |
| **Recommended fix** | Wrap all public functions in `useCallback` with correct deps. This is especially important for `addWater`/`removeWater` (called rapidly on taps) and `isFavorite` (called per item in list renders). |
| **Tradeoffs / Risks** | Must correctly list dependencies or use a reducer pattern. |
| **Expected impact** | Enables downstream `React.memo` optimizations. |
| **Removal Safety** | Safe |
| **Reuse Scope** | Module |

---

### F8. Inline Style Objects Recreated Every Render

| Field | Value |
|---|---|
| **Category** | Frontend / Memory |
| **Severity** | Low |
| **Impact** | GC churn, minor perf |
| **Evidence** | Most screens mix `className` (NativeWind) with inline `style={{...}}` objects. E.g., `CameraScreen.tsx:159,163,164,165,166,167,168,169–172`, `DashboardScreen.tsx:165,166,182`, `WeeklyChart.tsx:59–67,95–103,115–119`. Inline objects `{}` are new references per render. |
| **Why it's inefficient** | Creates garbage for the GC on every render. On lists (meal items), this multiplies. |
| **Recommended fix** | Extract static styles to `StyleSheet.create()` or module-level constants. Only use inline `style` for dynamic values. |
| **Tradeoffs / Risks** | Requires organizing styles, marginal effort. |
| **Expected impact** | Low per-render, but cumulative for scrollable lists. |
| **Removal Safety** | Safe |
| **Reuse Scope** | Service-wide |

---

### F9. `getAllAvatars()` Creates New Array on Every Call

| Field | Value |
|---|---|
| **Category** | Memory / Algorithm |
| **Severity** | Low |
| **Impact** | Minor GC |
| **Evidence** | `avatars.ts:29–31` — `getAllAvatars()` spreads 3 arrays into a new array each call. Called in `ProfileScreen.tsx:134` and `getAvatarSource()` which is called in both `DashboardScreen` and `ProfileScreen` on every render. |
| **Recommended fix** | Cache the result: `const ALL_AVATARS = [...AVATARS.male, ...AVATARS.female, ...AVATARS.unisex];` as a module-level constant. Similarly for `getAvatarSource`, build a `Map<string, ImageSource>` once. |
| **Tradeoffs / Risks** | None. |
| **Expected impact** | Eliminates repeated array construction. |
| **Removal Safety** | Safe |
| **Reuse Scope** | Module |

---

### F10. `getPopularFoods()` Flattens Entire Database Every Call

| Field | Value |
|---|---|
| **Category** | Algorithm |
| **Severity** | Low |
| **Impact** | CPU |
| **Evidence** | `constants/index.ts:309–311` — `getPopularFoods(lang)` calls `FOOD_DATABASE.flatMap(c => c.items)` (160+ items), then filters, then slices to 16. Called inline in `ManualEntryScreen.tsx:131` — runs on every render. |
| **Recommended fix** | Memoize inside ManualEntryScreen: `const popularFoods = useMemo(() => getPopularFoods(lang), [lang]);`. Already on L131 but without `useMemo`. |
| **Tradeoffs / Risks** | None. |
| **Expected impact** | Single computation per language change. |
| **Removal Safety** | Safe |
| **Reuse Scope** | Local file |

---

### F11. No Debounce on Food Search Input

| Field | Value |
|---|---|
| **Category** | Frontend / CPU |
| **Severity** | Low |
| **Impact** | Responsiveness on low-end devices |
| **Evidence** | `ManualEntryScreen.tsx:191–193` — `onChangeText` is wired directly to `setSearchQuery` which triggers `useMemo` search on every keystroke. The search does `N*M` string comparisons (N categories × M items). |
| **Recommended fix** | Add a 200ms debounce: keep raw text in a ref, debounce before setting `searchQuery` state. |
| **Tradeoffs / Risks** | Adds slight perceived delay on search results. |
| **Expected impact** | Reduces computation during fast typing by ~80%. |
| **Removal Safety** | Safe |
| **Reuse Scope** | Local file |

---

### F12. `WeeklyChart.getWeekData` Defined as Method + Called in `useMemo`

| Field | Value |
|---|---|
| **Category** | Code Quality |
| **Severity** | Low |
| **Impact** | Clarity, minor perf |
| **Evidence** | `WeeklyChart.tsx:20–45` defines `getWeekData` as a method, then calls it inside `useMemo` at L47. The function closes over `dailyHistory`, `todayCalories`, `t` which are already in the deps. The function is recreated every render despite only being used inside `useMemo`. |
| **Recommended fix** | Inline the logic directly in `useMemo` or make `getWeekData` a pure standalone function outside the component that takes params. |
| **Tradeoffs / Risks** | None. |
| **Expected impact** | Cleaner code; avoids stale closure risk. |
| **Removal Safety** | Safe |
| **Reuse Scope** | Local file |

---

### F13. `checkBadges` Uses `earnedBadges` Array `.includes()` in Loop

| Field | Value |
|---|---|
| **Category** | Algorithm |
| **Severity** | Low |
| **Impact** | CPU (negligible now; O(B×E) where B=badges, E=earned) |
| **Evidence** | `CalorieContext.tsx:388–392` — For each badge, `earnedBadges.includes(badge.id)` does an O(E) linear scan. With ~20 badges and ~20 earned, this is O(400) per `addMeal`. |
| **Recommended fix** | Convert `earnedBadges` to a `Set<string>` for O(1) lookups. Store as array in AsyncStorage, convert to Set on load. |
| **Tradeoffs / Risks** | Need to update `setEarnedBadges` to work with both Set (internal) and array (persistence/context). |
| **Expected impact** | Negligible now, good practice for scaling. |
| **Removal Safety** | Safe |
| **Reuse Scope** | Module |

---

### F14. `CalorieProvider` Does Not Memoize Context Value Object

| Field | Value |
|---|---|
| **Category** | Frontend |
| **Severity** | Medium |
| **Impact** | Re-renders |
| **Evidence** | `CalorieContext.tsx:534` — The `value` prop of `CalorieContext.Provider` is an inline object literal `{{ consumed, targets, ... }}`. This creates a new object reference on every render, causing all consumers to re-render even if no values changed. |
| **Recommended fix** | Wrap in `useMemo`: `const value = useMemo(() => ({ consumed, targets, ... }), [consumed, targets, ...]);` |
| **Tradeoffs / Risks** | Must list all deps correctly. |
| **Expected impact** | Eliminates false-positive re-renders when parent re-renders but context values haven't changed. |
| **Removal Safety** | Safe |
| **Reuse Scope** | Module |

---

### F15. `Dimensions.get('window')` Called at Module Level

| Field | Value |
|---|---|
| **Category** | Reliability |
| **Severity** | Low |
| **Impact** | Incorrect layout after orientation change / split screen |
| **Evidence** | `DashboardScreen.tsx:4–6` — `const { width: SCREEN_WIDTH } = Dimensions.get('window');` runs once at module load. If the user rotates or uses split-screen, `SCREEN_WIDTH` and `ringSize` will be stale. |
| **Recommended fix** | Use `useWindowDimensions()` hook inside the component for reactive layout. |
| **Tradeoffs / Risks** | Slightly more re-renders on dimension change. |
| **Expected impact** | Correct layout on rotation/split-screen. |
| **Removal Safety** | Safe |
| **Reuse Scope** | Local file |

---

## 3) Quick Wins (Do First)

| # | Finding | Effort | Impact |
|---|---------|--------|--------|
| 1 | **F14**: Memoize context `value` object | 5 min | Eliminates false re-renders |
| 2 | **F6**: Memoize `getFoodDatabase()` call in ManualEntryScreen | 5 min | Removes redundant array work |
| 3 | **F10**: Wrap `getPopularFoods()` in `useMemo` | 2 min | Single computation |
| 4 | **F9**: Cache `getAllAvatars()` at module level | 5 min | Eliminates repeated spreads |
| 5 | **F3**: Extract `renderAvatarDisplay` → shared component | 15 min | DRY, single bug-fix location |
| 6 | **F4**: Extract `getBadgeName/Desc` → shared utility | 10 min | DRY |
| 7 | **F12**: Inline `getWeekData` in `useMemo` | 5 min | Cleaner code |

---

## 4) Deeper Optimizations (Do Next)

| # | Finding | Effort | Impact |
|---|---------|--------|--------|
| 1 | **F1**: Split `CalorieContext` into 2–3 focused contexts | 2–3 hrs | Major re-render reduction |
| 2 | **F2**: Index `allMeals` by date + add 90-day cap | 1–2 hrs | Startup/calendar perf, storage safety |
| 3 | **F7**: Add `useCallback` to all context functions | 1 hr | Enables `React.memo` downstream |
| 4 | **F5**: Consolidate category/activity constants to single file | 30 min | Maintainability |
| 5 | **F8**: Extract inline styles to `StyleSheet.create` | 1–2 hrs | GC reduction in lists |
| 6 | **F11**: Add search debounce | 20 min | Smoother UX on low-end devices |

---

## 5) Validation Plan

### Benchmarks
- Use React DevTools Profiler to measure re-render counts on:
  - Dashboard: tap "add water" → count components that re-render (should only be water-related after F1).
  - ManualEntry: type in search → measure computation time per keystroke.
- Measure `loadData()` cold-start time with a `console.time/timeEnd` around the function, with synthetic `allMeals` data of 500, 1000, 2000 entries.

### Profiling Strategy
- Enable `react-native-reanimated` performance monitor.
- Use Flipper + React DevTools to inspect re-render highlights.
- Measure AsyncStorage read/write times for `ALL_MEALS` key with `performance.now()`.

### Metrics (Before/After)
| Metric | How to measure |
|--------|---------------|
| Dashboard re-render count on `addWater()` | React Profiler → component count |
| `loadData()` duration (ms) | `console.time` |
| `getMealsForDate()` duration (ms) | `console.time` with 1000 meals |
| ManualEntry keystroke → result update (ms) | React Profiler |
| AsyncStorage `ALL_MEALS` write size (bytes) | `JSON.stringify(allMeals).length` |

### Correctness Tests
- After F2 (date indexing): Verify `getMealsForDate(date)` returns same results as the current linear scan.
- After F1 (context split): Verify all screens still read correct values. Spot-check badge earn flow, streak update, water tracking.
- After F7 (`useCallback`): Verify meal add/remove, water add/remove, favorites toggle all work correctly.

---

## 6) Optimized Code Snippets

### F14: Memoize Context Value

```tsx
// CalorieContext.tsx — before the return statement
const value = useMemo(() => ({
    consumed, targets, userProfile, streak, earnedBadges, mealHistory,
    badgeQueue, onboardingComplete, isLoading, waterGlasses, waterTarget,
    dailyHistory, favorites, allMeals,
    updateProfile, addMeal, removeMeal, clearNewBadge, addWater,
    removeWater, toggleFavorite, isFavorite, addMealForDate, getMealsForDate,
}), [consumed, targets, userProfile, streak, earnedBadges, mealHistory,
     badgeQueue, onboardingComplete, isLoading, waterGlasses, waterTarget,
     dailyHistory, favorites, allMeals]);

return (
    <CalorieContext.Provider value={value}>
        {children}
    </CalorieContext.Provider>
);
```

### F9: Cache `getAllAvatars()`

```tsx
// avatars.ts
const ALL_AVATARS = [...AVATARS.male, ...AVATARS.female, ...AVATARS.unisex];
const AVATAR_MAP = new Map(ALL_AVATARS.map(a => [a.id, a.source]));

export const getAllAvatars = () => ALL_AVATARS;
export const getAvatarSource = (id: string) => AVATAR_MAP.get(id);
```

### F6 + F10: Memoize food data in ManualEntryScreen

```tsx
// ManualEntryScreen.tsx — inside component
const foodDb = useMemo(() => getFoodDatabase(lang), [lang]);
const popularFoods = useMemo(() => getPopularFoods(lang), [lang]);

const searchResults = useMemo(() => {
    if (searchQuery.length === 0) return null;
    const query = searchQuery.toLowerCase();
    const results: FoodItem[] = [];
    foodDb.forEach(cat => {
        cat.items.forEach(item => {
            if (resolveFoodName(item, lang).toLowerCase().includes(query)) {
                results.push(item);
            }
        });
    });
    return results;
}, [searchQuery, foodDb, lang]);
```

### F2: Date-indexed meals (sketch)

```tsx
// Instead of: allMeals: MealEntry[]
// Use: allMealsByDate: Record<string, MealEntry[]>

const getMealsForDate = (date: string): MealEntry[] => {
    return allMealsByDate[date] || [];
};

const addMealForDate = (meal: Nutrients, name: string, date: string, category?: MealCategory) => {
    const entry: MealEntry = { /* ... */ };
    const updated = { ...allMealsByDate, [date]: [...(allMealsByDate[date] || []), entry] };
    setAllMealsByDate(updated);
    persist(STORAGE_KEYS.ALL_MEALS, updated);
};
```
