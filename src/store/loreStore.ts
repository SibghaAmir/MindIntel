import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LORE_FRAGMENTS } from '../data/lore';

interface LoreStore {
  unlockedIds: string[];
  hasNewLore: boolean;
  unlockRandomLore: () => { id: string; title: string } | null;
  clearNewLoreFlag: () => void;
  resetLore: () => void;
}

export const useLoreStore = create<LoreStore>()(
  persist(
    (set, get) => ({
      unlockedIds: [],
      hasNewLore: false,

      unlockRandomLore: () => {
        const { unlockedIds } = get();
        const locked = LORE_FRAGMENTS.filter(f => !unlockedIds.includes(f.id));
        
        if (locked.length === 0) return null;
        
        const randomLore = locked[Math.floor(Math.random() * locked.length)];
        
        set({
          unlockedIds: [...unlockedIds, randomLore.id],
          hasNewLore: true
        });
        
        return randomLore;
      },

      clearNewLoreFlag: () => set({ hasNewLore: false }),

      resetLore: () => set({ unlockedIds: [], hasNewLore: false })
    }),
    {
      name: 'mindintel-lore-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
