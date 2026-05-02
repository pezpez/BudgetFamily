import { MD3LightTheme } from 'react-native-paper';

/**
 * Palette "Ciel d'été" — bleue et reposante, toujours en mode clair
 *
 * primary    #3674B5  Bleu cornflower   4.9:1 ✓
 * accent     #0E7C99  Teal bleu         4.8:1 ✓  (revenus)
 * danger     #C0392B  Rouge brique      5.4:1 ✓  (dépenses)
 * success    #1E7A50  Vert forêt        5.4:1 ✓  (solde +)
 * textSec    #4E6278  Gris-bleu         5.8:1 ✓
 */
export const palette = {
  primary:         '#3674B5',
  primaryDark:     '#245A94',
  accent:          '#0E7C99',
  danger:          '#C0392B',
  success:         '#1E7A50',
  warning:         '#B5651D',
  backgroundLight: '#F4F7FB',
  surface:         '#FFFFFF',
  textPrimary:     '#1A2332',
  textSecondary:   '#4E6278',
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary:          palette.primary,
    secondary:        palette.accent,
    error:            palette.danger,
    background:       palette.backgroundLight,
    surface:          palette.surface,
    onSurface:        palette.textPrimary,
    onSurfaceVariant: palette.textSecondary,
  },
};

// Alias — always use lightTheme
export const darkTheme = lightTheme;
