import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import type { ParsedReceiptResult } from '../../../src/models/parser';
import type { Receipt } from '../../../src/models/receipt';
import type { ReceiptItem } from '../../../src/models/receiptItem';
import {
    getStoredReceipt,
    updateStoredReceipt,
} from '../../../src/services/receiptStorageService';

type ItemDraft = {
  id: string;
  rawText?: string | null;
  normalizedName: string;
  quantityText: string;
  sizeValueText: string;
  sizeUnitText: string;
  lineTotalText: string;
  showSizeFields: boolean;
  discount?: number | null;
  confidence?: number | null;
};

export default function EditReceiptScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [merchantName, setMerchantName] = useState('');
  const [merchantAddress, setMerchantAddress] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [totalText, setTotalText] = useState('');
  const [items, setItems] = useState<ItemDraft[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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

        if (!row) {
          setErrorMessage('Fant ikke kvittering.');
          return;
        }

        setReceipt(row);
        setMerchantName(row.merchantName);
        setMerchantAddress(row.merchantAddress ?? '');
        setPurchaseDate(row.purchaseDate);
        setTotalText(formatNumber(row.total));
        setItems(row.items.map(mapItemToDraft));
      } catch (error) {
        console.error('Failed to load receipt for editing', error);
        setErrorMessage('Kunne ikke hente kvitteringen for redigering.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadReceipt();
  }, [id]);

  const addItem = () => {
    setItems((current) => [
      ...current,
      {
        id: `item-${Date.now()}`,
        rawText: null,
        normalizedName: '',
        quantityText: '',
        sizeValueText: '',
        sizeUnitText: '',
        lineTotalText: '',
        showSizeFields: false,
        discount: 0,
        confidence: null,
      },
    ]);
  };

  const removeItem = (itemId: string) => {
    setItems((current) => current.filter((item) => item.id !== itemId));
  };

  const updateItemField = (
    itemId: string,
    field: keyof ItemDraft,
    value: string | boolean
  ) => {
    setItems((current) =>
      current.map((item) =>
        item.id === itemId
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const toggleSizeFields = (itemId: string) => {
    setItems((current) =>
      current.map((item) =>
        item.id === itemId
          ? {
              ...item,
              showSizeFields: !item.showSizeFields,
            }
          : item
      )
    );
  };

  const saveReceipt = async () => {
    if (!receipt) {
      Alert.alert('Fant ikke kvittering', 'Kvitteringen kunne ikke lastes.');
      return;
    }

    const trimmedMerchantName = merchantName.trim();
    const trimmedPurchaseDate = purchaseDate.trim();

    if (!trimmedMerchantName) {
      Alert.alert('Mangler butikk', 'Fyll inn butikknavn før lagring.');
      return;
    }

    if (!trimmedPurchaseDate) {
      Alert.alert('Mangler dato', 'Fyll inn dato før lagring.');
      return;
    }

    const parsedTotal = parseOptionalNumber(totalText);
    if (parsedTotal === null) {
      Alert.alert('Ugyldig total', 'Fyll inn et gyldig totalbeløp.');
      return;
    }

    const hasInvalidItemName = items.some((item) => !item.normalizedName.trim());
    if (hasInvalidItemName) {
      Alert.alert(
        'Ufullstendig varelinje',
        'Alle varelinjer må ha navn før lagring.'
      );
      return;
    }

    const hasInvalidItemAmount = items.some(
      (item) => parseOptionalNumber(item.lineTotalText) === null
    );
    if (hasInvalidItemAmount) {
      Alert.alert(
        'Ugyldig varelinje',
        'Alle varelinjer må ha et gyldig beløp.'
      );
      return;
    }

    try {
      setIsSaving(true);

      const parsedItems: ReceiptItem[] = items.map((item) => {
        const quantity = parseOptionalNumber(item.quantityText);
        const sizeValue = parseOptionalNumber(item.sizeValueText);
        const lineTotal = parseOptionalNumber(item.lineTotalText) ?? 0;
        const trimmedSizeUnit = item.sizeUnitText.trim();
        const unitPrice =
          quantity && quantity > 0 ? Number((lineTotal / quantity).toFixed(2)) : null;

        return {
          id: item.id,
          rawText: item.rawText ?? null,
          normalizedName: item.normalizedName.trim(),
          quantity,
          unit: null,
          sizeValue,
          sizeUnit: trimmedSizeUnit || null,
          unitPrice,
          lineTotal,
          discount: item.discount ?? 0,
          confidence: item.confidence ?? null,
        };
      });

      const payload: ParsedReceiptResult = {
        merchantName: trimmedMerchantName,
        merchantAddress: merchantAddress.trim() || null,
        purchaseDate: trimmedPurchaseDate,
        subtotal: receipt.subtotal ?? null,
        total: parsedTotal,
        vatTotal: receipt.vatTotal ?? null,
        currency: receipt.currency,
        imageUri: receipt.imageUri,
        rawOcrResponse: receipt.rawOcrResponse ?? null,
        parseConfidence: receipt.parseConfidence ?? null,
        items: parsedItems,
      };

      await updateStoredReceipt(receipt.id, payload);

      router.replace({
        pathname: '/receipt/[id]',
        params: { id: receipt.id },
      });
    } catch (error) {
      console.error('Failed to update receipt', error);
      Alert.alert('Lagring feilet', 'Kunne ikke oppdatere kvitteringen.');
    } finally {
      setIsSaving(false);
    }
  };

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
      <Text style={styles.title}>Rediger kvittering</Text>
      <Text style={styles.description}>
        Oppdater butikk, adresse, dato, total og varelinjer.
      </Text>

      {receipt.imageUri ? (
        <Image source={{ uri: receipt.imageUri }} style={styles.previewImage} />
      ) : null}

      <View style={styles.section}>
        <Text style={styles.label}>Butikk</Text>
        <TextInput
          value={merchantName}
          onChangeText={setMerchantName}
          style={styles.input}
          placeholder="Butikknavn"
        />

        <Text style={styles.label}>Adresse</Text>
        <TextInput
          value={merchantAddress}
          onChangeText={setMerchantAddress}
          style={styles.input}
          placeholder="Valgfritt"
        />

        <Text style={styles.label}>Dato</Text>
        <TextInput
          value={purchaseDate}
          onChangeText={setPurchaseDate}
          style={styles.input}
          placeholder="YYYY-MM-DD"
        />

        <Text style={styles.label}>Total</Text>
        <TextInput
          value={totalText}
          onChangeText={(value) => setTotalText(sanitizeNumericInput(value))}
          style={styles.input}
          keyboardType="decimal-pad"
          placeholder="0,00"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Varelinjer</Text>

        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>Ingen varelinjer lagt til</Text>
            <Text style={styles.emptyStateText}>
              Legg til varelinjer manuelt.
            </Text>
          </View>
        ) : null}

        {items.map((item) => (
          <View key={item.id} style={styles.itemCard}>
            <Text style={styles.label}>Navn</Text>
            <TextInput
              value={item.normalizedName}
              onChangeText={(value) => updateItemField(item.id, 'normalizedName', value)}
              style={styles.input}
              placeholder="Varenavn"
            />

            <Text style={styles.label}>Mengde</Text>
            <TextInput
              value={item.quantityText}
              onChangeText={(value) =>
                updateItemField(item.id, 'quantityText', sanitizeNumericInput(value))
              }
              style={styles.input}
              keyboardType="decimal-pad"
              placeholder="Valgfritt"
            />

            <Pressable
              style={styles.inlineButton}
              onPress={() => toggleSizeFields(item.id)}
            >
              <Text style={styles.inlineButtonText}>
                {item.showSizeFields
                  ? 'Skjul størrelse / måleenhet'
                  : '+ Legg til størrelse / måleenhet'}
              </Text>
            </Pressable>

            {item.showSizeFields ? (
              <View style={styles.advancedSection}>
                <View style={styles.row}>
                  <View style={styles.rowField}>
                    <Text style={styles.label}>Størrelse per enhet</Text>
                    <TextInput
                      value={item.sizeValueText}
                      onChangeText={(value) =>
                        updateItemField(
                          item.id,
                          'sizeValueText',
                          sanitizeNumericInput(value)
                        )
                      }
                      style={styles.input}
                      keyboardType="decimal-pad"
                      placeholder="Valgfritt"
                    />
                  </View>

                  <View style={styles.rowField}>
                    <Text style={styles.label}>Måleenhet</Text>
                    <TextInput
                      value={item.sizeUnitText}
                      onChangeText={(value) =>
                        updateItemField(item.id, 'sizeUnitText', value)
                      }
                      style={styles.input}
                      placeholder="f.eks. g, kg, ml"
                    />
                  </View>
                </View>
              </View>
            ) : null}

            <Text style={styles.label}>Linjetotal</Text>
            <TextInput
              value={item.lineTotalText}
              onChangeText={(value) =>
                updateItemField(item.id, 'lineTotalText', sanitizeNumericInput(value))
              }
              style={styles.input}
              keyboardType="decimal-pad"
              placeholder="0,00"
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

      <Pressable
        style={[styles.primaryButton, isSaving && styles.disabledButton]}
        onPress={saveReceipt}
        disabled={isSaving}
      >
        <Text style={styles.primaryButtonText}>
          {isSaving ? 'Lagrer...' : 'Lagre endringer'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function mapItemToDraft(item: ReceiptItem): ItemDraft {
  const sizeValueText = formatNumber(item.sizeValue);
  const sizeUnitText = item.sizeUnit ?? '';

  return {
    id: item.id,
    rawText: item.rawText ?? null,
    normalizedName: item.normalizedName ?? '',
    quantityText: formatNumber(item.quantity),
    sizeValueText,
    sizeUnitText,
    lineTotalText: formatNumber(item.lineTotal),
    showSizeFields: Boolean(sizeValueText || sizeUnitText),
    discount: item.discount ?? 0,
    confidence: item.confidence ?? null,
  };
}

function formatNumber(value?: number | null): string {
  if (value === null || value === undefined) {
    return '';
  }

  return Number.isFinite(value) ? String(value).replace('.', ',') : '';
}

function sanitizeNumericInput(value: string): string {
  return value.replace(/[^0-9,.\-]/g, '').replace('.', ',');
}

function parseOptionalNumber(value: string): number | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const normalized = trimmed.replace(',', '.');
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowField: {
    flex: 1,
  },
  advancedSection: {
    marginBottom: 2,
  },
  inlineButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    marginBottom: 10,
  },
  inlineButtonText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
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
  disabledButton: {
    opacity: 0.6,
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