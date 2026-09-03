import type { CategoryOption, ModeOption } from '@/src/types/game';

export const CATEGORY_OPTIONS: CategoryOption[] = [
  { id: 'people', label: 'People', icon: 'person-outline', description: 'Real humans, living or historical' },
  { id: 'characters', label: 'Characters', icon: 'sparkles-outline', description: 'Fictional figures from stories' },
  { id: 'animals', label: 'Animals', icon: 'paw-outline', description: 'Creatures, wild or domestic' },
  { id: 'places', label: 'Places', icon: 'location-outline', description: 'Cities, landmarks, countries' },
  { id: 'objects', label: 'Objects', icon: 'cube-outline', description: 'Everyday or extraordinary things' },
  { id: 'games', label: 'Games', icon: 'game-controller-outline', description: 'Video games or board games' },
  { id: 'brands', label: 'Brands', icon: 'pricetag-outline', description: 'Companies and products' },
  {
    id: 'anything',
    label: 'Anything',
    icon: 'infinite-outline',
    description: 'Let the AI investigate without limits',
    emphasized: true,
  },
  {
    id: 'custom',
    label: 'Custom Niche',
    icon: 'create-outline',
    description: 'Type any niche category you want',
  },
];

export const MODE_OPTIONS: ModeOption[] = [
  {
    id: 'standard',
    title: '20 Questions',
    subtitle: 'Standard Investigation',
    questionCount: 20,
  },
  {
    id: 'rapid',
    title: '10 Questions',
    subtitle: 'Rapid Investigation',
    questionCount: 10,
  },
];
