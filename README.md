# KASOTI — AI Mind Investigation

Phase 1 deliverable: a complete, polished, **frontend-only** React Native + Expo mobile app.
No backend, no real AI, no database, no auth — everything runs on mock data and local state
so the whole app is navigable and interactive on its own.

## Tech stack

- Expo SDK 54 (managed workflow, New Architecture enabled) — pinned to match the
  version currently published to Expo Go on the App Store / Play Store
- React Native 0.81 + React 19.1
- TypeScript (strict mode)
- Expo Router (file-based navigation, typed routes)
- React Native Reanimated 4 + `react-native-worklets`
- React Native Gesture Handler
- Expo Linear Gradient / Expo Haptics / Expo Blur
- Zustand for local game/case/settings state
- `@expo/vector-icons` (Ionicons)

All dependency versions are pinned exactly (no `^` / `~` ranges) in `package.json`
so a fresh `npm install` always resolves to the exact tested set. A `.npmrc` with
`legacy-peer-deps=true` is included so plain `npm install` works without extra flags
(needed because of a peer-dependency conflict in `expo-router`'s web tooling).

## Getting started

```bash
npm install
npx expo start
```

Then press `i` for iOS simulator, `a` for Android emulator, or scan the QR code with
**Expo Go** on a physical device — install Expo Go from the App Store / Play Store,
it will match this project's SDK 54. `npm run web` also works for a quick browser preview.

Run `npm run typecheck` to type-check the whole project.

## Project structure

```
app/
  _layout.tsx          Root stack (gesture root, safe area, dark status bar)
  (tabs)/
    _layout.tsx         Bottom tab bar: Home · Cases · Statistics · Settings
    index.tsx           Home
    cases.tsx           Cases
    statistics.tsx       Statistics
    settings.tsx         Settings
  new-case.tsx          Category + mode selection
  investigation.tsx     Core Q&A investigation flow
  conclusion.tsx        AI's final guess + evidence
  result.tsx            AI win / player win outcomes
  how-to-play.tsx        Onboarding modal

src/
  components/           15 reusable UI components (see below)
  data/                  Mock questions, options, investigation snapshots, case history
  store/                 Zustand stores: gameStore, casesStore, settingsStore
  theme/                 colors, spacing, typography, radius, shadows
  types/                 Shared TypeScript interfaces
```

## Reusable components

`AIInvestigationCore` (6 animated states: idle / thinking / analyzing / highConfidence /
success / failure, built with SVG + Reanimated — no 3D libraries), `InvestigationCard`,
`QuestionCard`, `AnswerButton`, `ProgressIndicator`, `ConfidenceBar`, `CandidateCard`,
`CategoryCard`, `CaseCard`, `StatCard`, `SectionHeader`, `PrimaryButton`,
`SecondaryButton`, `GlassCard`, `AnimatedPressable`.

## Design language

Dark forensic-investigation palette, exactly as specified:

| Token | Hex |
|---|---|
| Background | `#0B1424` |
| Card | `#182640` |
| Secondary card | `#202F4D` |
| Primary blue | `#647CFF` |
| Electric violet | `#7B61FF` |
| Glow blue | `#6FA8FF` |
| Text primary | `#F4F7FF` |
| Text secondary | `#9BA8C0` |
| Success | `#51D88A` |
| Warning | `#FFB85C` |

## What's mocked (by design, per Phase 1 scope)

- Questions come from a static branching list (`src/data/mockQuestions.ts`)
- "AI confidence", "candidates remaining", and category breakdown are generated
  by a formula that narrows as more questions are answered (`src/data/mockInvestigation.ts`)
- The AI's final guess is always the same mock candidate with 93% confidence
- Case history starts pre-seeded with 6 example cases; new cases append locally
  (nothing persists between app restarts — there's no backend or AsyncStorage wiring yet)

## Verified

- `npx tsc --noEmit` passes clean (strict mode)
- `npx expo export --platform web` bundles the entire route tree successfully
  (1287 modules, no resolution errors) — confirms every screen, component, and
  store import resolves correctly, on the exact pinned SDK 54 dependency set
- Clean `npm install` from a fresh `node_modules` resolves without errors

## Phase 2 (not built here, by instruction)

Wiring a real backend/AI would mean: replacing `src/data/mockQuestions.ts` and
`src/data/mockInvestigation.ts` with real API calls, adding persistence (AsyncStorage
or a backend) to `casesStore`, and replacing the fixed guess logic in `gameStore.ts`
with a real model response.
