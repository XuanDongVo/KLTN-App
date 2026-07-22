import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { ActionButton } from '@/components/ui/ActionButton';
import { Theme } from '@/constants/Theme';
import { BackendActivity } from '@/types/backendCurriculum';

type Props = {
  activity: BackendActivity;
  content: any;
  image?: any;
  imageAlt?: string;
  imageRatio?: number;
  disabled?: boolean;
  onSubmit: (answer: unknown) => void;
};

export function FlashCardActivity({
  activity,
  content,
  image,
  imageAlt,
  imageRatio,
  disabled,
  onSubmit,
}: Props) {
  const [flipped, setFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setFlipped(false);
    flipAnim.setValue(0);
  }, [activity.id]);

  const flipCard = () => {
    Animated.timing(flipAnim, {
      toValue: flipped ? 0 : 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
    setFlipped(!flipped);
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const speechText = (typeof content.speechText === 'string' ? content.speechText : '') || (typeof content.term === 'string' ? content.term : '') || activity.prompt;
  const term = (typeof content.term === 'string' ? content.term : '') || activity.prompt;
  const meaning = typeof content.meaning === 'string' ? content.meaning : '';

  return (
    <View style={styles.container}>
      <Pressable onPress={flipCard} style={styles.cardContainer}>
        {/* Mặt trước: Chỉ hiển thị từ vựng */}
        <Animated.View style={[styles.card, styles.cardFront, { transform: [{ rotateY: frontInterpolate }] }]}>
          <Text style={styles.cardTitle}>{term}</Text>
          <Text style={styles.tapHint}>Chạm để lật thẻ</Text>
        </Animated.View>

        {/* Mặt sau: Hiển thị hình ảnh và giải thích */}
        <Animated.View style={[styles.card, styles.cardBack, { transform: [{ rotateY: backInterpolate }] }]}>
          {image ? (
            <Image
              accessibilityLabel={imageAlt}
              source={image}
              style={[styles.heroImage, { aspectRatio: imageRatio }]}
              resizeMode="contain"
            />
          ) : null}
          <Text style={styles.cardTitle}>{term}</Text>
          {meaning ? <Text style={styles.meaning}>{meaning}</Text> : null}
        </Animated.View>
      </Pressable>

      <View style={styles.actions}>
        {flipped ? (
          <>
            <Pressable
              accessibilityRole="button"
              onPress={() => Speech.speak(speechText, { language: 'en-US', rate: 0.72 })}
              style={styles.listenButton}
            >
              <MaterialCommunityIcons name="volume-high" size={22} color={Theme.colors.blueDark} />
              <Text style={styles.listenText}>Nghe phát âm</Text>
            </Pressable>
            <ActionButton
              label="Tiếp tục"
              icon="arrow-right"
              disabled={disabled}
              onPress={() => onSubmit({ completed: true })}
            />
          </>
        ) : (
          <Text style={styles.helper}>Hãy lật thẻ để xem nghĩa và tiếp tục.</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  cardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 360,
  },
  card: {
    width: '100%',
    minHeight: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderBottomWidth: 6,
    borderColor: Theme.colors.border,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    backfaceVisibility: 'hidden',
  },
  cardFront: {
    backgroundColor: '#F8FBFF',
    borderColor: '#B9E3F8',
  },
  cardBack: {
    backgroundColor: '#FFFFFF',
  },
  cardTitle: {
    color: Theme.colors.ink,
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
    marginVertical: 12,
  },
  tapHint: {
    color: Theme.colors.blueDark,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 20,
    opacity: 0.6,
  },
  heroImage: {
    width: '100%',
    maxHeight: 200,
    borderRadius: 8,
    backgroundColor: '#E8EEF2',
  },
  meaning: {
    color: Theme.colors.violet,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  actions: {
    gap: 14,
    minHeight: 120, // Keep space for the buttons so it doesn't jump
  },
  listenButton: {
    minHeight: 52,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    borderRadius: 26,
    backgroundColor: '#EAF7FE',
    borderWidth: 1,
    borderColor: '#B9E3F8',
  },
  listenText: {
    color: Theme.colors.blueDark,
    fontWeight: '900',
    fontSize: 16,
  },
  helper: {
    color: Theme.colors.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 20,
  },
});
