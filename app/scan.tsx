import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { parseReceiptFromImage } from '../src/services/receiptParserService';

const MOCK_ENABLED = process.env.EXPO_PUBLIC_ENABLE_MOCK_PARSER !== 'false';

export default function ScanScreen() {
  const router = useRouter();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pickFromLibrary = async () => {
    try {
      setErrorMessage(null);

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Tilgang mangler',
          'Du må gi tilgang til bilder for å velge kvittering fra galleri.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 1,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      setImageUri(result.assets[0].uri);
    } catch (error) {
      console.error('Failed to pick image', error);
      setErrorMessage('Kunne ikke åpne bildegalleriet.');
    }
  };

  const takePhoto = async () => {
    try {
      setErrorMessage(null);

      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Tilgang mangler',
          'Du må gi kameratilgang for å ta bilde av kvitteringen.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 1,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      setImageUri(result.assets[0].uri);
    } catch (error) {
      console.error('Failed to take photo', error);
      setErrorMessage('Kunne ikke åpne kameraet.');
    }
  };

  const useSelectedImage = async () => {
    if (!imageUri) {
      Alert.alert('Manglende bilde', 'Velg eller ta et bilde først.');
      return;
    }

    try {
      setIsParsing(true);
      setErrorMessage(null);

      const parsed = await parseReceiptFromImage(imageUri);

      router.push({
        pathname: '/review',
        params: {
          draft: JSON.stringify(parsed),
        },
      });
    } catch (error) {
      console.error('Failed to parse receipt', error);

      const message =
        error instanceof Error
          ? error.message
          : 'Kunne ikke tolke kvitteringsbildet.';

      setErrorMessage(message);
      Alert.alert('Tolking feilet', message);
    } finally {
      setIsParsing(false);
    }
  };

  const resetImage = () => {
    setImageUri(null);
    setErrorMessage(null);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Skann kvittering</Text>
      <Text style={styles.description}>
        Ta bilde eller velg bilde fra galleri. Når bildet er klart, tolkes det og
        åpnes i kontrollskjermen.
      </Text>

      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Parsermodus</Text>
        <Text style={styles.statusText}>
          {MOCK_ENABLED ? 'Mock-parser er aktiv' : 'Ekte OCR-endepunkt er aktivt'}
        </Text>
      </View>

      <Pressable style={styles.primaryButton} onPress={takePhoto}>
        <Text style={styles.primaryButtonText}>Åpne kamera</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={pickFromLibrary}>
        <Text style={styles.secondaryButtonText}>Velg fra galleri</Text>
      </Pressable>

      {imageUri ? (
        <View style={styles.previewSection}>
          <Text style={styles.sectionTitle}>Forhåndsvisning</Text>
          <Image source={{ uri: imageUri }} style={styles.previewImage} />

          <Pressable
            style={[styles.primaryButton, isParsing && styles.disabledButton]}
            onPress={useSelectedImage}
            disabled={isParsing}
          >
            <Text style={styles.primaryButtonText}>
              {isParsing ? 'Tolker kvittering...' : 'Bruk dette bildet'}
            </Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={resetImage}>
            <Text style={styles.secondaryButtonText}>Velg nytt bilde</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>Ingen kvittering valgt</Text>
          <Text style={styles.emptyStateText}>
            Når du har valgt et bilde, vises det her før tolkingen starter.
          </Text>
        </View>
      )}

      {isParsing ? (
        <View style={styles.centerBlock}>
          <ActivityIndicator size="large" />
          <Text style={styles.helperText}>Tolker kvittering...</Text>
        </View>
      ) : null}

      {errorMessage ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
    marginBottom: 20,
  },
  statusCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 16,
    backgroundColor: '#eff6ff',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e3a8a',
    marginBottom: 6,
  },
  statusText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#1d4ed8',
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
    backgroundColor: '#ffffff',
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
  previewSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    color: '#111827',
  },
  previewImage: {
    width: '100%',
    height: 360,
    borderRadius: 12,
    resizeMode: 'contain',
    backgroundColor: '#e5e7eb',
    marginBottom: 16,
  },
  emptyState: {
    marginTop: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    backgroundColor: '#f9fafb',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  emptyStateText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#6b7280',
  },
  centerBlock: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  helperText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#6b7280',
    marginTop: 8,
  },
  errorCard: {
    marginTop: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 16,
    backgroundColor: '#fef2f2',
  },
  errorText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#991b1b',
  },
  disabledButton: {
    opacity: 0.6,
  },
});