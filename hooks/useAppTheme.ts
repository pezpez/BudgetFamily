import { useColorScheme } from 'react-native';
import { useTheme } from 'react-native-paper';

export function useAppTheme() {
  const scheme = useColorScheme();
  const theme = useTheme();
  const isDark = scheme === 'dark';

  return {
    isDark,
    colors: {
      background:     isDark ? '#13111F' : '#F5F3FF',
      surface:        isDark ? '#1E1B35' : '#FFFFFF',
      surfaceVariant: isDark ? '#2D2A4E' : '#EDEAFE',
      border:         isDark ? '#3D3A6E' : '#D4D0F8',
      inputBg:        isDark ? '#252243' : '#FAFAFF',
      textPrimary:    isDark ? '#EDE9FE' : '#1E1B4B',
      textSecondary:  isDark ? '#A5B4FC' : '#4C4975',
      primary:        theme.colors.primary,
    },
  };
}
