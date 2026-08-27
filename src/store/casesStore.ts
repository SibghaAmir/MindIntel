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
}

function recomputeRecord(cases: CaseRecord[]): PlayerRecord {
  const aiWins = cases.filter((c) => c.result === 'ai_victory').length;
  const playerWins = cases.filter((c) => c.result === 'player_victory').length;
  const avg = cases.length
    ? cases.reduce((sum, c) => sum + c.questionsUsed, 0) / cases.length
    : 0;
  const best = cases.length ? Math.max(...cases.map((c) => c.score)) : 0;

  return {
    totalCases: cases.length,
    aiWins,
    playerWins,
    averageQuestions: Math.round(avg * 10) / 10,
    bestScore: best,
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

      addCase: (record) => {
        const cases = [record, ...get().cases];
        const newRecord = recomputeRecord(cases);
        const newlyUnlocked = checkAchievements(newRecord, record, get().unlockedAchievements);
        
        set({
          cases,
          record: newRecord,
          unlockedAchievements: [...get().unlockedAchievements, ...newlyUnlocked],
          recentUnlocks: newlyUnlocked.length > 0 ? newlyUnlocked : get().recentUnlocks,
        });
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
