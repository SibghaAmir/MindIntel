import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CaseRecord } from '@/src/types/game';
import { MOCK_CASES, PLAYER_RECORD } from '@/src/data/mockCases';
import { ACHIEVEMENTS } from '@/src/data/achievements';

/**
 * Phase 2 persistence: games played, AI wins, player wins, best score, and
 * recent case history all survive an app restart via AsyncStorage. No
 * database or backend — this is local device storage only.
 */
export interface PlayerRecord {
  totalCases: number;
  aiWins: number;
  playerWins: number;
  averageQuestions: number;
  bestScore: number;
  currentStreak: number;
  lastPlayDate: string;
}

interface CasesStore {
  cases: CaseRecord[];
  record: PlayerRecord;
  hasHydrated: boolean;
  hasSeenTutorial: boolean;
  unlockedAchievements: string[];
  recentUnlocks: string[];
  addCase: (record: CaseRecord) => void;
  setHasHydrated: (value: boolean) => void;
  clearRecentUnlocks: () => void;
  completeTutorial: () => void;
  
  archetype: string | null;
  archetypeDescription: string | null;
  archetypeColor: string | null;
  casesSinceProfile: number;
  fetchProfile: () => Promise<void>;
}

function computeStreak(cases: CaseRecord[]): { currentStreak: number; lastPlayDate: string } {
  if (cases.length === 0) return { currentStreak: 0, lastPlayDate: '' };

  const dates = Array.from(new Set(cases.map(c => c.date))).sort((a, b) => b.localeCompare(a));
  const todayStr = new Date().toISOString().slice(0, 10);
  const lastPlay = dates[0];
  
  let streak = 0;
  
  const lastPlayDateObj = new Date(lastPlay);
  const todayDateObj = new Date(todayStr);
  const diffDays = Math.round((todayDateObj.getTime() - lastPlayDateObj.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 1) {
    let expectedDate = new Date(lastPlay);
    for (const d of dates) {
      if (d === expectedDate.toISOString().slice(0, 10)) {
        streak++;
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  return { currentStreak: streak, lastPlayDate: lastPlay };
}

function recomputeRecord(cases: CaseRecord[]): PlayerRecord {
  const aiWins = cases.filter((c) => c.result === 'ai_victory').length;
  const playerWins = cases.filter((c) => c.result === 'player_victory').length;
  const avg = cases.length
    ? cases.reduce((sum, c) => sum + c.questionsUsed, 0) / cases.length
    : 0;
  const best = cases.length ? Math.max(...cases.map((c) => c.score)) : 0;
  const { currentStreak, lastPlayDate } = computeStreak(cases);

  return {
    totalCases: cases.length,
    aiWins,
    playerWins,
    averageQuestions: Math.round(avg * 10) / 10,
    bestScore: best,
    currentStreak,
    lastPlayDate,
  };
}

function checkAchievements(
  record: PlayerRecord,
  latestCase: CaseRecord,
  currentUnlocked: string[]
): string[] {
  const newlyUnlocked: string[] = [];
  
  if (!currentUnlocked.includes('first_blood') && record.totalCases >= 1) {
    newlyUnlocked.push('first_blood');
  }
  if (!currentUnlocked.includes('master_deception') && record.playerWins >= 5) {
    newlyUnlocked.push('master_deception');
  }
  if (!currentUnlocked.includes('open_book') && latestCase.result === 'ai_victory' && latestCase.questionsUsed <= 5) {
    newlyUnlocked.push('open_book');
  }
  if (!currentUnlocked.includes('marathon_mind') && record.totalCases >= 20) {
    newlyUnlocked.push('marathon_mind');
  }
  if (!currentUnlocked.includes('perfect_confidence') && latestCase.result === 'ai_victory' && latestCase.confidence >= 99) {
    newlyUnlocked.push('perfect_confidence');
  }

  return newlyUnlocked;
}

export const useCasesStore = create<CasesStore>()(
  persist(
    (set, get) => ({
      cases: MOCK_CASES,
      record: PLAYER_RECORD,
      hasHydrated: false,
      hasSeenTutorial: false,
      unlockedAchievements: [],
      recentUnlocks: [],
      
      archetype: null,
      archetypeDescription: null,
      archetypeColor: null,
      casesSinceProfile: 0,

      addCase: (record) => {
        const cases = [record, ...get().cases];
        const newRecord = recomputeRecord(cases);
        const newlyUnlocked = checkAchievements(newRecord, record, get().unlockedAchievements);
        const newSinceProfile = get().casesSinceProfile + 1;
        
        set({
          cases,
          record: newRecord,
          unlockedAchievements: [...get().unlockedAchievements, ...newlyUnlocked],
          recentUnlocks: newlyUnlocked.length > 0 ? newlyUnlocked : get().recentUnlocks,
          casesSinceProfile: newSinceProfile,
        });
      },

      fetchProfile: async () => {
        const { cases } = get();
        // get last 5 cases that have questions
        const casesWithQuestions = cases.filter(c => c.questions && c.questions.length > 0).slice(0, 5);
        if (casesWithQuestions.length === 0) return;
        
        const history = casesWithQuestions.map(c => c.questions!);
        try {
          const { gameApi } = await import('@/src/services/gameApi');
          const profile = await gameApi.analyzeProfile(history);
          set({
            archetype: profile.archetype,
            archetypeDescription: profile.description,
            archetypeColor: profile.color,
            casesSinceProfile: 0,
          });
        } catch (e) {
          console.warn("Failed to fetch profile", e);
        }
      },

      setHasHydrated: (value) => set({ hasHydrated: value }),
      clearRecentUnlocks: () => set({ recentUnlocks: [] }),
      completeTutorial: () => set({ hasSeenTutorial: true }),
    }),
    {
      name: 'kasoti-cases-v1',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
