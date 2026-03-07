import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

import { ParsedReceiptResult } from '../src/models/parser';

export default function ReviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ draft?: string | string[] }>();

  const draftParam = Array.isArray(params.draft) ? params.draft[0] : params.draft;

  const [receipt, setReceipt] = React.useState<ParsedReceiptResult>(() =>
    parseDraft(draftParam)
  );

  const updateField = <K extends keyof ParsedReceiptResult>(
    key: K,
    value: ParsedReceiptResult[K]
  ) => {
    setReceipt((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const updateItemName = (index: number, value: string) => {
    setReceipt((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              normalizedName: value,
              rawText: value,
            }
          : item
      ),
    }));
  };

  const updateItemTotal = (index: number, value: string) => {
    const parsed = parseNumber(value);

    setReceipt((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              unitPrice: parsed,
              lineTotal: parsed,
            }
          : item
      ),
      totalAmount: current.items
        .map((item, itemIndex) =>
          itemIndex === index ? parsed : item.lineTotal
        )
        .reduce((sum, itemTotal) => sum + itemTotal, 0),
    }));
  };

  const saveReceipt = () => {
    Alert.alert(
      'Mock-lagring',
      'Denne første leveransen har ruter og modeller. SQLite-lagring kobles på i neste steg.'
    );

    router.push('/history');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Kontroller kvittering</Text>
      <Text style={styles.description}>
        Rediger feltene før lagring. Dataene under er mockdata fra første kodefase.
      </Text>

      {receipt.imageUri ? (
        <Image source={{ uri: receipt.imageUri }} style={styles.previewImage} />
      ) : null}

      <View style={styles.section}>
        <Text style={styles.label}>Butikk</Text>
        <TextInput
          value={receipt.storeName}
          onChangeText={(value) => updateField('storeName', value)}
          style={styles.input}
        />

        <Text style={styles.label}>Dato</Text>
        <TextInput
          value={receipt.purchaseDate}
          onChangeText={(value) => updateField('purchaseDate', value)}
          style={styles.input}
        />

        <Text style={styles.label}>Totalbeløp</Text>
        <TextInput
          value={receipt.totalAmount.toFixed(2)}
          onChangeText={(value) => updateField('totalAmount', parseNumber(value))}
          style={styles.input}
          keyboardType="decimal-pad"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Varelinjer</Text>

        {receipt.items.map((item, index) => (
          <View key={item.id} style={styles.itemCard}>
            <Text style={styles.label}>Navn</Text>
            <TextInput
              value={item.normalizedName}
              onChangeText={(value) => updateItemName(index, value)}
              style={styles.input}
            />

            <Text style={styles.label}>Linjetotal</Text>
            <TextInput
              value={item.lineTotal.toFixed(2)}
              onChangeText={(value) => updateItemTotal(index, value)}
              style={styles.input}
              keyboardType="decimal-pad"
            />
          </View>
        ))}
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
    storeName: 'Ukjent butikk',
    purchaseDate: new Date().toISOString().slice(0, 10),
    subtotalAmount: null,
    taxAmount: null,
    totalAmount: 0,
    currency: 'NOK',
    imageUri: '',
    rawText: '',
    items: [],
  };
}

function parseNumber(value: string): number {
  const normalized = value.replace(',', '.');
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
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
  previewImage: {
    width: '100%',
    height: 280,
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
});