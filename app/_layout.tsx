import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { PaperProvider } from 'react-native-paper';

import { lightTheme } from '../constants/theme';
import { runMigrations } from '../db/migrations';
import { seedDefaultCategories } from '../db/seed';
import { generateRecurringTransactions } from '../utils/recurring';
import { useSettingsStore } from '../store/useSettingsStore';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

const HEADER = {
  backgroundColor: '#FFFFFF',
  titleColor:      '#1A2332',
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
  const [dbReady, setDbReady] = useState(false);
  const loadSettings = useSettingsStore((s) => s.loadSettings);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    async function initDb() {
      await runMigrations();
      await seedDefaultCategories();
      await generateRecurringTransactions();
      await loadSettings();
      setDbReady(true);
    }
    initDb();
  }, []);

  useEffect(() => {
    if (loaded && dbReady) SplashScreen.hideAsync();
  }, [loaded, dbReady]);

  if (!loaded || !dbReady) return null;

  return (
    <PaperProvider theme={lightTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="transaction/[id]"
          options={{
            title: 'Modifier la transaction', presentation: 'modal',
            headerStyle: { backgroundColor: HEADER.backgroundColor },
            headerTitleStyle: { color: HEADER.titleColor, fontWeight: '700' },
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="transaction/new"
          options={{
            title: 'Nouvelle transaction', presentation: 'modal',
            headerStyle: { backgroundColor: HEADER.backgroundColor },
            headerTitleStyle: { color: HEADER.titleColor, fontWeight: '700' },
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="recurring/index"
          options={{
            title: 'Récurrences',
            headerStyle: { backgroundColor: HEADER.backgroundColor },
            headerTitleStyle: { color: HEADER.titleColor, fontWeight: '700' },
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="recurring/[id]"
          options={{
            title: 'Modifier la récurrence', presentation: 'modal',
            headerStyle: { backgroundColor: HEADER.backgroundColor },
            headerTitleStyle: { color: HEADER.titleColor, fontWeight: '700' },
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="recurring/new"
          options={{
            title: 'Nouvelle récurrence', presentation: 'modal',
            headerStyle: { backgroundColor: HEADER.backgroundColor },
            headerTitleStyle: { color: HEADER.titleColor, fontWeight: '700' },
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </PaperProvider>
  );
}
