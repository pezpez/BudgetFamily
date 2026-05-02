import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { PaperProvider } from 'react-native-paper';
import { useColorScheme } from 'react-native';

import { lightTheme, darkTheme } from '../constants/theme';
import { runMigrations } from '../db/migrations';
import { seedDefaultCategories } from '../db/seed';
import { generateRecurringTransactions } from '../utils/recurring';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    async function initDb() {
      await runMigrations();
      await seedDefaultCategories();
      await generateRecurringTransactions();
      setDbReady(true);
    }
    initDb();
  }, []);

  useEffect(() => {
    if (loaded && dbReady) {
      SplashScreen.hideAsync();
    }
  }, [loaded, dbReady]);

  if (!loaded || !dbReady) return null;

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <PaperProvider theme={theme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="transaction/[id]"
          options={{
            title: 'Modifier la transaction',
            presentation: 'modal',
            headerStyle: { backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF' },
            headerTitleStyle: { color: colorScheme === 'dark' ? '#FFFFFF' : '#1A1C2E', fontWeight: '700' },
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="transaction/new"
          options={{
            title: 'Nouvelle transaction',
            presentation: 'modal',
            headerStyle: { backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF' },
            headerTitleStyle: { color: colorScheme === 'dark' ? '#FFFFFF' : '#1A1C2E', fontWeight: '700' },
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="recurring/index"
          options={{
            title: 'Récurrences',
            headerStyle: { backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF' },
            headerTitleStyle: { color: colorScheme === 'dark' ? '#FFFFFF' : '#1A1C2E', fontWeight: '700' },
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="recurring/[id]"
          options={{
            title: 'Modifier la récurrence',
            presentation: 'modal',
            headerStyle: { backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF' },
            headerTitleStyle: { color: colorScheme === 'dark' ? '#FFFFFF' : '#1A1C2E', fontWeight: '700' },
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="recurring/new"
          options={{
            title: 'Nouvelle récurrence',
            presentation: 'modal',
            headerStyle: { backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF' },
            headerTitleStyle: { color: colorScheme === 'dark' ? '#FFFFFF' : '#1A1C2E', fontWeight: '700' },
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </PaperProvider>
  );
}
