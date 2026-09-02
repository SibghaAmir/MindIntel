import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@/src/theme';
import { ThemeProvider } from '@/src/theme/ThemeContext';
import { AchievementToast } from '@/src/components';
import { audioManager } from '@/src/services/audioManager';
import { useSettingsStore } from '@/src/store/settingsStore';

export default function RootLayout() {
  const isDark = useSettingsStore((s) => s.darkTheme);
  useEffect(() => {
    audioManager.init();
  }, []);

  return (
    <ThemeProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.background} />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false, animation: 'fade' }} />
            <Stack.Screen name="new-case" options={{ presentation: 'card' }} />
            <Stack.Screen name="investigation" options={{ gestureEnabled: false }} />
            <Stack.Screen name="conclusion" options={{ gestureEnabled: false }} />
            <Stack.Screen name="result" options={{ gestureEnabled: false }} />
            <Stack.Screen name="how-to-play" options={{ presentation: 'modal' }} />
          </Stack>
          <AchievementToast />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
