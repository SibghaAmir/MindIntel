export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // Ionicons name
  color: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_blood',
    title: 'First Case',
    description: 'Complete your first investigation.',
    icon: 'star',
    color: '#FFB85C',
  },
  {
    id: 'master_deception',
    title: 'Master of Deception',
    description: 'Outsmart the AI 5 times.',
    icon: 'skull',
    color: '#FF7A7A',
  },
  {
    id: 'open_book',
    title: 'Open Book',
    description: 'The AI guessed your subject in under 5 questions.',
    icon: 'book',
    color: '#51D88A',
  },
  {
    id: 'marathon_mind',
    title: 'Marathon Mind',
    description: 'Play 20 total cases.',
    icon: 'fitness',
    color: '#647CFF',
  },
  {
    id: 'perfect_confidence',
    title: 'Crystal Clear',
    description: 'AI guesses correctly with 100% confidence.',
    icon: 'diamond',
    color: '#7B61FF',
  },
];
