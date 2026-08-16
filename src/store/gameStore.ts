import { create } from 'zustand';
import * as Haptics from 'expo-haptics';
import type {
  AnswerValue,
  CaseCategoryId,
  GameState,
  InvestigationMode,
} from '@/src/types/game';
import { getQuestionAt } from '@/src/data/mockQuestionsByCategory';
import { buildMockSnapshot, pickMockGuess } from '@/src/data/mockInvestigation';
import { MODE_OPTIONS } from '@/src/data/mockOptions';

/**
 * Local mock game engine (Phase 2). Drives an entire Kasoti game — category
 * selection through to a final AI win / player win — with no backend.
 * Every "AI" decision here is a deterministic simulation, not real inference.
 */
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

let caseCounter = 26;

function initialState(): GameState {
  const category: CaseCategoryId = 'anything';
  return {
    gameId: `game-${Date.now()}`,
    caseNumber: caseCounter,
    category: null,
    mode: 'standard',
    questionNumber: 1,
    maxQuestions: 20,
    questions: [getQuestionAt(category, 0)],
    answers: [],
    candidates: [],
    confidence: 12,
    status: 'idle',
    currentQuestion: getQuestionAt(category, 0),
    guess: null,
    snapshot: buildMockSnapshot(0, 20),
  };
}

/**
 * A game concludes (moves to "guessing") once the AI's mock confidence
 * crosses a high-confidence threshold, once a soft cap on questions asked is
 * reached, or once the mode's max question count is hit — whichever comes
 * first. This keeps 10-question games snappy and lets 20-question games end
 * early on a confident guess.
 */
function shouldConclude(answeredCount: number, maxQuestions: number, aiConfidence: number) {
  const softCap = Math.min(maxQuestions, Math.max(6, Math.round(maxQuestions * 0.55)));
  return aiConfidence >= 90 || answeredCount >= maxQuestions || answeredCount >= softCap;
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState(),
  selectedCategory: null,
  selectedMode: 'standard',

  setCategory: (category) => set({ selectedCategory: category }),

  setMode: (mode) => set({ selectedMode: mode }),

  startInvestigation: () => {
    const { selectedCategory, selectedMode } = get();
    const category: CaseCategoryId = selectedCategory ?? 'anything';
    const modeConfig = MODE_OPTIONS.find((m) => m.id === selectedMode) ?? MODE_OPTIONS[0];
    caseCounter += 1;

    set({
      ...initialState(),
      gameId: `game-${Date.now()}`,
      caseNumber: caseCounter,
      category,
      mode: selectedMode,
      maxQuestions: modeConfig.questionCount,
      status: 'playing',
      questions: [getQuestionAt(category, 0)],
      currentQuestion: getQuestionAt(category, 0),
      snapshot: buildMockSnapshot(0, modeConfig.questionCount),
      candidates: buildMockSnapshot(0, modeConfig.questionCount).topPossibilities,
    });
  },

  answerQuestion: (answer) => {
    const state = get();
    if (state.status !== 'playing') return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    const category = state.category ?? 'anything';
    const nextAnswers = [
      ...state.answers,
      { question: state.currentQuestion, answer },
    ];

    // Show a brief "thinking" state so the AI core animates before either
    // the next question or the conclusion appears — mirrors an AI actually
    // processing the answer, even though the outcome is already decided.
    set({ status: 'thinking', answers: nextAnswers });

    setTimeout(() => {
      // Bail out if the game was reset/left while thinking.
      if (get().gameId !== state.gameId) return;

      const snapshot = buildMockSnapshot(nextAnswers.length, state.maxQuestions);
      const concluding = shouldConclude(nextAnswers.length, state.maxQuestions, snapshot.aiConfidence);

      if (concluding) {
        const guess = pickMockGuess();
        set({
          questionNumber: nextAnswers.length,
          confidence: snapshot.aiConfidence,
          snapshot,
          candidates: snapshot.topPossibilities,
          status: 'guessing',
          guess,
        });
        return;
      }

      const nextQuestion = getQuestionAt(category, nextAnswers.length);
      set({
        questions: [...state.questions, nextQuestion],
        questionNumber: nextAnswers.length + 1,
        confidence: snapshot.aiConfidence,
        snapshot,
        candidates: snapshot.topPossibilities,
        currentQuestion: nextQuestion,
        status: 'playing',
      });
    }, 650);
  },

  confirmGuessCorrect: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    set({ status: 'won' });
  },

  rejectGuess: () => {
    const state = get();
    if (state.questionNumber >= state.maxQuestions) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      set({ status: 'lost' });
      return;
    }

    const category = state.category ?? 'anything';
    const nextQuestion = getQuestionAt(category, state.answers.length);
    set({
      status: 'playing',
      questions: [...state.questions, nextQuestion],
      currentQuestion: nextQuestion,
      guess: null,
    });
  },

  submitPlayerAnswer: (_subject) => {
    // Phase 2: still UI + local-state only; casesStore records the subject.
    set({ status: 'lost' });
  },

  resetGame: () => set({ ...initialState() }),
}));
