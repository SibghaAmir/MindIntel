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
  syndicate_agents: string[];
  status: string;
  confidence: number;
  candidates: string[];
  current_question: string | null;
  guess: string | null;
  reason: string | null;
  contradiction: string | null;
  is_daily: boolean;
  personality: string;
}

// Maps backend schema to our frontend Zustand state shape
const mapBackendStateToFrontend = (backend: BackendGameState): GameState => {
  // Zip questions and answers
  const answers: QAEntry[] = backend.questions.slice(0, backend.answers.length).map((q, i) => ({
    question: q,
    answer: backend.answers[i] as any,
    agent: backend.syndicate_agents && backend.syndicate_agents[i] ? backend.syndicate_agents[i] : undefined,
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
    contradiction: backend.contradiction,
    isDaily: backend.is_daily,
    personality: backend.personality,
    syndicateAgents: backend.syndicate_agents,
    doppelgangerHistory: (backend as any).doppelganger_history || [],
    hivemindLogs: (backend as any).hivemind_logs || [],
  };
};

export const gameApi = {
  createGame: async (category: string, mode: string, difficulty: string, personality: string, subject?: string): Promise<GameState> => {
    const backendState = await fetchApi<BackendGameState>('/games', {
      method: 'POST',
      body: JSON.stringify({ category, mode, difficulty, personality, subject }),
    });
    return mapBackendStateToFrontend(backendState);
  },

  createDailyGame: async (): Promise<GameState> => {
    const backendState = await fetchApi<BackendGameState>('/games/daily', {
      method: 'POST',
    });
    return mapBackendStateToFrontend(backendState);
  },

  submitAnswer: async (gameId: string, answer: AnswerValue): Promise<GameState> => {
    const data = await fetchApi<BackendGameState>(`/games/${gameId}/answers`, {
      method: 'POST',
      body: JSON.stringify({ answer }),
    });
    return mapBackendStateToFrontend(data);
  },
  
  factCheck: async (gameId: string): Promise<GameState> => {
    const data = await fetchApi<BackendGameState>(`/games/${gameId}/fact_check`, {
      method: 'POST',
    });
    return mapBackendStateToFrontend(data);
  },

  applyBribe: async (gameId: string): Promise<GameState> => {
    const data = await fetchApi<BackendGameState>(`/games/${gameId}/bribe`, {
      method: 'POST',
    });
    return mapBackendStateToFrontend(data);
  },

  forceGuess: async (gameId: string): Promise<GameState> => {
    const data = await fetchApi<BackendGameState>(`/games/${gameId}/force-guess`, {
      method: 'POST',
    });
    return mapBackendStateToFrontend(data);
  },

  submitDesperationClue: async (gameId: string, clue: string): Promise<GameState> => {
    const data = await fetchApi<BackendGameState>(`/games/${gameId}/desperation`, {
      method: 'POST',
      body: JSON.stringify({ clue }),
    });
    return mapBackendStateToFrontend(data);
  },

  confirmGuess: async (gameId: string, correct: boolean): Promise<GameState> => {
    const data = await fetchApi<BackendGameState>(`/games/${gameId}/guess/confirm`, {
      method: 'POST',
      body: JSON.stringify({ correct }),
    });
    return mapBackendStateToFrontend(data);
  },

  submitDecoyGuess: async (gameId: string, target: string, decoy: string): Promise<GameState> => {
    const data = await fetchApi<BackendGameState>(`/games/${gameId}/decoy-guess`, {
      method: 'POST',
      body: JSON.stringify({ target, decoy }),
    });
    return mapBackendStateToFrontend(data);
  },

  askSyndicate: async (gameId: string, question: string, agent: string): Promise<GameState> => {
    const data = await fetchApi<BackendGameState>(`/games/${gameId}/syndicate-ask`, {
      method: 'POST',
      body: JSON.stringify({ question, agent }),
    });
    return mapBackendStateToFrontend(data);
  },

  doppelgangerTurn: async (
    gameId: string, 
    player_answer_to_ai: string, 
    player_question_for_ai: string, 
    player_is_guessing: boolean
  ): Promise<GameState> => {
    const data = await fetchApi<BackendGameState>(`/games/${gameId}/doppelganger-turn`, {
      method: 'POST',
      body: JSON.stringify({ player_answer_to_ai, player_question_for_ai, player_is_guessing }),
    });
    return mapBackendStateToFrontend(data);
  },

  learnSubject: async (subject: string, category: string): Promise<void> => {
    await fetchApi('/games/learn/subject', {
      method: 'POST',
      body: JSON.stringify({ subject, category }),
    });
  },

  getHint: async (gameId: string): Promise<string> => {
    const data = await fetchApi<{ hint: string }>(`/games/${gameId}/hint`);
    return data.hint;
  },

  getTranscript: async (gameId: string): Promise<string> => {
    const data = await fetchApi<{ transcript: string }>(`/games/${gameId}/transcript`);
    return data.transcript;
  },

  applyRetcon: async (gameId: string, index: number): Promise<GameState> => {
    const data = await fetchApi<BackendGameState>(`/games/${gameId}/retcon`, {
      method: 'POST',
      body: JSON.stringify({ index }),
    });
    return mapBackendStateToFrontend(data);
  },

  analyzeProfile: async (history: string[][]): Promise<{ archetype: string, description: string, color: string }> => {
    return fetchApi<{ archetype: string, description: string, color: string }>(`/games/profile`, {
      method: 'POST',
      body: JSON.stringify({ history }),
    });
  },

  getDeadDrops: async () => {
    return fetchApi<any[]>(`/games/deaddrops`);
  },

  createDeadDrop: async (creator: string, subject: string, bounty: number, category: string) => {
    return fetchApi<any>(`/games/deaddrops`, {
      method: 'POST',
      body: JSON.stringify({ creator, subject, bounty, category }),
    });
  },
};
