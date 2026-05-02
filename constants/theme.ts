import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

const palette = {
  primary: '#5C6BC0',
  primaryDark: '#3949AB',
  accent: '#26C6DA',
  danger: '#EF5350',
  success: '#66BB6A',
  warning: '#FFA726',
  backgroundLight: '#F8F9FE',
  surface: '#FFFFFF',
  textPrimary: '#1A1C2E',
  textSecondary: '#6B7280',
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
    primary: '#7986CB',
    secondary: palette.accent,
    error: palette.danger,
  },
};

export { palette };
