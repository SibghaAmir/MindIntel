import { colors } from './colors';

export const typography = {
  display: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800' as const,
    letterSpacing: 0.2,
    color: colors.textPrimary,
  },
  h1: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800' as const,
    letterSpacing: 0.2,
    color: colors.textPrimary,
  },
  h2: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700' as const,
    letterSpacing: 0.1,
    color: colors.textPrimary,
  },
  h3: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  eyebrow: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700' as const,
    letterSpacing: 1.6,
    color: colors.textSecondary,
    textTransform: 'uppercase' as const,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400' as const,
    color: colors.textPrimary,
  },
  bodyMedium: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
  micro: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600' as const,
    letterSpacing: 0.8,
    color: colors.textSecondary,
    textTransform: 'uppercase' as const,
  },
  button: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700' as const,
    letterSpacing: 0.4,
  },
  statNumber: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '800' as const,
    color: colors.textPrimary,
  },
};
