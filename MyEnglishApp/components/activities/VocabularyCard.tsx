import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { Theme } from '@/constants/Theme';
import { styles } from './VocabularyCard.styles';

type VocabularyItem = {
  word: string;
  meaning: string;
  example?: string;
};

type Props = {
  item: VocabularyItem;
  onFlipped?: (flipped: boolean) => void;
};

export function VocabularyCard({ item, onFlipped }: Props) {
  const [flipped, setFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  // Reset animation when word changes
  useEffect(() => {
    setFlipped(false);
    flipAnim.setValue(0);
    if (onFlipped) onFlipped(false);
  }, [item.word, flipAnim, onFlipped]);

  const flipCard = () => {
    Animated.timing(flipAnim, {
      toValue: flipped ? 0 : 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
    setFlipped(!flipped);
    if (onFlipped) onFlipped(!flipped);
    
    // Automatically play sound when revealing meaning
    if (!flipped) {
      Speech.speak(item.word, { language: 'en-US', rate: 0.72 });
    }
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Pressable onPress={flipCard} style={styles.cardContainer}>
        {/* Mặt trước: Chỉ hiện tiếng Anh */}
        <Animated.View style={[styles.card, styles.cardFront, { transform: [{ rotateY: frontInterpolate }] }]}>
          <Text style={styles.vocabularyWord}>{item.word}</Text>
          <Text style={styles.tapHint}>Chạm để xem nghĩa</Text>
        </Animated.View>

        {/* Mặt sau: Hiện tiếng Việt, ví dụ và nút phát âm */}
        <Animated.View style={[styles.card, styles.cardBack, { transform: [{ rotateY: backInterpolate }] }]}>
          <Pressable 
            style={styles.wordSpeaker} 
            onPress={(e) => {
              e.stopPropagation();
              Speech.speak(item.word, { language: 'en-US', rate: 0.72 });
            }}
          >
            <MaterialCommunityIcons name="volume-high" size={28} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.vocabularyWord}>{item.word}</Text>
          <View style={styles.meaningDivider} />
          <Text style={styles.vocabularyMeaning}>{item.meaning}</Text>
          {item.example ? <Text style={styles.vocabularyExample}>{item.example}</Text> : null}
        </Animated.View>
      </Pressable>
    </View>
  );
}
