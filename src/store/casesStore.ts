import { create } from 'zustand';
import type { CaseRecord } from '@/src/types/game';
import { MOCK_CASES, PLAYER_RECORD } from '@/src/data/mockCases';

interface CasesStore {
  cases: CaseRecord[];
  record: typeof PLAYER_RECORD;
  addCase: (record: CaseRecord) => void;
}

export const useCasesStore = create<CasesStore>((set, get) => ({
  cases: MOCK_CASES,
  record: PLAYER_RECORD,
  addCase: (record) => {
    const cases = [record, ...get().cases];
    const aiWins = cases.filter((c) => c.result === 'ai_victory').length;
    const playerWins = cases.filter((c) => c.result === 'player_victory').length;
    const avg =
      cases.reduce((sum, c) => sum + c.questionsUsed, 0) / (cases.length || 1);
    const best = Math.max(...cases.map((c) => c.score));
    set({
      cases,
      record: {
        totalCases: cases.length,
        aiWins,
        playerWins,
        averageQuestions: Math.round(avg * 10) / 10,
        bestScore: best,
      },
    });
  },
}));
