import { create } from 'zustand';

export type Difficulty = 'easy' | 'normal' | 'expert';

interface SettingsStore {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  difficulty: Difficulty;
  darkTheme: boolean;
  toggleSound: () => void;
  toggleHaptics: () => void;
  setDifficulty: (difficulty: Difficulty) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  soundEnabled: true,
  hapticsEnabled: true,
  difficulty: 'normal',
  darkTheme: true,
  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
  toggleHaptics: () => set((s) => ({ hapticsEnabled: !s.hapticsEnabled })),
  setDifficulty: (difficulty) => set({ difficulty }),
}));
