import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ParsedReceiptResult } from '../src/models/parser';

export default function ScanScreen() {
  const router = useRouter();
  const [previewUri, setPreviewUri] = React.useState<string | null>(null);
  const [draftJson, setDraftJson] = React.useState<string | null>(null);

  const handleResult = (result: ImagePicker.ImagePickerResult) => {
    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];
    if (!asset?.uri) {
      Alert.alert('Feil', 'Fant ikke bilde-URI.');
      return;
    }

    const draft = createMockReceipt(asset.uri);
    setPreviewUri(asset.uri);
    setDraftJson(JSON.stringify(draft));
  };

  const pickFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Tilgang nektet', 'Appen trenger tilgang til bildebiblioteket.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    handleResult(result);
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Tilgang nektet', 'Appen trenger kameratilgang.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    handleResult(result);
  };

  const continueToReview = () => {
    if (!draftJson) {
      Alert.alert('Manglende data', 'Velg eller ta et bilde først.');
      return;
    }

    router.push({
      pathname: '/review',
      params: {
        draft: draftJson,
      },
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Legg til kvitteringsbilde</Text>
      <Text style={styles.description}>
        I første versjon bruker vi bilde fra kamera eller galleri og lager mockdata til kontrollskjermen.
      </Text>

      <Pressable style={styles.primaryButton} onPress={takePhoto}>
        <Text style={styles.primaryButtonText}>Ta bilde</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={pickFromLibrary}>
        <Text style={styles.secondaryButtonText}>Velg fra galleri</Text>
      </Pressable>

      {previewUri ? (
        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>Forhåndsvisning</Text>
          <Image source={{ uri: previewUri }} style={styles.previewImage} />
          <Pressable style={styles.primaryButton} onPress={continueToReview}>
            <Text style={styles.primaryButtonText}>Bruk dette bildet</Text>
          </Pressable>
        </View>
      ) : null}
    </ScrollView>
  );
}

function createMockReceipt(imageUri: string): ParsedReceiptResult {
  return {
    storeName: 'REMA 1000',
    purchaseDate: new Date().toISOString().slice(0, 10),
    subtotalAmount: 152.5,
    taxAmount: 30.5,
    totalAmount: 152.5,
    currency: 'NOK',
    imageUri,
    rawText: 'REMA 1000\nMELK 1L 24.90\nBRØD 34.90\nOST 92.70\nTOTAL 152.50',
    items: [
      {
        id: 'item-1',
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
        rawText: 'BRØD 34.90',
        normalizedName: 'Brød',
        quantity: 1,
        unit: 'stk',
        unitPrice: 34.9,
        lineTotal: 34.9,
        discount: 0,
        confidence: 0.95,
      },
      {
        id: 'item-3',
        rawText: 'OST 92.70',
        normalizedName: 'Ost',
        quantity: 1,
        unit: 'stk',
        unitPrice: 92.7,
        lineTotal: 92.7,
        discount: 0,
        confidence: 0.93,
      },
    ],
  };
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
  primaryButton: {
    backgroundColor: '#111827',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
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
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  previewCard: {
    marginTop: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    backgroundColor: '#f9fafb',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  previewImage: {
    width: '100%',
    height: 360,
    borderRadius: 12,
    resizeMode: 'contain',
    backgroundColor: '#e5e7eb',
    marginBottom: 16,
  },
});