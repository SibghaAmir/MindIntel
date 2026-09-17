import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface EconomyStore {
  intelCredits: number;
  addCredits: (amount: number) => void;
  spendCredits: (amount: number) => boolean;
}

export const useEconomyStore = create<EconomyStore>()(
  persist(
    (set, get) => ({
      intelCredits: 200, // Initial balance for testing
      
      addCredits: (amount) => {
        set({ intelCredits: get().intelCredits + amount });
      },
      
      spendCredits: (amount) => {
        const { intelCredits } = get();
        if (intelCredits >= amount) {
          set({ intelCredits: intelCredits - amount });
          return true;
        }
        return false;
      }
    }),
    {
      name: 'mindintel-economy',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
