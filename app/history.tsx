import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { Receipt } from '../src/models/receipt';

const mockHistory: Receipt[] = [
  {
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
    ],
  },
  {
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
        id: 'item-2',
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
    ],
  },
];

export default function HistoryScreen() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Historikk</Text>
      <Text style={styles.description}>
        Midlertidig mockliste. SQLite kobles på i neste etappe.
      </Text>

      {mockHistory.map((receipt) => (
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