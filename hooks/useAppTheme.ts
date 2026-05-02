import { useColorScheme } from 'react-native';
import { useTheme } from 'react-native-paper';

export function useAppTheme() {
  const scheme = useColorScheme();
  const theme = useTheme();
  const isDark = scheme === 'dark';

  return {
    isDark,
    colors: {
      background: isDark ? '#111827' : '#F8F9FE',
      surface: isDark ? '#1F2937' : '#FFFFFF',
      surfaceVariant: isDark ? '#374151' : '#F3F4F6',
      border: isDark ? '#374151' : '#E5E7EB',
      inputBg: isDark ? '#1F2937' : '#F9FAFB',
      textPrimary: isDark ? '#F9FAFB' : '#1A1C2E',
      textSecondary: isDark ? '#9CA3AF' : '#6B7280',
      primary: theme.colors.primary,
    },
  };
}
