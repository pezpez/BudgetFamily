import { useColorScheme } from 'react-native';
import { useTheme } from 'react-native-paper';

export function useAppTheme() {
  const scheme = useColorScheme();
  const theme = useTheme();
  const isDark = scheme === 'dark';

  return {
    isDark,
    colors: {
      background:     isDark ? '#0F172A' : '#F0F2FA',
      surface:        isDark ? '#1E293B' : '#FFFFFF',
      surfaceVariant: isDark ? '#334155' : '#EEF0F8',
      border:         isDark ? '#334155' : '#CBD5E1',
      inputBg:        isDark ? '#1E293B' : '#F8FAFF',
      // Textes — contraste WCAG AA garanti
      textPrimary:    isDark ? '#F1F5F9' : '#111827',
      textSecondary:  isDark ? '#CBD5E1' : '#374151',
      primary:        theme.colors.primary,
    },
  };
}
