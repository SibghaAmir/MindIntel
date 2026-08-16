import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CaseRecord } from '@/src/types/game';
import { MOCK_CASES, PLAYER_RECORD } from '@/src/data/mockCases';

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
  addCase: (record: CaseRecord) => void;
  setHasHydrated: (value: boolean) => void;
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

export const useCasesStore = create<CasesStore>()(
  persist(
    (set, get) => ({
      cases: MOCK_CASES,
      record: PLAYER_RECORD,
      hasHydrated: false,

      addCase: (record) => {
        const cases = [record, ...get().cases];
        set({ cases, record: recomputeRecord(cases) });
      },

      setHasHydrated: (value) => set({ hasHydrated: value }),
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
