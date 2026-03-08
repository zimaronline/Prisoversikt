import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { parseReceiptMock } from '../src/services/receiptParserService';

export default function ScanScreen() {
  const router = useRouter();
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [draftJson, setDraftJson] = useState<string | null>(null);
  const [isPreparingDraft, setIsPreparingDraft] = useState(false);

  const handleImageResult = async (result: ImagePicker.ImagePickerResult) => {
    if (result.canceled) {
      return;
    }

    const asset = result.assets?.[0];
    if (!asset?.uri) {
      Alert.alert('Feil', 'Fant ikke bilde-URI.');
      return;
    }

    try {
      setIsPreparingDraft(true);

      const draft = await parseReceiptMock(asset.uri);

      setPreviewUri(asset.uri);
      setDraftJson(JSON.stringify(draft));
    } catch {
      Alert.alert('Feil', 'Kunne ikke forberede kvitteringen.');
    } finally {
      setIsPreparingDraft(false);
    }
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

    await handleImageResult(result);
  };

  const pickFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Tilgang nektet', 'Appen trenger tilgang til bildegalleriet.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    await handleImageResult(result);
  };

  const resetImage = () => {
    setPreviewUri(null);
    setDraftJson(null);
  };

  const continueToReview = () => {
    if (!draftJson) {
      Alert.alert('Mangler bilde', 'Velg eller ta et bilde først.');
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
      <Text style={styles.title}>Skann kvittering</Text>
      <Text style={styles.description}>
        Velg bilde fra kamera eller galleri.
      </Text>

      <Text style={styles.notice}>
        Denne versjonen tolker ikke varelinjer automatisk ennå. Du går videre til
        manuell kontroll på neste skjerm.
      </Text>

      <Pressable
        style={[styles.primaryButton, isPreparingDraft && styles.disabledButton]}
        onPress={takePhoto}
        disabled={isPreparingDraft}
      >
        <Text style={styles.primaryButtonText}>
          {isPreparingDraft ? 'Klargjør...' : 'Åpne kamera'}
        </Text>
      </Pressable>

      <Pressable
        style={[styles.secondaryButton, isPreparingDraft && styles.disabledButton]}
        onPress={pickFromLibrary}
        disabled={isPreparingDraft}
      >
        <Text style={styles.secondaryButtonText}>Velg fra galleri</Text>
      </Pressable>

      {previewUri ? (
        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>Forhåndsvisning</Text>

          <Image source={{ uri: previewUri }} style={styles.previewImage} />

          <Text style={styles.previewNote}>
            Bildet er valgt. Neste steg er manuell kontroll og utfylling.
          </Text>

          <Pressable style={styles.primaryButton} onPress={continueToReview}>
            <Text style={styles.primaryButtonText}>Fortsett til kontroll</Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={resetImage}>
            <Text style={styles.secondaryButtonText}>Velg nytt bilde</Text>
          </Pressable>
        </View>
      ) : null}
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
    marginBottom: 12,
  },
  notice: {
    fontSize: 14,
    lineHeight: 22,
    color: '#92400e',
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 12,
    padding: 12,
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
    backgroundColor: '#ffffff',
  },
  secondaryButtonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.6,
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
  previewNote: {
    fontSize: 14,
    lineHeight: 22,
    color: '#4b5563',
    marginBottom: 16,
  },
});