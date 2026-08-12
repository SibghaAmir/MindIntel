import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

export type IoniconName = ComponentProps<typeof Ionicons>['name'];

export type CaseCategoryId =
  | 'people'
  | 'characters'
  | 'animals'
  | 'places'
  | 'objects'
  | 'games'
  | 'brands'
  | 'anything';

export type InvestigationMode = 'standard' | 'rapid';

export type AnswerValue = 'yes' | 'no' | 'maybe' | 'unknown';

export type GameStatus =
  | 'idle'
  | 'in_progress'
  | 'concluding'
  | 'ai_win'
  | 'player_win';

export interface CategoryOption {
  id: CaseCategoryId;
  label: string;
  icon: IoniconName;
  description: string;
  emphasized?: boolean;
}

export interface ModeOption {
  id: InvestigationMode;
  title: string;
  subtitle: string;
  questionCount: number;
}

export interface QAEntry {
  question: string;
  answer: AnswerValue;
}

export interface CandidateGuess {
  name: string;
  confidence: number;
}

export interface CategoryBreakdownItem {
  label: string;
  percentage: number;
}

export interface InvestigationSnapshot {
  categoryBreakdown: CategoryBreakdownItem[];
  candidatesRemaining: number;
  aiConfidence: number;
  topPossibilities: string[];
}

export interface GameState {
  gameId: string;
  caseNumber: number;
  category: CaseCategoryId | null;
  mode: InvestigationMode;
  currentQuestion: string;
  questionNumber: number;
  maxQuestions: number;
  answers: QAEntry[];
  confidence: number;
  candidates: string[];
  status: GameStatus;
  guess: CandidateGuess | null;
  snapshot: InvestigationSnapshot;
}

export type CaseResultType = 'ai_victory' | 'player_victory';

export interface CaseRecord {
  id: string;
  caseNumber: number;
  subject: string;
  category: CaseCategoryId;
  questionsUsed: number;
  maxQuestions: number;
  result: CaseResultType;
  confidence: number;
  score: number;
  date: string;
}
