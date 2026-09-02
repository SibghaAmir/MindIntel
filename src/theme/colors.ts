export const colors = {
  background: '#0B1424',
  backgroundElevated: '#0E1A2E',
  card: '#182640',
  cardSecondary: '#202F4D',
  border: 'rgba(155, 168, 192, 0.14)',
  borderStrong: 'rgba(155, 168, 192, 0.24)',

  primaryBlue: '#647CFF',
  electricViolet: '#7B61FF',
  glowBlue: '#6FA8FF',

  textPrimary: '#F4F7FF',
  textSecondary: '#9BA8C0',
  textTertiary: 'rgba(155, 168, 192, 0.6)',

  success: '#51D88A',
  warning: '#FFB85C',
  danger: '#FF7A7A',

  overlay: 'rgba(6, 10, 20, 0.72)',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const gradients = {
  hero: ['#182640', '#0B1424'] as const,
  core: ['#7B61FF', '#647CFF', '#6FA8FF'] as const,
  cta: ['#647CFF', '#7B61FF'] as const,
  glow: ['rgba(111,168,255,0.35)', 'rgba(111,168,255,0)'] as const,
  successGlow: ['rgba(81,216,138,0.35)', 'rgba(81,216,138,0)'] as const,
  cardSheen: ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0)'] as const,
};

export const lightColors = {
  background: '#F5F7FA',
  backgroundElevated: '#FFFFFF',
  card: '#FFFFFF',
  cardSecondary: '#F0F3F8',
  border: 'rgba(0, 20, 50, 0.08)',
  borderStrong: 'rgba(0, 20, 50, 0.16)',

  primaryBlue: '#3A5CFF',
  electricViolet: '#6041FF',
  glowBlue: '#4A8CFF',

  textPrimary: '#1A2333',
  textSecondary: '#6B7A99',
  textTertiary: 'rgba(26, 35, 51, 0.5)',

  success: '#29B969',
  warning: '#F59A23',
  danger: '#F25252',

  overlay: 'rgba(255, 255, 255, 0.72)',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const lightGradients = {
  hero: ['#FFFFFF', '#F5F7FA'] as const,
  core: ['#6041FF', '#3A5CFF', '#4A8CFF'] as const,
  cta: ['#3A5CFF', '#6041FF'] as const,
  glow: ['rgba(74,140,255,0.25)', 'rgba(74,140,255,0)'] as const,
  successGlow: ['rgba(41,185,105,0.25)', 'rgba(41,185,105,0)'] as const,
  cardSheen: ['rgba(0,0,0,0.02)', 'rgba(0,0,0,0)'] as const,
};

export type ThemeColors = typeof colors;
