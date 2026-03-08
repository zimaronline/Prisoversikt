import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { ParsedReceiptResult } from '../src/models/parser';
import type { ReceiptItem } from '../src/models/receiptItem';

export default function ReviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ draft?: string | string[] }>();

  const rawDraft = Array.isArray(params.draft) ? params.draft[0] : params.draft;

  const initialDraft = useMemo(() => parseDraft(rawDraft), [rawDraft]);
  const [receipt, setReceipt] = useState<ParsedReceiptResult>(initialDraft);

  const updateField = <K extends keyof ParsedReceiptResult>(
    key: K,
    value: ParsedReceiptResult[K]
  ) => {
    setReceipt((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const updateItemField = <K extends keyof ReceiptItem>(
    itemId: string,
    key: K,
    value: ReceiptItem[K]
  ) => {
    setReceipt((current) => {
      const nextItems = current.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              [key]: value,
            }
          : item
      );

      return {
        ...current,
        items: nextItems,
        total: calculateTotal(nextItems),
      };
    });
  };

  const updateItemLineTotal = (itemId: string, value: string) => {
    const parsed = parseNumber(value);

    setReceipt((current) => {
      const nextItems = current.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              lineTotal: parsed,
              unitPrice: parsed,
            }
          : item
      );

      return {
        ...current,
        items: nextItems,
        total: calculateTotal(nextItems),
      };
    });
  };

  const removeItem = (itemId: string) => {
    setReceipt((current) => {
      const nextItems = current.items.filter((item) => item.id !== itemId);

      return {
        ...current,
        items: nextItems,
        total: calculateTotal(nextItems),
      };
    });
  };

  const addItem = () => {
    const newItem: ReceiptItem = {
      id: `item-${Date.now()}`,
      rawText: null,
      normalizedName: '',
      quantity: 1,
      unit: 'stk',
      unitPrice: 0,
      lineTotal: 0,
      discount: 0,
      confidence: null,
    };

    setReceipt((current) => ({
      ...current,
      items: [...current.items, newItem],
    }));
  };

  const saveReceipt = () => {
    Alert.alert(
      'Neste steg',
      'SQLite-lagring kobles på i neste etappe. Nå verifiserer vi ærlig review-flyt uten falske varelinjer.'
    );

    router.push('/history');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Kontroller kvittering</Text>
      <Text style={styles.description}>
        Denne versjonen fyller ikke inn varer automatisk. Legg til eller rediger
        feltene manuelt før lagring.
      </Text>

      {receipt.imageUri ? (
        <Image source={{ uri: receipt.imageUri }} style={styles.previewImage} />
      ) : null}

      <View style={styles.section}>
        <Text style={styles.label}>Butikk</Text>
        <TextInput
          value={receipt.merchantName}
          onChangeText={(value) => updateField('merchantName', value)}
          style={styles.input}
          placeholder="Butikknavn"
        />

        <Text style={styles.label}>Dato</Text>
        <TextInput
          value={receipt.purchaseDate}
          onChangeText={(value) => updateField('purchaseDate', value)}
          style={styles.input}
          placeholder="YYYY-MM-DD"
        />

        <Text style={styles.label}>Total</Text>
        <TextInput
          value={receipt.total.toFixed(2)}
          onChangeText={(value) => updateField('total', parseNumber(value))}
          style={styles.input}
          keyboardType="decimal-pad"
          placeholder="0.00"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Varelinjer</Text>

        {receipt.items.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>Ingen varelinjer funnet</Text>
            <Text style={styles.emptyStateText}>
              Legg til varelinjer manuelt i denne fasen.
            </Text>
          </View>
        ) : null}

        {receipt.items.map((item) => (
          <View key={item.id} style={styles.itemCard}>
            <Text style={styles.label}>Navn</Text>
            <TextInput
              value={item.normalizedName}
              onChangeText={(value) =>
                updateItemField(item.id, 'normalizedName', value)
              }
              style={styles.input}
              placeholder="Varenavn"
            />

            <Text style={styles.label}>Linjetotal</Text>
            <TextInput
              value={item.lineTotal.toFixed(2)}
              onChangeText={(value) => updateItemLineTotal(item.id, value)}
              style={styles.input}
              keyboardType="decimal-pad"
              placeholder="0.00"
            />

            <Pressable
              style={styles.deleteButton}
              onPress={() => removeItem(item.id)}
            >
              <Text style={styles.deleteButtonText}>Slett varelinje</Text>
            </Pressable>
          </View>
        ))}

        <Pressable style={styles.secondaryButton} onPress={addItem}>
          <Text style={styles.secondaryButtonText}>+ Legg til varelinje</Text>
        </Pressable>
      </View>

      <Pressable style={styles.primaryButton} onPress={saveReceipt}>
        <Text style={styles.primaryButtonText}>Lagre kvittering</Text>
      </Pressable>
    </ScrollView>
  );
}

function parseDraft(value?: string): ParsedReceiptResult {
  if (!value) {
    return createFallbackDraft();
  }

  try {
    return JSON.parse(value) as ParsedReceiptResult;
  } catch {
    return createFallbackDraft();
  }
}

function createFallbackDraft(): ParsedReceiptResult {
  return {
    merchantName: '',
    purchaseDate: '',
    subtotal: null,
    total: 0,
    vatTotal: null,
    currency: 'NOK',
    imageUri: '',
    rawOcrResponse: null,
    parseConfidence: null,
    items: [],
  };
}

function parseNumber(value: string): number {
  const normalized = value.replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function calculateTotal(items: ReceiptItem[]): number {
  return items.reduce((sum, item) => sum + (item.lineTotal ?? 0), 0);
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
  previewImage: {
    width: '100%',
    height: 260,
    borderRadius: 12,
    resizeMode: 'contain',
    backgroundColor: '#e5e7eb',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    color: '#111827',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 14,
    backgroundColor: '#ffffff',
  },
  emptyState: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 16,
    backgroundColor: '#eff6ff',
    marginBottom: 12,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e3a8a',
    marginBottom: 6,
  },
  emptyStateText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#1d4ed8',
  },
  itemCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    backgroundColor: '#f9fafb',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#111827',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  secondaryButtonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  deleteButton: {
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#fee2e2',
  },
  deleteButtonText: {
    textAlign: 'center',
    color: '#991b1b',
    fontWeight: '600',
  },
});