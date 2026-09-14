import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSettingsStore } from '@/src/store/settingsStore';
import { useGameStore } from '@/src/store/gameStore';
import { colors as darkColors, lightColors, gradients as darkGradients, lightGradients } from './colors';

const ThemeContext = createContext({
  colors: darkColors,
  gradients: darkGradients,
  isDark: true,
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const isDark = useSettingsStore((s) => s.darkTheme);
  const personality = useGameStore((s) => s.personality);
  const status = useGameStore((s) => s.status);
  
  let currentColors = isDark ? { ...darkColors } : { ...lightColors };
  let currentGradients = isDark ? { ...darkGradients } : { ...lightGradients };

  // Only apply persona themes if a game is active or finished (not idle)
  if (status !== 'idle') {
    if (personality === 'bad_cop') {
      currentColors.background = '#1a0505';
      currentColors.card = '#2a0a0a';
      currentColors.glowBlue = currentColors.danger;
      currentGradients.core = ['#ff0000', '#8b0000'];
      currentGradients.glass = ['rgba(40,10,10,0.8)', 'rgba(20,5,5,0.9)'];
    } else if (personality === 'noir') {
      currentColors.background = '#000000';
      currentColors.card = '#111111';
      currentColors.glowBlue = '#ffffff';
      currentColors.electricViolet = '#aaaaaa';
      currentColors.success = '#ffffff';
      currentColors.danger = '#ffffff';
      currentColors.warning = '#dddddd';
      currentColors.border = '#333333';
      currentColors.borderStrong = '#555555';
      currentGradients.core = ['#ffffff', '#555555'];
      currentGradients.glass = ['rgba(30,30,30,0.8)', 'rgba(10,10,10,0.9)'];
    }
  }

  const value = {
    colors: currentColors,
    gradients: currentGradients,
    isDark,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
