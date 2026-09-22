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
  submitDesperationClue: (clue: string) => Promise<void>;
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
  
  isDaily: boolean;
  startDailyCipher: () => Promise<void>;
  
  startDeceptionMode: () => Promise<void>;
  factChecksRemaining: number;
  factCheck: () => Promise<void>;
  
  polygraphActive: boolean;
  retconActive: boolean;
  applyBribe: () => Promise<void>;
  applyAssassination: () => void;
  applyPolygraph: () => void;
  enableRetcon: () => void;
  applyRetcon: (index: number) => Promise<void>;
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
    evidenceBoard: [],
    factChecksRemaining: 0,
    polygraphActive: false,
    retconActive: false,
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
  isDaily: false,
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
    const category = selectedCategory || 'anything';
    const { difficulty, personality } = useSettingsStore.getState();
    caseCounter += 1;

    set({ isAnalyzing: true, apiError: null, status: 'thinking', hint: null, hintUsed: false, isDaily: false });

    try {
      const newState = await gameApi.createGame(category, selectedMode, difficulty, personality);
      
      const newPossibilities = newState.snapshot.topPossibilities || [];
      const updatedBoard = newPossibilities.slice(0, 9).map((p, i) => ({
        id: `suspect-init-${i}-${p}`,
        name: p,
        status: 'active' as const
      }));

      set({
        ...newState,
        caseNumber: caseCounter,
        isAnalyzing: false,
        evidenceBoard: updatedBoard
      });
    } catch (error: any) {
      set({
        apiError: error.message || 'Failed to start game.',
        isAnalyzing: false,
      });
    }
  },
  
  startDailyCipher: async () => {
    caseCounter += 1;
    useSettingsStore.getState().setTimeAttack(false); // Disable time attack for daily
    
    set({ isAnalyzing: true, apiError: null, status: 'thinking', hint: null, hintUsed: false, isDaily: true, gauntlet: { active: false, stage: 1, cumulativeScore: 0 } });

    try {
      const newState = await gameApi.createDailyGame();
      const newPossibilities = newState.snapshot.topPossibilities || [];
      const updatedBoard = newPossibilities.slice(0, 9).map((p, i) => ({
        id: `suspect-init-${i}-${p}`,
        name: p,
        status: 'active' as const
      }));

      set({
        ...newState,
        caseNumber: caseCounter,
        isAnalyzing: false,
        evidenceBoard: updatedBoard
      });
    } catch (error: any) {
      set({
        apiError: error.message || 'Failed to start daily case.',
        isAnalyzing: false,
      });
    }
  },

  startDeceptionMode: async () => {
    caseCounter += 1;
    useSettingsStore.getState().setTimeAttack(false); // No time attack
    
    set({ isAnalyzing: true, apiError: null, status: 'thinking', hint: null, hintUsed: false, isDaily: false, gauntlet: { active: false, stage: 1, cumulativeScore: 0 } });

    try {
      const newState = await gameApi.createGame('anything', 'deception', 'normal', useSettingsStore.getState().personality);
      const newPossibilities = newState.snapshot.topPossibilities || [];
      const updatedBoard = newPossibilities.slice(0, 9).map((p, i) => ({
        id: `suspect-init-${i}-${p}`,
        name: p,
        status: 'active' as const
      }));

      set({
        ...newState,
        caseNumber: caseCounter,
        isAnalyzing: false,
        evidenceBoard: updatedBoard,
        factChecksRemaining: 1,
      });
    } catch (error: any) {
      set({
        apiError: error.message || 'Failed to start deception mode.',
        isAnalyzing: false,
      });
    }
  },

  factCheck: async () => {
    const state = get();
    if (!state.gameId || state.factChecksRemaining <= 0) return;
    
    set({ isAnalyzing: true, apiError: null });
    try {
      const newState = await gameApi.factCheck(state.gameId);
      set({ ...newState, isAnalyzing: false, factChecksRemaining: 0 });
    } catch (error: any) {
      set({ apiError: error.message || 'Fact check failed.', isAnalyzing: false });
    }
  },

  applyBribe: async () => {
    const state = get();
    if (!state.gameId) return;
    try {
      const newState = await gameApi.applyBribe(state.gameId);
      set({ maxQuestions: newState.maxQuestions });
    } catch (e) {
      console.warn("Failed to apply bribe", e);
    }
  },

  applyAssassination: () => {
    const state = get();
    const board = [...state.evidenceBoard];
    let eliminatedCount = 0;
    
    for (let i = board.length - 1; i >= 0; i--) {
      if (board[i].status === 'active') {
        board[i] = { ...board[i], status: 'eliminated' };
        eliminatedCount++;
        if (eliminatedCount >= 3) break;
      }
    }
    
    set({ evidenceBoard: board });
  },

  applyPolygraph: () => {
    set({ polygraphActive: true });
  },

  enableRetcon: () => {
    set({ retconActive: true });
  },

  applyRetcon: async (index: number) => {
    const state = get();
    if (!state.gameId) return;
    set({ isAnalyzing: true, apiError: null, retconActive: false }); // turn off retcon mode after use
    try {
      const newState = await gameApi.applyRetcon(state.gameId, index);
      set({ ...newState, isAnalyzing: false });
    } catch (e: any) {
      set({ apiError: e.message || 'Failed to retcon history', isAnalyzing: false });
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
      
      const currentBoard = state.evidenceBoard || [];
      const newPossibilities = newState.snapshot.topPossibilities || [];
      let updatedBoard = [...currentBoard];
      
      // Mark existing as eliminated if not in new topPossibilities
      updatedBoard = updatedBoard.map(item => {
        if (item.status === 'active' && !newPossibilities.includes(item.name)) {
          return { ...item, status: 'eliminated' };
        }
        return item;
      });
      
      // Add new suspects up to 9
      const maxSuspects = 9;
      for (const p of newPossibilities) {
        if (updatedBoard.length >= maxSuspects) break;
        if (!updatedBoard.some(item => item.name === p)) {
          updatedBoard.push({ id: `suspect-${Date.now()}-${p}`, name: p, status: 'active' });
        }
      }

      set({ ...newState, caseNumber: state.caseNumber, isAnalyzing: false, evidenceBoard: updatedBoard });
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

  submitDesperationClue: async (clue: string) => {
    const state = get();
    if (state.status !== 'desperation' || !state.gameId) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    audioManager.playBlip();
    set({ status: 'thinking', isAnalyzing: true, apiError: null });
    audioManager.startThinking();

    try {
      const newState = await gameApi.submitDesperationClue(state.gameId, clue);
      if (get().gameId !== state.gameId) {
        audioManager.stopThinking();
        return;
      }

      audioManager.stopThinking();
      set({ ...newState, caseNumber: state.caseNumber, isAnalyzing: false });
    } catch (error: any) {
      audioManager.stopThinking();
      set({ apiError: error.message || 'Failed to submit clue.', isAnalyzing: false, status: 'desperation' });
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

  resetGame: () => set({ ...initialState(), isAnalyzing: false, apiError: null, hint: null, hintUsed: false, isDaily: false, gauntlet: { active: false, stage: 1, cumulativeScore: 0 } }),
}));
