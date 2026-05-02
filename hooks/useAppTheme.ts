import { palette } from '../constants/theme';

// Toujours mode clair — reposant, lisible
export function useAppTheme() {
  return {
    isDark: false,
    colors: {
      background:     palette.backgroundLight,
      surface:        palette.surface,
      surfaceVariant: '#E3EBF6',
      border:         '#C5D3E0',
      inputBg:        '#F8FAFE',
      textPrimary:    palette.textPrimary,
      textSecondary:  palette.textSecondary,
      primary:        palette.primary,
    },
  };
}
