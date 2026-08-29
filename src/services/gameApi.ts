import { fetchApi } from './api';
import type { GameState, QAEntry, InvestigationSnapshot, CandidateGuess } from '@/src/types/game';

interface BackendGameState {
  game_id: string;
  category: string;
  mode: string;
  question_number: number;
  max_questions: number;
  questions: string[];
  answers: string[];
  status: string;
  confidence: number;
  candidates: string[];
  current_question: string | null;
  guess: string | null;
  reason: string | null;
}

// Maps backend schema to our frontend Zustand state shape
const mapBackendStateToFrontend = (backend: BackendGameState): GameState => {
  // Zip questions and answers
  const answers: QAEntry[] = backend.questions.slice(0, backend.answers.length).map((q, i) => ({
    question: q,
    answer: backend.answers[i] as any,
  }));

  // Create a mock snapshot based on backend confidence
  const candidatesRemaining = Math.max(1, 1000 - backend.question_number * 100);
  const snapshot: InvestigationSnapshot = {
    aiConfidence: backend.confidence,
    candidatesRemaining,
    topPossibilities: backend.candidates,
    categoryBreakdown: [
      { label: backend.category, percentage: Math.min(99, 10 + backend.confidence) },
      { label: 'other', percentage: Math.max(1, 90 - backend.confidence) }
    ]
  };

  let guess: CandidateGuess | null = null;
  if (backend.guess) {
    guess = {
      name: backend.guess,
      confidence: backend.confidence,
      reason: backend.reason || undefined,
    };
  }

  return {
    gameId: backend.game_id,
    caseNumber: 0, // Assigned by store
    category: backend.category as any,
    mode: backend.mode as any,
    questionNumber: backend.question_number + 1, // Frontend is 1-indexed for display
    maxQuestions: backend.max_questions,
    questions: backend.questions,
    answers,
    candidates: backend.candidates,
    confidence: backend.confidence,
    status: backend.status as any,
    currentQuestion: backend.current_question || '',
    guess,
    snapshot,
  };
};

export const gameApi = {
  createGame: async (category: string, mode: string, difficulty: string): Promise<GameState> => {
    const data = await fetchApi<BackendGameState>('/games', {
      method: 'POST',
      body: JSON.stringify({ category, mode, difficulty }),
    });
    return mapBackendStateToFrontend(data);
  },

  submitAnswer: async (gameId: string, answer: string): Promise<GameState> => {
    const data = await fetchApi<BackendGameState>(`/games/${gameId}/answers`, {
      method: 'POST',
      body: JSON.stringify({ answer }),
    });
    return mapBackendStateToFrontend(data);
  },

  forceGuess: async (gameId: string): Promise<GameState> => {
    const data = await fetchApi<BackendGameState>(`/games/${gameId}/force-guess`, {
      method: 'POST',
    });
    return mapBackendStateToFrontend(data);
  },

  confirmGuess: async (gameId: string, correct: boolean): Promise<GameState> => {
    const data = await fetchApi<BackendGameState>(`/games/${gameId}/guess/confirm`, {
      method: 'POST',
      body: JSON.stringify({ correct }),
    });
    return mapBackendStateToFrontend(data);
  }
};
