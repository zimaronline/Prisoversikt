import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import ZoomableReceiptImage from '../../src/components/ZoomableReceiptImage';
import type { Receipt } from '../../src/models/receipt';
import { getStoredReceipt } from '../../src/services/receiptStorageService';

export default function ReceiptDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadReceipt = async () => {
      if (!id) {
        setErrorMessage('Manglende kvitterings-ID.');
        setIsLoading(false);
        return;
      }

      try {
        setErrorMessage(null);
        setIsLoading(true);

        const row = await getStoredReceipt(id);
        setReceipt(row);

        if (!row) {
          setErrorMessage('Fant ikke kvittering.');
        }
      } catch (error) {
        console.error('Failed to load receipt', error);
        setErrorMessage('Kunne ikke hente kvitteringen.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadReceipt();
  }, [id]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.helperText}>Laster kvittering...</Text>
      </View>
    );
  }

  if (errorMessage || !receipt) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyTitle}>Fant ikke kvittering</Text>
        <Text style={styles.helperText}>{errorMessage ?? 'Ukjent feil.'}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{receipt.merchantName}</Text>
      {receipt.merchantAddress ? (
        <Text style={styles.meta}>Adresse: {receipt.merchantAddress}</Text>
      ) : null}

      <Text style={styles.meta}>Dato: {receipt.purchaseDate}</Text>
      <Text style={styles.meta}>
        Total: {receipt.total.toFixed(2)} {receipt.currency}
      </Text>

      {receipt.imageUri ? (
        <ZoomableReceiptImage uri={receipt.imageUri} />
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Varelinjer</Text>

        {receipt.items.length === 0 ? (
          <Text style={styles.helperText}>Ingen varelinjer lagret.</Text>
        ) : null}

        {receipt.items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <Text style={styles.itemName}>{item.normalizedName}</Text>

            {buildItemMeta(item) ? (
              <Text style={styles.itemMeta}>{buildItemMeta(item)}</Text>
            ) : null}

            <Text style={styles.itemAmount}>
              {item.lineTotal.toFixed(2)} {receipt.currency}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function buildItemMeta(item: Receipt['items'][number]): string {
  const parts: string[] = [];

  if (item.quantity && item.unit) {
    parts.push(`${formatNumber(item.quantity)} ${item.unit}`);
  } else if (item.quantity) {
    parts.push(`Antall: ${formatNumber(item.quantity)}`);
  } else if (item.unit) {
    parts.push(`Enhet: ${item.unit}`);
  }

  if (item.sizeValue && item.sizeUnit) {
    parts.push(`á ${formatNumber(item.sizeValue)} ${item.sizeUnit}`);
  } else if (item.sizeValue) {
    parts.push(`Størrelse: ${formatNumber(item.sizeValue)}`);
  } else if (item.sizeUnit) {
    parts.push(`Størrelsesenhet: ${item.sizeUnit}`);
  }

  return parts.join(' · ');
}

function formatNumber(value: number): string {
  return String(value).replace('.', ',');
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#ffffff',
  },
  centered: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    color: '#111827',
  },
  meta: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 6,
  },
  previewImage: {
    width: '100%',
    height: 260,
    borderRadius: 12,
    resizeMode: 'contain',
    backgroundColor: '#e5e7eb',
    marginTop: 18,
    marginBottom: 24,
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    color: '#111827',
  },
  itemRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#111827',
  },
  itemMeta: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  itemAmount: {
    fontSize: 15,
    color: '#374151',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#6b7280',
    textAlign: 'center',
  },
});