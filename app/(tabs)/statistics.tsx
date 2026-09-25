import { useTheme } from '@/src/theme/ThemeContext';
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard, StatCard, SectionHeader, ConfidenceBar } from '@/src/components';
import { colors, spacing, typography } from '@/src/theme';
import { useCasesStore } from '@/src/store/casesStore';

export default function StatisticsScreen() {
  const { colors, gradients } = useTheme();
  const styles = useStyles(colors, gradients);

  const { record, archetype, archetypeDescription, archetypeColor, casesSinceProfile, fetchProfile } = useCasesStore();
  const total = record.aiWins + record.playerWins || 1;
  const aiWinRate = Math.round((record.aiWins / total) * 100);
  const playerWinRate = 100 - aiWinRate;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={typography.h1}>Statistics</Text>
        <Text style={styles.subtitle}>Your investigation performance, tracked case by case.</Text>

        <View style={styles.grid}>
          <StatCard label="Cases Played" value={record.totalCases} icon="briefcase-outline" accentColor={colors.glowBlue} style={styles.gridItem} />
          <StatCard label="AI Wins" value={record.aiWins} icon="hardware-chip-outline" accentColor={colors.electricViolet} style={styles.gridItem} />
        </View>
        <View style={styles.grid}>
          <StatCard label="Your Wins" value={record.playerWins} icon="ribbon-outline" accentColor={colors.success} style={styles.gridItem} />
          <StatCard label="Avg. Questions" value={record.averageQuestions} icon="help-circle-outline" accentColor={colors.warning} style={styles.gridItem} />
        </View>

        <GlassCard style={styles.bestScoreCard}>
          <Text style={typography.eyebrow}>Best Score</Text>
          <Text style={styles.bestScoreValue}>{record.bestScore}</Text>
          <Text style={styles.bestScoreCaption}>Set across {record.totalCases} investigations</Text>
        </GlassCard>

        <SectionHeader title="Psychological Profile" style={styles.sectionSpacing} />
        <GlassCard>
          {archetype ? (
            <>
              <Text style={{ ...typography.h3, color: archetypeColor || colors.electricViolet, marginBottom: spacing.xs }}>
                {archetype}
              </Text>
              <Text style={{ ...typography.bodyMedium, color: colors.textSecondary }}>
                {archetypeDescription}
              </Text>
            </>
          ) : (
            <Text style={{ ...typography.bodyMedium, color: colors.textTertiary }}>
              Complete {Math.max(0, 5 - casesSinceProfile)} more cases to generate a psychological profile.
            </Text>
          )}
          {casesSinceProfile >= 5 && (
            <SecondaryButton 
              label="RE-ANALYZE PROFILE" 
              icon="refresh" 
              onPress={() => fetchProfile()} 
              style={{ marginTop: spacing.md }}
            />
          )}
        </GlassCard>

        <SectionHeader title="AI vs Player" style={styles.sectionSpacing} />
        <GlassCard>
          <ConfidenceBar label="AI win rate" percentage={aiWinRate} color={colors.electricViolet} />
          <ConfidenceBar label="Player win rate" percentage={playerWinRate} color={colors.success} />
        </GlassCard>
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
    paddingTop: spacing.md,
    paddingBottom: spacing.huge * 2,
  },
  subtitle: {
    ...typography.caption,
    marginTop: 4,
    marginBottom: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  gridItem: {
    flex: 1,
  },
  bestScoreCard: {
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    paddingVertical: spacing.xl,
  },
  bestScoreValue: {
    fontSize: 44,
    fontWeight: '800',
    color: colors.glowBlue,
    marginTop: spacing.xs,
  },
  bestScoreCaption: {
    ...typography.caption,
    marginTop: 4,
  },
  sectionSpacing: {
    marginTop: spacing.sm,
  },
});
