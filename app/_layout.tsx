import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};
export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Receipt Scanner' }} />
      <Stack.Screen name="scan" options={{ title: 'Skann kvittering' }} />
      <Stack.Screen name="review" options={{ title: 'Kontroller kvittering' }} />
      <Stack.Screen name="history" options={{ title: 'Historikk' }} />
      <Stack.Screen name="receipt/[id]" options={{ title: 'Kvitteringsdetaljer' }} />
    </Stack>
  );
}