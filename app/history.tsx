import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Receipt } from '../src/models/receipt';

const mockHistory: Receipt[] = [
  {
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
    ],
  },
  {
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
        id: 'item-2',
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
    ],
  },
];

export default function HistoryScreen() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Historikk</Text>
      <Text style={styles.description}>
        Midlertidig mockliste. SQLite kobles på i neste steg.
      </Text>

      {mockHistory.map((receipt) => (
        <Pressable
          key={receipt.id}
          style={styles.card}
          onPress={() => router.push(`/receipt/${receipt.id}`)}
        >
          <Text style={styles.store}>{receipt.storeName}</Text>
          <Text style={styles.meta}>{receipt.purchaseDate}</Text>
          <Text style={styles.total}>
            {receipt.totalAmount.toFixed(2)} {receipt.currency}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4b5563',
    marginBottom: 24,
  },
  card: {
    padding: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    backgroundColor: '#f9fafb',
    marginBottom: 12,
  },
  store: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  meta: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  total: {
    fontSize: 16,
    fontWeight: '600',
  },
});