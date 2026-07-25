import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { ActionButton } from '@/components/ui/ActionButton';
import { Theme } from '@/constants/Theme';
import { BackendActivity } from '@/types/backendCurriculum';
import { styles } from './FlashCardActivity.styles';

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
