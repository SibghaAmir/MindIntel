import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from './GlassCard';
import { colors, radius, spacing, typography } from '@/src/theme';
import type { CaseRecord } from '@/src/types/game';

interface CaseCardProps {
  record: CaseRecord;
  onPress?: () => void;
}

export function CaseCard({ record }: CaseCardProps) {
  const isAiWin = record.result === 'ai_victory';

  return (
    <GlassCard style={styles.card} padded>
      <View style={styles.topRow}>
        <Text style={styles.caseNumber}>CASE #{String(record.caseNumber).padStart(3, '0')}</Text>
        <View
          style={[
            styles.statusPill,
            { backgroundColor: isAiWin ? 'rgba(81,216,138,0.14)' : 'rgba(255,184,92,0.14)' },
          ]}
        >
          <Ionicons
            name={isAiWin ? 'checkmark-circle' : 'person'}
            size={12}
            color={isAiWin ? colors.success : colors.warning}
          />
          <Text style={[styles.statusText, { color: isAiWin ? colors.success : colors.warning }]}>
            {isAiWin ? 'AI Victory' : 'Player Victory'}
          </Text>
        </View>
      </View>
      <Text style={styles.subject}>{record.subject}</Text>
      <View style={styles.metaRow}>
        <Ionicons name="help-circle-outline" size={14} color={colors.textSecondary} />
        <Text style={styles.metaText}>
          {record.questionsUsed} / {record.maxQuestions} questions
        </Text>
        <View style={styles.dotSep} />
        <Ionicons name="analytics-outline" size={14} color={colors.textSecondary} />
        <Text style={styles.metaText}>{record.confidence}% confidence</Text>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  caseNumber: {
    ...typography.micro,
    color: colors.textTertiary,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: 3,
    borderRadius: radius.pill,
    gap: 4,
  },
  statusText: {
    ...typography.micro,
    marginLeft: 2,
  },
  subject: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    ...typography.caption,
  },
  dotSep: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textTertiary,
    marginHorizontal: 4,
  },
});
