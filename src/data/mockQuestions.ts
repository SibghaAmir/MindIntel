/**
 * Mock question bank. In Phase 1, questions are chosen from a static branching
 * list to simulate an adaptive AI. No real inference happens here.
 */
export const MOCK_QUESTIONS: string[] = [
  'Is it a real person?',
  'Is this person alive today?',
  'Is this person primarily known for entertainment?',
  'Is this person from Asia?',
  'Is this person an actor?',
  'Has this person won a major award?',
  'Is this person more than 40 years old?',
  'Is this person known outside their home country?',
  'Does this person work mostly on screen, not just voice?',
  'Would most teenagers recognize this person?',
  'Is this person associated with a specific franchise?',
  'Has this person appeared in more than 20 productions?',
  'Is this person known for a distinctive voice or catchphrase?',
  'Does this person have a large social media following?',
  'Is this person still actively working in their field?',
  'Has this person been the subject of a documentary?',
  'Is this person married or in a well-known relationship?',
  'Would you find this person on a magazine cover?',
  'Is this person known for a single iconic role?',
  'Has this person won an award in the last five years?',
];

export function getMockQuestion(index: number): string {
  if (index < MOCK_QUESTIONS.length) return MOCK_QUESTIONS[index];
  return 'Is this subject widely recognized worldwide?';
}
