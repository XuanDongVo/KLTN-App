import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Speech from 'expo-speech';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ActionButton } from '@/components/ui/ActionButton';
import { Theme } from '@/constants/Theme';
import { Activity } from '@/types/learning';

type Props = { activity: Activity; onAnswer: (correct: boolean, selected: string) => void };

export function ListenChoiceActivity({ activity, onAnswer }: Props) {
  const [selected, setSelected] = useState<string>();
  const speak = () => {
    Speech.stop();
    Speech.speak(activity.speechText ?? activity.prompt, { language: 'en-US', rate: 0.72, pitch: 1.03 });
  };

  useEffect(() => {
    const timer = setTimeout(speak, 350);
    return () => {
      clearTimeout(timer);
      Speech.stop();
    };
  }, [activity.id]);

  return <View style={styles.container}>
    <Pressable onPress={speak} style={styles.listenButton} accessibilityRole="button" accessibilityLabel="Nghe lại">
      <MaterialCommunityIcons name="volume-high" size={38} color="#FFFFFF" />
    </Pressable>
    <Text style={styles.helper}>Chạm loa để nghe lại, sau đó chọn đáp án đúng.</Text>
    <View style={styles.choices}>{activity.choices?.map((choice) => <Pressable key={choice.id} onPress={() => setSelected(choice.id)} style={[styles.choice, selected === choice.id && styles.choiceSelected]}>
      <Text style={styles.choiceText}>{choice.label}</Text>
      {selected === choice.id && <MaterialCommunityIcons name="check-circle" size={22} color={Theme.colors.greenDark} />}
    </Pressable>)}</View>
    <ActionButton label="Kiểm tra" disabled={!selected} onPress={() => selected && onAnswer(selected === String(activity.answer), selected)} />
  </View>;
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 15 },
  listenButton: { width: 92, height: 92, borderRadius: 46, backgroundColor: Theme.colors.blue, borderBottomWidth: 6, borderBottomColor: Theme.colors.blueDark, alignItems: 'center', justifyContent: 'center' },
  helper: { color: Theme.colors.muted, fontSize: 14, lineHeight: 20, textAlign: 'center' },
  choices: { width: '100%', gap: 10 },
  choice: { minHeight: 60, borderRadius: 8, borderWidth: 2, borderBottomWidth: 4, borderColor: Theme.colors.border, backgroundColor: '#FFFFFF', paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  choiceSelected: { borderColor: Theme.colors.green, backgroundColor: '#F0FBF2' },
  choiceText: { color: Theme.colors.ink, fontSize: 17, fontWeight: '800' },
});
