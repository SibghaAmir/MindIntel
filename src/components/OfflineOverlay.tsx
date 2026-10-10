import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeContext';
import { spacing, typography } from '@/src/theme';

export function OfflineOverlay() {
  const { colors } = useTheme();
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? true);
    });
    return () => unsubscribe();
  }, []);

  if (isConnected) return null;

  return (
    <Animated.View 
      entering={FadeIn.duration(400)} 
      exiting={FadeOut.duration(400)}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.content}>
        <Ionicons name="cloud-offline-outline" size={80} color={colors.danger} style={{ marginBottom: spacing.lg }} />
        <Text style={[typography.h2, { color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.md }]}>
          UPLINK SEVERED
        </Text>
        <Text style={[typography.bodyMedium, { color: colors.textSecondary, textAlign: 'center', maxWidth: '80%' }]}>
          Kasoti requires an active quantum connection to the AI Core. Please restore your internet connection to continue the investigation.
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  }
});
