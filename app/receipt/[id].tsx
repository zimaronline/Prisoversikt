import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import type { Receipt } from '../../src/models/receipt';

export default function ReceiptDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const receipt = getMockReceipt(id);

  if (!receipt) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Fant ikke kvittering</Text>
        <Text style={styles.emptyText}>ID: {id ?? 'ukjent'}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{receipt.merchantName}</Text>
      <Text style={styles.meta}>Dato: {receipt.purchaseDate}</Text>
      <Text style={styles.meta}>
        Total: {receipt.total.toFixed(2)} {receipt.currency}
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Varelinjer</Text>

        {receipt.items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <Text style={styles.itemName}>{item.normalizedName}</Text>
            <Text style={styles.itemAmount}>
              {item.lineTotal.toFixed(2)} {receipt.currency}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function getMockReceipt(id?: string): Receipt | null {
  const receipts: Record<string, Receipt> = {
    'receipt-1': {
      id: 'receipt-1',
      merchantName: 'KIWI',
      purchaseDate: '2026-03-06',
      subtotal: 134.8,
      total: 134.8,
      vatTotal: 26.96,
      currency: 'NOK',
      imageUri: '',
      rawOcrResponse: null,
      parseConfidence: 0.91,
      createdAt: '2026-03-06T18:00:00.000Z',
      updatedAt: '2026-03-06T18:00:00.000Z',
      items: [
        {
          id: 'item-1',
          receiptId: 'receipt-1',
          rawText: 'BANANER 32.50',
          normalizedName: 'Bananer',
          quantity: 1,
          unit: 'kg',
          unitPrice: 32.5,
          lineTotal: 32.5,
          discount: 0,
          confidence: 0.95,
        },
        {
          id: 'item-2',
          receiptId: 'receipt-1',
          rawText: 'MELK LETT 24.90',
          normalizedName: 'Melk lett',
          quantity: 1,
          unit: 'stk',
          unitPrice: 24.9,
          lineTotal: 24.9,
          discount: 0,
          confidence: 0.96,
        },
      ],
    },
    'receipt-2': {
      id: 'receipt-2',
      merchantName: 'REMA 1000',
      purchaseDate: '2026-03-02',
      subtotal: 152.5,
      total: 152.5,
      vatTotal: 30.5,
      currency: 'NOK',
      imageUri: '',
      rawOcrResponse: null,
      parseConfidence: 0.9,
      createdAt: '2026-03-02T12:30:00.000Z',
      updatedAt: '2026-03-02T12:30:00.000Z',
      items: [
        {
          id: 'item-3',
          receiptId: 'receipt-2',
          rawText: 'MELK 1L 24.90',
          normalizedName: 'Melk 1L',
          quantity: 1,
          unit: 'stk',
          unitPrice: 24.9,
          lineTotal: 24.9,
          discount: 0,
          confidence: 0.94,
        },
        {
          id: 'item-4',
          receiptId: 'receipt-2',
          rawText: 'BRØD 34.90',
          normalizedName: 'Brød',
          quantity: 1,
          unit: 'stk',
          unitPrice: 34.9,
          lineTotal: 34.9,
          discount: 0,
          confidence: 0.93,
        },
      ],
    },
  };

  if (!id) {
    return null;
  }

  return receipts[id] ?? null;
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#ffffff',
  },
  emptyContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    color: '#111827',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
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
  section: {
    marginTop: 24,
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
  itemAmount: {
    fontSize: 15,
    color: '#374151',
  },
});