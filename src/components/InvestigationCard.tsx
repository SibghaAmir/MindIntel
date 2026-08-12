import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GlassCard } from './GlassCard';
import { AIInvestigationCore, CoreState } from './AIInvestigationCore';
import { colors, spacing, typography } from '@/src/theme';

interface InvestigationCardProps {
  status: string;
  message: string;
  coreState: CoreState;
}

export function InvestigationCard({ status, message, coreState }: InvestigationCardProps) {
  return (
    <GlassCard style={styles.card} secondary>
      <View style={styles.headerRow}>
        <Text style={typography.eyebrow}>AI Investigation</Text>
        <View style={styles.statusPill}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>{status}</Text>
        </View>
      </View>
      <View style={styles.coreWrap}>
        <AIInvestigationCore state={coreState} size={120} />
      </View>
      <Text style={styles.message}>{message}</Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(111,168,255,0.12)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.glowBlue,
    marginRight: 6,
  },
  statusText: {
    ...typography.micro,
    color: colors.glowBlue,
  },
  coreWrap: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  message: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
