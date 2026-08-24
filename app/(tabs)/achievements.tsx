import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SectionHeader, GlassCard } from '@/src/components';
import { colors, radius, spacing, typography } from '@/src/theme';
import { useCasesStore } from '@/src/store/casesStore';
import { ACHIEVEMENTS } from '@/src/data/achievements';

export default function AchievementsScreen() {
  const unlocked = useCasesStore((s) => s.unlockedAchievements);
  const totalUnlocked = unlocked.length;
  const totalAchievements = ACHIEVEMENTS.length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <SectionHeader title="Achievements" />
        <Text style={styles.subtitle}>
          {totalUnlocked} / {totalAchievements} Unlocked
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {ACHIEVEMENTS.map((achievement) => {
          const isUnlocked = unlocked.includes(achievement.id);

          return (
            <GlassCard
              key={achievement.id}
              style={[styles.card, !isUnlocked && styles.lockedCard]}
            >
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: isUnlocked ? achievement.color + '20' : colors.cardSecondary },
                ]}
              >
                <Ionicons
                  name={achievement.icon as any}
                  size={24}
                  color={isUnlocked ? achievement.color : colors.textTertiary}
                />
              </View>
              <View style={styles.textWrap}>
                <Text style={[styles.title, !isUnlocked && { color: colors.textSecondary }]}>
                  {achievement.title}
                </Text>
                <Text style={styles.description}>{achievement.description}</Text>
              </View>
              {!isUnlocked && (
                <Ionicons name="lock-closed" size={16} color={colors.textTertiary} />
              )}
            </GlassCard>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: -spacing.xs,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100, // accommodate tab bar
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  lockedCard: {
    opacity: 0.7,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  description: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
