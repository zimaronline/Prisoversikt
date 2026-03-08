import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { Receipt } from '../src/models/receipt';
import { listStoredReceipts } from '../src/services/receiptStorageService';

export default function HistoryScreen() {
  const router = useRouter();

  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadReceipts = useCallback(async () => {
    try {
      setErrorMessage(null);
      setIsLoading(true);

      const rows = await listStoredReceipts();
      setReceipts(rows);
    } catch (error) {
      console.error('Failed to load receipts', error);
      setErrorMessage('Kunne ikke hente historikk.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReceipts();
  }, [loadReceipts]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Historikk</Text>
      <Text style={styles.description}>
        Lagrede kvitteringer vises her.
      </Text>

      <Pressable style={styles.refreshButton} onPress={loadReceipts}>
        <Text style={styles.refreshButtonText}>Oppdater</Text>
      </Pressable>

      {isLoading ? (
        <View style={styles.centerBlock}>
          <ActivityIndicator size="large" />
          <Text style={styles.helperText}>Laster historikk...</Text>
        </View>
      ) : null}

      {!isLoading && errorMessage ? (
        <View style={styles.messageCard}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      {!isLoading && !errorMessage && receipts.length === 0 ? (
        <View style={styles.messageCard}>
          <Text style={styles.emptyTitle}>Ingen lagrede kvitteringer</Text>
          <Text style={styles.helperText}>
            Lagre en kvittering fra review-skjermen først.
          </Text>
        </View>
      ) : null}

      {!isLoading &&
        !errorMessage &&
        receipts.map((receipt) => (
          <Pressable
            key={receipt.id}
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: '/receipt/[id]',
                params: { id: receipt.id },
              })
            }
          >
            <View style={styles.row}>
              <Text style={styles.store}>{receipt.merchantName}</Text>
              <Text style={styles.total}>
                {receipt.total.toFixed(2)} {receipt.currency}
              </Text>
            </View>

            <Text style={styles.meta}>{receipt.purchaseDate}</Text>
          </Pressable>
        ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#ffffff',
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    color: '#111827',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4b5563',
    marginBottom: 16,
  },
  refreshButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  refreshButtonText: {
    color: '#111827',
    fontWeight: '600',
  },
  centerBlock: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  messageCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    backgroundColor: '#f9fafb',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    color: '#111827',
  },
  helperText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#6b7280',
    marginTop: 8,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 15,
    fontWeight: '600',
  },
  card: {
    padding: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    backgroundColor: '#f9fafb',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  store: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  meta: {
    fontSize: 14,
    color: '#6b7280',
  },
  total: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
});