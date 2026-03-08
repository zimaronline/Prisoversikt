import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { runMigrations } from '../src/database/migrations';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const prepareApp = async () => {
      try {
        await runMigrations();

        if (isMounted) {
          setIsReady(true);
        }
      } catch (error) {
        console.error('Failed to run migrations', error);

        if (isMounted) {
          setErrorMessage('Kunne ikke starte lokal database.');
        }
      }
    };

    void prepareApp();

    return () => {
      isMounted = false;
    };
  }, []);

  if (errorMessage) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Oppstart feilet</Text>
        <Text style={styles.errorText}>{errorMessage}</Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Starter appen...</Text>
      </View>
    );
  }

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

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#4b5563',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#b91c1c',
    textAlign: 'center',
  },
});