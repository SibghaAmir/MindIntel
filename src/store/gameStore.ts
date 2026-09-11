import { create } from 'zustand';
import * as Haptics from 'expo-haptics';
import type {
  AnswerValue,
  CaseCategoryId,
  GameState,
  InvestigationMode,
} from '@/src/types/game';
import { gameApi } from '@/src/services/gameApi';
import { audioManager } from '@/src/services/audioManager';
import { useSettingsStore } from '@/src/store/settingsStore';

interface GameStore extends GameState {
  selectedCategory: CaseCategoryId | null;
  selectedMode: InvestigationMode;
  isAnalyzing: boolean;
  apiError: string | null;
  setCategory: (category: CaseCategoryId) => void;
  setMode: (mode: InvestigationMode) => void;
  startInvestigation: () => Promise<void>;
  answerQuestion: (answer: AnswerValue) => Promise<void>;
  forceGuess: () => Promise<void>;
  confirmGuessCorrect: () => Promise<void>;
  rejectGuess: () => Promise<void>;
  submitPlayerAnswer: (subject: string) => void;
  resetGame: () => void;
  clearError: () => void;
  clearContradiction: () => void;
  
  gauntlet: { active: boolean; stage: number; cumulativeScore: number };
  startGauntletStage: () => Promise<void>;
  startGauntlet: () => Promise<void>;
  endGauntlet: () => void;
  incrementGauntletScore: (score: number) => void;
  
  hint: string | null;
  hintUsed: boolean;
  requestHint: () => Promise<void>;
  dismissHint: () => void;
}

let caseCounter = 26;

function initialState(): GameState {
  return {
    gameId: '',
    caseNumber: caseCounter,
    category: null,
    mode: 'standard',
    questionNumber: 1,
    maxQuestions: 20,
    questions: [],
    answers: [],
    candidates: [],
    confidence: 0,
    status: 'idle',
    currentQuestion: '',
    guess: null,
    snapshot: {
      aiConfidence: 0,
      candidatesRemaining: 1000,
      topPossibilities: [],
      categoryBreakdown: [],
    },
  };
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState(),
  selectedCategory: null,
  selectedMode: 'standard',
  isAnalyzing: false,
  apiError: null,
  hint: null,
  hintUsed: false,
  gauntlet: { active: false, stage: 1, cumulativeScore: 0 },

  setCategory: (category) => set({ selectedCategory: category }),

  setMode: (mode) => set({ selectedMode: mode }),
  
  startGauntlet: async () => {
    set({ gauntlet: { active: true, stage: 1, cumulativeScore: 0 } });
    await get().startGauntletStage();
  },
  
  startGauntletStage: async () => {
    const stage = get().gauntlet.stage;
    const settings = useSettingsStore.getState();
    let mode: InvestigationMode = 'standard';
    let diff = 'easy';
    
    settings.setTimeAttack(false);
    
    if (stage === 2) {
      mode = 'standard';
      diff = 'normal';
      settings.setTimeAttack(true);
    } else if (stage === 3) {
      mode = 'reverse';
      diff = 'normal';
      settings.setTimeAttack(false);
    }
    
    get().setMode(mode);
    get().setCategory('anything');
    settings.setDifficulty(diff as any);
    await get().startInvestigation();
  },
  
  endGauntlet: () => {
    set({ gauntlet: { active: false, stage: 1, cumulativeScore: 0 } });
  },
  
  incrementGauntletScore: (score: number) => {
    const { gauntlet } = get();
    set({ gauntlet: { ...gauntlet, cumulativeScore: gauntlet.cumulativeScore + score, stage: gauntlet.stage + 1 } });
  },

  clearError: () => set({ apiError: null }),
  
  clearContradiction: () => set({ contradiction: null }),
  
  dismissHint: () => set({ hint: null }),
  
  requestHint: async () => {
    const state = get();
    if (state.status !== 'playing' || !state.gameId || state.hintUsed) return;
    
    set({ isAnalyzing: true, apiError: null });
    try {
      const res = await gameApi.getHint(state.gameId);
      set({ hint: res.hint, hintUsed: true, isAnalyzing: false });
    } catch (error: any) {
      set({ apiError: error.message || 'Failed to get hint.', isAnalyzing: false });
    }
  },

  startInvestigation: async () => {
    const { selectedCategory, selectedMode } = get();
    const category: CaseCategoryId = selectedCategory ?? 'anything';
    const { difficulty, personality } = useSettingsStore.getState();
    caseCounter += 1;

    set({ isAnalyzing: true, apiError: null, status: 'thinking', hint: null, hintUsed: false });

    try {
      const newState = await gameApi.createGame(category, selectedMode, difficulty, personality);
      set({
        ...newState,
        caseNumber: caseCounter,
        isAnalyzing: false,
      });
    } catch (error: any) {
      set({ apiError: error.message || 'Failed to start game.', isAnalyzing: false, status: 'idle' });
    }
  },

  answerQuestion: async (answer) => {
    const state = get();
    if (state.status !== 'playing' || !state.gameId) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    audioManager.playBlip();

    // Optimistic UI update for thinking state
    const nextAnswers = [
      ...state.answers,
      { question: state.currentQuestion, answer },
    ];
    set({ status: 'thinking', answers: nextAnswers, isAnalyzing: true, apiError: null });
    audioManager.startThinking();

    try {
      const newState = await gameApi.submitAnswer(state.gameId, answer);
      if (get().gameId !== state.gameId) {
        audioManager.stopThinking();
        return;
      }

      audioManager.stopThinking();
      set({ ...newState, caseNumber: state.caseNumber, isAnalyzing: false });
    } catch (error: any) {
      audioManager.stopThinking();
      set({ apiError: error.message || 'Failed to submit answer.', isAnalyzing: false, status: 'playing' });
    }
  },

  forceGuess: async () => {
    const state = get();
    if (state.status !== 'playing' || !state.gameId) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    audioManager.playBlip();
    set({ status: 'thinking', isAnalyzing: true, apiError: null });
    audioManager.startThinking();

    try {
      const newState = await gameApi.forceGuess(state.gameId);
      if (get().gameId !== state.gameId) {
        audioManager.stopThinking();
        return;
      }

      audioManager.stopThinking();
      set({ ...newState, caseNumber: state.caseNumber, isAnalyzing: false });
    } catch (error: any) {
      audioManager.stopThinking();
      set({ apiError: error.message || 'Failed to force guess.', isAnalyzing: false, status: 'playing' });
    }
  },

  confirmGuessCorrect: async () => {
    const state = get();
    if (!state.gameId) return;

    set({ isAnalyzing: true, apiError: null });
    try {
      const newState = await gameApi.confirmGuess(state.gameId, true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      set({ ...newState, caseNumber: state.caseNumber, isAnalyzing: false });
    } catch (error: any) {
      set({ apiError: error.message || 'Error confirming guess.', isAnalyzing: false });
    }
  },

  rejectGuess: async () => {
    const state = get();
    if (!state.gameId) return;

    set({ isAnalyzing: true, apiError: null });
    try {
      const newState = await gameApi.confirmGuess(state.gameId, false);
      if (newState.status === 'lost') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
      set({ ...newState, caseNumber: state.caseNumber, isAnalyzing: false });
    } catch (error: any) {
      set({ apiError: error.message || 'Error rejecting guess.', isAnalyzing: false });
    }
  },

  submitPlayerAnswer: (_subject) => {
    set({ status: 'lost' });
  },

  resetGame: () => set({ ...initialState(), isAnalyzing: false, apiError: null, hint: null, hintUsed: false, gauntlet: { active: false, stage: 1, cumulativeScore: 0 } }),
}));
