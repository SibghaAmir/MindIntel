import { useTheme } from '@/src/theme/ThemeContext';
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '@/src/components';
import { spacing, typography } from '@/src/theme';
import { useLoreStore } from '@/src/store/loreStore';
import { LORE_FRAGMENTS } from '@/src/data/lore';

export default function ArchivesScreen() {
  const { colors, gradients } = useTheme();
  const styles = useStyles(colors, gradients);
  
  const unlockedIds = useLoreStore(s => s.unlockedIds);
  const clearNewLoreFlag = useLoreStore(s => s.clearNewLoreFlag);

  useEffect(() => {
    clearNewLoreFlag();
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Ionicons name="library" size={32} color={colors.glowBlue} style={styles.icon} />
          <Text style={styles.title}>Archives</Text>
          <Text style={typography.eyebrow}>
            {unlockedIds.length} / {LORE_FRAGMENTS.length} FRAGMENTS RECOVERED
          </Text>
        </View>

        <View style={styles.list}>
          {LORE_FRAGMENTS.map((frag, i) => {
            const isUnlocked = unlockedIds.includes(frag.id);
            return (
              <GlassCard 
                key={frag.id} 
                style={[styles.card, !isUnlocked && styles.lockedCard]}
              >
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, !isUnlocked && styles.lockedText]}>
                    {isUnlocked ? frag.title : 'ENCRYPTED FRAGMENT'}
                  </Text>
                  <Ionicons 
                    name={isUnlocked ? "lock-open-outline" : "lock-closed-outline"} 
                    size={20} 
                    color={isUnlocked ? colors.glowBlue : colors.textTertiary} 
                  />
                </View>
                {isUnlocked ? (
                  <Text style={styles.cardContent}>{frag.content}</Text>
                ) : (
                  <Text style={styles.lockedSubtext}>
                    Defeat the AI in standard or reverse mode for a chance to decrypt this file.
                  </Text>
                )}
              </GlassCard>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const useStyles = (colors: any, gradients: any) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.huge * 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  icon: {
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  list: {
    gap: spacing.md,
  },
  card: {
    width: '100%',
  },
  lockedCard: {
    opacity: 0.7,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  lockedText: {
    color: colors.textTertiary,
  },
  cardContent: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  lockedSubtext: {
    ...typography.caption,
    color: colors.textTertiary,
  },
});
