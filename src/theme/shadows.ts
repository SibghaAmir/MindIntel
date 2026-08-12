import { Platform } from 'react-native';

const build = (color: string, opacity: number, radiusPx: number, elevation: number) =>
  Platform.select({
    ios: {
      shadowColor: color,
      shadowOpacity: opacity,
      shadowRadius: radiusPx,
      shadowOffset: { width: 0, height: radiusPx / 2.5 },
    },
    android: { elevation },
    default: {
      shadowColor: color,
      shadowOpacity: opacity,
      shadowRadius: radiusPx,
      shadowOffset: { width: 0, height: radiusPx / 2.5 },
    },
  });

export const shadows = {
  card: build('#000000', 0.35, 16, 6),
  cardSoft: build('#000000', 0.22, 10, 3),
  glowBlue: build('#6FA8FF', 0.45, 24, 8),
  glowViolet: build('#7B61FF', 0.4, 26, 8),
  button: build('#647CFF', 0.5, 18, 6),
};
