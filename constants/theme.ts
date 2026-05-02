import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

const palette = {
  primary: '#4F5DB5',       // Indigo légèrement plus foncé pour meilleur contraste
  primaryDark: '#3949AB',
  accent: '#00ACC1',        // Cyan plus foncé (était #26C6DA)
  danger: '#D32F2F',        // Rouge plus foncé (était #EF5350)
  success: '#388E3C',       // Vert plus foncé (était #66BB6A)
  warning: '#F57C00',       // Orange plus foncé (était #FFA726)
  backgroundLight: '#F0F2FA',
  surface: '#FFFFFF',
  textPrimary: '#111827',   // Quasi noir
  textSecondary: '#374151', // Gris foncé (était #6B7280 trop clair)
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: palette.primary,
    secondary: palette.accent,
    error: palette.danger,
    background: palette.backgroundLight,
    surface: palette.surface,
    onSurface: palette.textPrimary,
    onSurfaceVariant: palette.textSecondary,
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#8C9EFF',      // Indigo clair sur fond sombre
    secondary: '#4DD0E1',
    error: '#EF9A9A',
    background: '#0F172A',
    surface: '#1E293B',
    onSurface: '#F1F5F9',
    onSurfaceVariant: '#CBD5E1',
  },
};

export { palette };
