import { create } from 'zustand';

export type Difficulty = 'easy' | 'normal' | 'expert';
export type AIPersonality = 'analytical' | 'sarcastic' | 'aggressive';

interface SettingsStore {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  difficulty: Difficulty;
  personality: AIPersonality;
  darkTheme: boolean;
  toggleSound: () => void;
  toggleHaptics: () => void;
  toggleDarkTheme: () => void;
  setDifficulty: (difficulty: Difficulty) => void;
  setPersonality: (personality: AIPersonality) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  soundEnabled: true,
  hapticsEnabled: true,
  difficulty: 'normal',
  personality: 'analytical',
  darkTheme: true,
  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
  toggleHaptics: () => set((s) => ({ hapticsEnabled: !s.hapticsEnabled })),
  toggleDarkTheme: () => set((s) => ({ darkTheme: !s.darkTheme })),
  setDifficulty: (difficulty) => set({ difficulty }),
  setPersonality: (personality) => set({ personality }),
}));
