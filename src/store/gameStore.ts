import { create } from 'zustand';
import type {
  AnswerValue,
  CaseCategoryId,
  GameState,
  InvestigationMode,
} from '@/src/types/game';
import { getMockQuestion } from '@/src/data/mockQuestions';
import { buildMockSnapshot, pickMockGuess } from '@/src/data/mockInvestigation';
import { MODE_OPTIONS } from '@/src/data/mockOptions';

interface GameStore extends GameState {
  selectedCategory: CaseCategoryId | null;
  selectedMode: InvestigationMode;
  setCategory: (category: CaseCategoryId) => void;
  setMode: (mode: InvestigationMode) => void;
  startInvestigation: () => void;
  answerQuestion: (answer: AnswerValue) => void;
  confirmGuessCorrect: () => void;
  rejectGuess: () => void;
  submitPlayerAnswer: (subject: string) => void;
  resetGame: () => void;
}

const NEXT_CASE_NUMBER = 26;

function initialState(): GameState {
  return {
    gameId: `game-${Date.now()}`,
    caseNumber: NEXT_CASE_NUMBER,
    category: null,
    mode: 'standard',
    currentQuestion: getMockQuestion(0),
    questionNumber: 1,
    maxQuestions: 20,
    answers: [],
    confidence: 12,
    candidates: [],
    status: 'idle',
    guess: null,
    snapshot: buildMockSnapshot(0, 20),
  };
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState(),
  selectedCategory: null,
  selectedMode: 'standard',

  setCategory: (category) => set({ selectedCategory: category }),

  setMode: (mode) => set({ selectedMode: mode }),

  startInvestigation: () => {
    const { selectedCategory, selectedMode } = get();
    const modeConfig = MODE_OPTIONS.find((m) => m.id === selectedMode) ?? MODE_OPTIONS[0];
    set({
      ...initialState(),
      category: selectedCategory ?? 'anything',
      mode: selectedMode,
      maxQuestions: modeConfig.questionCount,
      status: 'in_progress',
      currentQuestion: getMockQuestion(0),
      snapshot: buildMockSnapshot(0, modeConfig.questionCount),
    });
  },

  answerQuestion: (answer) => {
    const state = get();
    const nextAnswers = [
      ...state.answers,
      { question: state.currentQuestion, answer },
    ];
    const isLastQuestion = state.questionNumber >= state.maxQuestions;
    const snapshot = buildMockSnapshot(nextAnswers.length, state.maxQuestions);

    // Simulate the AI reaching high confidence and concluding early.
    const shouldConclude =
      snapshot.aiConfidence >= 90 || isLastQuestion || nextAnswers.length >= 11;

    if (shouldConclude) {
      const guess = pickMockGuess();
      set({
        answers: nextAnswers,
        questionNumber: nextAnswers.length,
        confidence: snapshot.aiConfidence,
        snapshot,
        status: 'concluding',
        guess,
      });
      return;
    }

    set({
      answers: nextAnswers,
      questionNumber: nextAnswers.length + 1,
      confidence: snapshot.aiConfidence,
      snapshot,
      currentQuestion: getMockQuestion(nextAnswers.length),
    });
  },

  confirmGuessCorrect: () => set({ status: 'ai_win' }),

  rejectGuess: () => {
    const state = get();
    if (state.questionNumber >= state.maxQuestions) {
      set({ status: 'player_win' });
    } else {
      set({
        status: 'in_progress',
        currentQuestion: getMockQuestion(state.answers.length),
        guess: null,
      });
    }
  },

  submitPlayerAnswer: (_subject) => {
    // Phase 1: UI only, no persistence beyond local state.
    set({ status: 'player_win' });
  },

  resetGame: () => set({ ...initialState() }),
}));
