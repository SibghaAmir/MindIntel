import type { CategoryBreakdownItem, InvestigationSnapshot } from '@/src/types/game';

const CANDIDATE_POOL = [
  'Shah Rukh Khan',
  'Cristiano Ronaldo',
  'Leonardo DiCaprio',
  'Dwayne Johnson',
  'Zendaya',
  'Tom Holland',
  'Priyanka Chopra',
  'Keanu Reeves',
  'Emma Watson',
  'Ryan Reynolds',
];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Produces a deterministic-feeling but progressively narrowing mock snapshot
 * of "AI investigation data" based on how many questions have been answered.
 */
export function buildMockSnapshot(questionNumber: number, maxQuestions: number): InvestigationSnapshot {
  const progress = clamp(questionNumber / maxQuestions, 0, 1);

  const personPct = Math.round(40 + progress * 45);
  const remaining = 100 - personPct;
  const characterPct = Math.round(remaining * 0.45);
  const objectPct = Math.round(remaining * 0.3);
  const otherPct = 100 - personPct - characterPct - objectPct;

  const categoryBreakdown: CategoryBreakdownItem[] = [
    { label: 'Person', percentage: personPct },
    { label: 'Character', percentage: characterPct },
    { label: 'Object', percentage: objectPct },
    { label: 'Other', percentage: Math.max(otherPct, 0) },
  ];

  const candidatesRemaining = Math.max(2, Math.round(320 * (1 - progress) ** 1.6));
  const aiConfidence = clamp(Math.round(30 + progress * 68), 5, 98);

  const topPossibilities = CANDIDATE_POOL.slice(0, 3).map((name, i) =>
    i === 0 ? name : name
  );

  return {
    categoryBreakdown,
    candidatesRemaining,
    aiConfidence,
    topPossibilities,
  };
}

export function pickMockGuess(): { name: string; confidence: number } {
  const name = CANDIDATE_POOL[0];
  return { name, confidence: 93 };
}

export const EVIDENCE_POINTS = [
  'Real person',
  'Currently alive',
  'Male',
  'Asian',
  'Actor',
  'Entertainment',
];
