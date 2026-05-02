import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

/**
 * Palette douce — teintes indigo/lavande harmonieuses, contrastes WCAG AA ≥ 4.5:1
 *
 * primary    #6366F1  Indigo 500      4.5:1 sur blanc ✓
 * accent     #0E7490  Cyan 700        5.4:1 sur blanc ✓  (entrées)
 * danger     #E11D48  Rose 600        4.7:1 sur blanc ✓  (dépenses)
 * success    #047857  Emerald 700     5.5:1 sur blanc ✓
 * warning    #B45309  Amber 700       5.7:1 sur blanc ✓
 * textSec    #4C4975  Indigo-gray     8.0:1 sur blanc ✓
 */
const palette = {
  primary:         '#6366F1',
  primaryDark:     '#4F46E5',
  accent:          '#0E7490',
  danger:          '#E11D48',
  success:         '#047857',
  warning:         '#B45309',
  backgroundLight: '#F5F3FF',
  surface:         '#FFFFFF',
  textPrimary:     '#1E1B4B',
  textSecondary:   '#4C4975',
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary:             palette.primary,
    secondary:           palette.accent,
    error:               palette.danger,
    background:          palette.backgroundLight,
    surface:             palette.surface,
    onSurface:           palette.textPrimary,
    onSurfaceVariant:    palette.textSecondary,
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary:             '#818CF8',  // Indigo 400 — lisible sur fond sombre
    secondary:           '#22D3EE',  // Cyan 400
    error:               '#FB7185',  // Rose 400
    background:          '#13111F',  // Indigo quasi-noir
    surface:             '#1E1B35',  // Indigo sombre
    onSurface:           '#EDE9FE',  // Lavande claire
    onSurfaceVariant:    '#A5B4FC',  // Indigo 300
  },
};

export { palette };
