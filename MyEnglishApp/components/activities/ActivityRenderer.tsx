import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useMemo, useState } from 'react';
import { Image, ImageSourcePropType, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { ListenChoiceActivity } from '@/components/activities/ListenChoiceActivity';
import { PhotoMissionActivity } from '@/components/activities/PhotoMissionActivity';
import { SpeakingActivity } from '@/components/activities/SpeakingActivity';
import { ActionButton } from '@/components/ui/ActionButton';
import { Theme } from '@/constants/Theme';
import { Activity } from '@/types/learning';

type Props = { activity: Activity; onAnswer: (correct: boolean, selected: unknown) => void };

export function ActivityRenderer({ activity, onAnswer }: Props) {
  const [selected, setSelected] = useState<string>();
  const [input, setInput] = useState('');
  const [builtWords, setBuiltWords] = useState<string[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string>();
  const [matched, setMatched] = useState<string[]>([]);
  const shuffledWords = useMemo(() => [...(activity.words ?? [])].sort(() => Math.random() - 0.5), [activity.id]);

  const checkSelection = () => onAnswer(selected === String(activity.answer), selected);
  const checkInput = () => onAnswer(input.trim().toLowerCase() === String(activity.answer).trim().toLowerCase(), input);
  const checkSentence = () => onAnswer(builtWords.join(' ') === activity.answer, builtWords.join(' '));
  const activityImage = resolveImage(activity.image, activity.imageUrl);

  if (activity.type === 'WORD_CARD') return <View style={styles.wordCard}>
    {activityImage && <Image source={activityImage} style={styles.heroImage} resizeMode="cover" />}
    <Text style={styles.word}>{activity.prompt}</Text><Text style={styles.meaning}>{activity.meaning}</Text>
    <View style={styles.example}><MaterialCommunityIcons name="message-text" size={20} color={Theme.colors.blueDark} /><Text style={styles.exampleText}>{activity.example}</Text></View>
    <ActionButton label="Đã hiểu" icon="check" onPress={() => onAnswer(true, 'learned')} />
  </View>;

  if (activity.type === 'IMAGE_CAPTION') return <PhotoMissionActivity onComplete={() => onAnswer(true, 'caption-created')} />;

  if (activity.type === 'SPEAK_REPEAT') return <SpeakingActivity phrase={activity.prompt} instruction={activity.instruction} onComplete={(uri) => onAnswer(true, uri)} />;

  if (activity.type === 'LISTEN_CHOOSE') return <ListenChoiceActivity activity={activity} onAnswer={onAnswer} />;

  if (activity.type === 'FILL_IN_BLANK') return <View style={styles.stack}>
    <Text style={styles.bigPrompt}>{activity.sentence}</Text>
    <TextInput value={input} onChangeText={setInput} autoCapitalize="none" autoCorrect={false} placeholder="Nhập từ còn thiếu" placeholderTextColor="#9AA8B1" style={styles.input} />
    <ActionButton label="Kiểm tra" disabled={!input.trim()} onPress={checkInput} />
  </View>;

  if (activity.type === 'SENTENCE_BUILDER') return <View style={styles.stack}>
    <View style={styles.sentenceArea}>{builtWords.length ? builtWords.map((word, index) => <Pressable key={`${word}-${index}`} onPress={() => setBuiltWords((items) => items.filter((_, i) => i !== index))} style={styles.wordChipSelected}><Text style={styles.wordChipText}>{word}</Text></Pressable>) : <Text style={styles.placeholderSentence}>Chạm vào các từ theo đúng thứ tự</Text>}</View>
    <View style={styles.wordBank}>{shuffledWords.map((word, index) => {
      const usedCount = builtWords.filter((item) => item === word).length;
      const previousCount = shuffledWords.slice(0, index).filter((item) => item === word).length;
      const used = usedCount > previousCount;
      return <Pressable key={`${word}-${index}`} disabled={used} onPress={() => setBuiltWords((items) => [...items, word])} style={[styles.wordChip, used && styles.wordChipUsed]}><Text style={styles.wordChipText}>{word}</Text></Pressable>;
    })}</View>
    <ActionButton label="Kiểm tra" disabled={!builtWords.length} onPress={checkSentence} />
  </View>;

  if (activity.type === 'MATCHING') return <View style={styles.stack}>
    <Text style={styles.helper}>Chọn một từ bên trái, sau đó chọn nghĩa đúng.</Text>
    <View style={styles.matchColumns}>
      <View style={styles.matchColumn}>{activity.pairs?.map((pair) => <Pressable key={pair.left} disabled={matched.includes(pair.left)} onPress={() => setSelectedLeft(pair.left)} style={[styles.matchButton, selectedLeft === pair.left && styles.choiceSelected, matched.includes(pair.left) && styles.matchDone]}><Text style={styles.choiceLabel}>{pair.left}</Text></Pressable>)}</View>
      <View style={styles.matchColumn}>{[...(activity.pairs ?? [])].reverse().map((pair) => <Pressable key={pair.right} disabled={matched.includes(pair.left)} onPress={() => {
        if (!selectedLeft) return;
        if (selectedLeft !== pair.left) { onAnswer(false, `${selectedLeft}:${pair.right}`); return; }
        const next = [...matched, selectedLeft]; setMatched(next); setSelectedLeft(undefined);
        if (next.length === activity.pairs?.length) onAnswer(true, next);
      }} style={[styles.matchButton, matched.includes(pair.left) && styles.matchDone]}><Text style={styles.choiceLabel}>{pair.right}</Text></Pressable>)}</View>
    </View>
  </View>;

  if (activity.type === 'TRUE_FALSE') return <View style={styles.stack}>
    {activityImage && <Image source={activityImage} style={styles.heroImage} />}
    <View style={styles.choicesRow}>{[{ id: 'true', label: 'Đúng', icon: 'check-circle' }, { id: 'false', label: 'Sai', icon: 'close-circle' }].map((choice) => <Pressable key={choice.id} onPress={() => setSelected(choice.id)} style={[styles.binaryChoice, selected === choice.id && styles.choiceSelected]}><MaterialCommunityIcons name={choice.icon as never} size={32} color={choice.id === 'true' ? Theme.colors.greenDark : Theme.colors.coralDark} /><Text style={styles.choiceLabel}>{choice.label}</Text></Pressable>)}</View>
    <ActionButton label="Kiểm tra" disabled={!selected} onPress={() => onAnswer((selected === 'true') === activity.answer, selected)} />
  </View>;

  if (activityImage) return <View style={styles.stack}>
    <Image source={activityImage} style={styles.heroImage} resizeMode="cover" />
    <ChoiceArea activity={activity} selected={selected} onSelect={setSelected} />
    <ActionButton label="Kiểm tra" disabled={!selected} onPress={checkSelection} />
  </View>;

  return <View style={styles.stack}><ChoiceArea activity={activity} selected={selected} onSelect={setSelected} /><ActionButton label="Kiểm tra" disabled={!selected} onPress={checkSelection} /></View>;
}

function ChoiceArea({ activity, selected, onSelect }: { activity: Activity; selected?: string; onSelect: (value: string) => void }) {
  const hasImages = activity.choices?.some((choice) => choice.image || choice.imageUrl);
  return <View style={hasImages ? styles.imageChoiceGrid : styles.choiceList}>{activity.choices?.map((choice, index) => {
    const source = resolveImage(choice.image, choice.imageUrl);
    return <Pressable key={choice.id} onPress={() => onSelect(choice.id)} style={[hasImages ? styles.imageChoice : styles.choice, selected === choice.id && styles.choiceSelected]}>
      {source && <Image source={source} style={styles.choiceImage} resizeMode="cover" />}
      {!hasImages && <View style={[styles.choiceIndex, selected === choice.id && styles.choiceIndexSelected]}><Text style={styles.choiceIndexText}>{index + 1}</Text></View>}
      <Text style={styles.choiceLabel}>{choice.label}</Text>
      {selected === choice.id && <MaterialCommunityIcons name="check-circle" size={22} color={Theme.colors.greenDark} />}
    </Pressable>;
  })}</View>;
}

function resolveImage(image?: ImageSourcePropType, imageUrl?: string): ImageSourcePropType | undefined {
  return image ?? (imageUrl ? { uri: imageUrl } : undefined);
}

const styles = StyleSheet.create({
  stack: { gap: 16 }, centered: { gap: 16, alignItems: 'center' }, wordCard: { gap: 10, alignItems: 'center' }, heroImage: { width: '100%', aspectRatio: 16 / 10, borderRadius: 8, backgroundColor: '#E8EEF2' },
  word: { color: Theme.colors.ink, fontSize: 32, fontWeight: '900' }, meaning: { color: Theme.colors.violet, fontSize: 18, fontWeight: '800' },
  example: { width: '100%', padding: 14, borderRadius: 8, backgroundColor: '#EAF7FE', flexDirection: 'row', gap: 10, alignItems: 'center' }, exampleText: { flex: 1, color: Theme.colors.ink, fontWeight: '700', fontSize: 16 },
  bigPrompt: { color: Theme.colors.ink, fontSize: 25, lineHeight: 34, fontWeight: '900', textAlign: 'center' }, helper: { color: Theme.colors.muted, fontSize: 14, lineHeight: 20, textAlign: 'center' },
  speakIcon: { width: 84, height: 84, borderRadius: 42, backgroundColor: '#FFF0EF', alignItems: 'center', justifyContent: 'center' },
  input: { height: 56, borderRadius: 8, borderWidth: 2, borderColor: Theme.colors.border, paddingHorizontal: 16, backgroundColor: '#FFFFFF', color: Theme.colors.ink, fontSize: 18, fontWeight: '700' },
  choiceList: { gap: 10 }, choice: { minHeight: 62, borderRadius: 8, borderWidth: 2, borderBottomWidth: 4, borderColor: Theme.colors.border, backgroundColor: '#FFFFFF', padding: 10, flexDirection: 'row', alignItems: 'center', gap: 12 }, choiceSelected: { borderColor: Theme.colors.green, backgroundColor: '#F0FBF2' },
  imageChoiceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, imageChoice: { width: '48%', minHeight: 154, borderRadius: 8, borderWidth: 2, borderBottomWidth: 4, borderColor: Theme.colors.border, backgroundColor: '#FFFFFF', padding: 8, alignItems: 'center', justifyContent: 'space-between', gap: 7 }, choiceImage: { width: '100%', aspectRatio: 4 / 3, borderRadius: 6, backgroundColor: '#EDF2F5' },
  choiceIndex: { width: 34, height: 34, borderRadius: 6, backgroundColor: '#EDF2F5', alignItems: 'center', justifyContent: 'center' }, choiceIndexSelected: { backgroundColor: '#DDF6E1' }, choiceIndexText: { color: Theme.colors.muted, fontWeight: '900' }, choiceLabel: { flex: 1, color: Theme.colors.ink, fontSize: 16, fontWeight: '800', textAlign: 'center' },
  choicesRow: { flexDirection: 'row', gap: 12 }, binaryChoice: { flex: 1, minHeight: 110, borderWidth: 2, borderBottomWidth: 4, borderColor: Theme.colors.border, borderRadius: 8, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', gap: 8 },
  sentenceArea: { minHeight: 100, borderBottomWidth: 2, borderColor: Theme.colors.border, paddingVertical: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignContent: 'flex-start' }, placeholderSentence: { color: Theme.colors.muted, fontWeight: '600', paddingTop: 10 },
  wordBank: { minHeight: 90, flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }, wordChip: { paddingHorizontal: 13, paddingVertical: 10, borderRadius: 7, borderWidth: 1, borderBottomWidth: 3, borderColor: '#C7D1D7', backgroundColor: '#FFFFFF' }, wordChipSelected: { paddingHorizontal: 13, paddingVertical: 10, borderRadius: 7, backgroundColor: '#EAF7FE', borderWidth: 1, borderColor: '#B8E0F5' }, wordChipUsed: { opacity: 0.2 }, wordChipText: { color: Theme.colors.ink, fontWeight: '800' },
  matchColumns: { flexDirection: 'row', gap: 10 }, matchColumn: { flex: 1, gap: 9 }, matchButton: { minHeight: 55, borderRadius: 8, borderWidth: 2, borderColor: Theme.colors.border, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', padding: 8 }, matchDone: { borderColor: Theme.colors.green, backgroundColor: '#E5F8E8', opacity: 0.55 },
});
