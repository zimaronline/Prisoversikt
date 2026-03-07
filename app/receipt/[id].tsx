import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Receipt } from '../../src/models/receipt';

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
      <Text style={styles.title}>{receipt.storeName}</Text>
      <Text style={styles.meta}>Dato: {receipt.purchaseDate}</Text>
      <Text style={styles.meta}>
        Total: {receipt.totalAmount.toFixed(2)} {receipt.currency}
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
      storeName: 'REMA 1000',
      purchaseDate: '2026-03-06',
      subtotalAmount: 152.5,
      taxAmount: 30.5,
      totalAmount: 152.5,
      currency: 'NOK',
      imageUri: '',
      rawText: '',
      createdAt: '2026-03-06T18:00:00.000Z',
      items: [
        {
          id: 'item-1',
          receiptId: 'receipt-1',
          rawText: 'MELK 1L 24.90',
          normalizedName: 'Melk 1L',
          quantity: 1,
          unit: 'stk',
          unitPrice: 24.9,
          lineTotal: 24.9,
          discount: 0,
          confidence: 0.97,
        },
        {
          id: 'item-2',
          receiptId: 'receipt-1',
          rawText: 'BRØD 34.90',
          normalizedName: 'Brød',
          quantity: 1,
          unit: 'stk',
          unitPrice: 34.9,
          lineTotal: 34.9,
          discount: 0,
          confidence: 0.95,
        },
      ],
    },
    'receipt-2': {
      id: 'receipt-2',
      storeName: 'Kiwi',
      purchaseDate: '2026-03-02',
      subtotalAmount: 89.4,
      taxAmount: 17.88,
      totalAmount: 89.4,
      currency: 'NOK',
      imageUri: '',
      rawText: '',
      createdAt: '2026-03-02T12:30:00.000Z',
      items: [
        {
          id: 'item-3',
          receiptId: 'receipt-2',
          rawText: 'BANANER 32.50',
          normalizedName: 'Bananer',
          quantity: 1,
          unit: 'kg',
          unitPrice: 32.5,
          lineTotal: 32.5,
          discount: 0,
          confidence: 0.94,
        },
        {
          id: 'item-4',
          receiptId: 'receipt-2',
          rawText: 'KAFFE 56.90',
          normalizedName: 'Kaffe',
          quantity: 1,
          unit: 'stk',
          unitPrice: 56.9,
          lineTotal: 56.9,
          discount: 0,
          confidence: 0.92,
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
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
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
  },
  itemAmount: {
    fontSize: 15,
    color: '#374151',
  },
});