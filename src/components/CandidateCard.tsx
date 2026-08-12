import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '@/src/theme';

interface CandidateCardProps {
  rank: number;
  name: string;
}

export function CandidateCard({ rank, name }: CandidateCardProps) {
  return (
    <View style={styles.row}>
      <View style={styles.rankWrap}>
        <Text style={styles.rank}>{rank}</Text>
      </View>
      <Text style={styles.name}>{name}</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rankWrap: {
    width: 26,
    height: 26,
    borderRadius: radius.xs,
    backgroundColor: 'rgba(123,97,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  rank: {
    ...typography.micro,
    color: colors.electricViolet,
  },
  name: {
    ...typography.bodyMedium,
    flex: 1,
  },
});
