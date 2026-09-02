import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSettingsStore } from '@/src/store/settingsStore';
import { colors as darkColors, lightColors, gradients as darkGradients, lightGradients } from './colors';

const ThemeContext = createContext({
  colors: darkColors,
  gradients: darkGradients,
  isDark: true,
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const isDark = useSettingsStore((s) => s.darkTheme);
  
  const value = {
    colors: isDark ? darkColors : lightColors,
    gradients: isDark ? darkGradients : lightGradients,
    isDark,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
