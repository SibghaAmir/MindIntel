import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { spacing, typography, radius } from '../theme';
import { GlassCard } from './GlassCard';
import { PrimaryButton } from './PrimaryButton';
import { useEconomyStore } from '../store/economyStore';
import { useGameStore } from '../store/gameStore';

interface BlackMarketModalProps {
  visible: boolean;
  onClose: () => void;
}

export function BlackMarketModal({ visible, onClose }: BlackMarketModalProps) {
  const { colors } = useTheme();
  const styles = useStyles(colors);
  const { intelCredits, spendCredits } = useEconomyStore();
  const { applyBribe, applyAssassination, applyPolygraph, polygraphActive } = useGameStore();

  const handlePurchase = (cost: number, action: () => void) => {
    if (spendCredits(cost)) {
      action();
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <GlassCard style={styles.card}>
          <View style={styles.header}>
            <Ionicons name="cart" size={24} color={colors.danger} />
            <Text style={styles.title}>BLACK MARKET</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>

          <View style={styles.balanceRow}>
            <Ionicons name="server" size={16} color={colors.glowBlue} />
            <Text style={styles.balanceText}>Intel Credits: {intelCredits}</Text>
          </View>

          <View style={styles.options}>
            <TouchableOpacity 
              style={[styles.optionCard, intelCredits < 50 && styles.disabledOption]} 
              onPress={() => handlePurchase(50, applyBribe)}
              disabled={intelCredits < 50}
            >
              <Ionicons name="time" size={24} color={colors.warning} />
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>The Bribe (Cost: 50)</Text>
                <Text style={styles.optionDesc}>Buy 3 extra questions from the backend system.</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.optionCard, intelCredits < 100 && styles.disabledOption]} 
              onPress={() => handlePurchase(100, applyAssassination)}
              disabled={intelCredits < 100}
            >
              <Ionicons name="skull" size={24} color={colors.danger} />
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>The Assassination (Cost: 100)</Text>
                <Text style={styles.optionDesc}>Instantly eliminate 3 active suspects from the Evidence Board.</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.optionCard, (intelCredits < 30 || polygraphActive) && styles.disabledOption]} 
              onPress={() => handlePurchase(30, applyPolygraph)}
              disabled={intelCredits < 30 || polygraphActive}
            >
              <Ionicons name="pulse" size={24} color={colors.success} />
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>The Polygraph (Cost: 30)</Text>
                <Text style={styles.optionDesc}>Force the AI to reveal its exact current confidence percentage.</Text>
              </View>
            </TouchableOpacity>
          </View>
        </GlassCard>
      </View>
    </Modal>
  );
}

const useStyles = (colors: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    padding: spacing.lg,
    backgroundColor: '#0a0a0a',
    borderColor: colors.danger,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.danger,
    marginLeft: spacing.sm,
    flex: 1,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  balanceText: {
    ...typography.bodyMedium,
    color: colors.glowBlue,
    marginLeft: spacing.xs,
    fontWeight: 'bold',
  },
  options: {
    gap: spacing.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  disabledOption: {
    opacity: 0.4,
  },
  optionInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  optionTitle: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDesc: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
