import { useState } from 'react';
import {
    Image,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import {
    Gesture,
    GestureDetector,
    GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

type ZoomableReceiptImageProps = {
  uri: string;
};

export default function ZoomableReceiptImage({
  uri,
}: ZoomableReceiptImageProps) {
  const [isOpen, setIsOpen] = useState(false);

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      const nextScale = savedScale.value * event.scale;
      scale.value = Math.max(1, Math.min(nextScale, 5));
    })
    .onEnd(() => {
      savedScale.value = scale.value;

      if (scale.value <= 1) {
        scale.value = withTiming(1);
        savedScale.value = 1;
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      }
    });

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (scale.value <= 1) {
        return;
      }

      translateX.value = savedTranslateX.value + event.translationX;
      translateY.value = savedTranslateY.value + event.translationY;
    })
    .onEnd(() => {
      if (scale.value <= 1) {
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
        return;
      }

      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const gesture = Gesture.Simultaneous(pinchGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  const openViewer = () => {
    setIsOpen(true);
  };

  const closeViewer = () => {
    setIsOpen(false);
    scale.value = 1;
    savedScale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  };

  return (
    <>
      <Pressable
        onPress={openViewer}
        accessibilityRole="button"
        accessibilityLabel="Åpne kvitteringsbilde i fullskjerm"
      >
        <Image source={{ uri }} style={styles.previewImage} />
      </Pressable>

      <Modal
        visible={isOpen}
        animationType="fade"
        presentationStyle="fullScreen"
        onRequestClose={closeViewer}
      >
        <GestureHandlerRootView style={styles.modalContainer}>
          <View style={styles.topBar}>
            <Pressable
              onPress={closeViewer}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Lukk kvitteringsbilde"
            >
              <Text style={styles.closeButtonText}>Lukk</Text>
            </Pressable>

            <Text style={styles.helperText}>Knip for å zoome · Dra for å flytte</Text>
          </View>

          <GestureDetector gesture={gesture}>
            <Animated.View style={[styles.viewer, animatedStyle]}>
              <Image
                source={{ uri }}
                style={styles.fullscreenImage}
                resizeMode="contain"
              />
            </Animated.View>
          </GestureDetector>
        </GestureHandlerRootView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  previewImage: {
    width: '100%',
    height: 260,
    borderRadius: 12,
    resizeMode: 'contain',
    backgroundColor: '#e5e7eb',
    marginTop: 18,
    marginBottom: 24,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topBar: {
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  closeButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#111827',
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  helperText: {
    color: '#e5e7eb',
    fontSize: 14,
    flexShrink: 1,
    textAlign: 'right',
  },
  viewer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenImage: {
    width: '100%',
    height: '80%',
  },
});