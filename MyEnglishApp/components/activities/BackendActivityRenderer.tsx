import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Speech from 'expo-speech';
import React, { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { FlashCardActivity } from '@/components/activities/FlashCardActivity';
import { SpeakingActivity } from '@/components/activities/SpeakingActivity';
import { VocabularyCard } from '@/components/activities/VocabularyCard';
import { ActionButton } from '@/components/ui/ActionButton';
import { Theme } from '@/constants/Theme';
import { resolveCurriculumMediaUrl } from '@/services/curriculumService';
import type { BackendActivity } from '@/types/backendCurriculum';

type Props = {
  activity: BackendActivity;
  disabled?: boolean;
  onSubmit: (answer: unknown) => void;
};

type VocabularyItem = { word: string; meaning: string; example?: string };

const pairColors = [
  { borderColor: '#48A8DF', backgroundColor: '#EAF7FE' },
  { borderColor: '#7D69D5', backgroundColor: '#F0EDFF' },
  { borderColor: '#D99B13', backgroundColor: '#FFF8E5' },
  { borderColor: '#38A74A', backgroundColor: '#EEF9F0' },
];

export function BackendActivityRenderer({ activity, disabled, onSubmit }: Props) {
  const content = activity.content;
  const [selected, setSelected] = useState<string>();
  const [input, setInput] = useState('');
  const [ordered, setOrdered] = useState<string[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string>();
  const [pairs, setPairs] = useState<Record<string, string>>({});
  const [vocabularyIndex, setVocabularyIndex] = useState(0);
  const [introFlipped, setIntroFlipped] = useState(false);

  const tokens = asStrings(content.tokens);
  const shuffledTokens = useMemo(() => [...tokens], [activity.id, content.tokens]);
  const shuffledRight = useMemo(
    () => stableShuffle(asStrings(content.right), activity.id),
    [activity.id, content.right],
  );
  const vocabularyItems = asVocabularyItems(content.items);
  const imagePath = asString(content.imagePath);
  const imageWidth = asNumber(content.imageWidth);
  const imageHeight = asNumber(content.imageHeight);
  const imageAlt = asString(content.imageAlt);
  const imageRatio = imageWidth > 0 && imageHeight > 0
    ? Math.max(0.78, Math.min(1.8, imageWidth / imageHeight))
    : 1.5;
  const image = imagePath ? { uri: resolveCurriculumMediaUrl(imagePath) } : undefined;

  if (activity.type === 'INTRO') {
    const current = vocabularyItems[vocabularyIndex];
    const isLast = vocabularyIndex === vocabularyItems.length - 1;
    return <View style={styles.stack}>
      {image ? <Image accessibilityLabel={imageAlt} source={image} style={[styles.introImage, { aspectRatio: imageRatio }]} resizeMode="contain" /> : null}
      {current ? <>
        <View style={styles.vocabularyProgress}>
          <Text style={styles.vocabularyProgressText}>TỪ {vocabularyIndex + 1}/{vocabularyItems.length}</Text>
          <View style={styles.progressDots}>{vocabularyItems.map((item, index) => <View key={item.word} style={[styles.progressDot, index <= vocabularyIndex && styles.progressDotActive]} />)}</View>
        </View>
        <VocabularyCard item={current} onFlipped={setIntroFlipped} />
        <View style={styles.navigationRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Từ trước"
            disabled={disabled || vocabularyIndex === 0}
            onPress={() => { setVocabularyIndex((index) => Math.max(0, index - 1)); setIntroFlipped(false); }}
            style={[styles.previousButton, vocabularyIndex === 0 && styles.navigationDisabled]}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={Theme.colors.ink} />
          </Pressable>
          <View style={styles.nextButton}>
            <ActionButton
              label={isLast ? 'Hoàn thành khám phá' : 'Từ tiếp theo'}
              icon={isLast ? 'check' : 'arrow-right'}
              disabled={disabled || !introFlipped}
              onPress={() => {
                if (isLast) onSubmit({ completed: true });
                else { setVocabularyIndex((index) => index + 1); setIntroFlipped(false); }
              }}
            />
          </View>
        </View>
      </> : <Text style={styles.helper}>Hoạt động chưa có danh sách từ vựng.</Text>}
    </View>;
  }

  if (activity.type === 'FLASHCARD') {
    return <FlashCardActivity
      activity={activity}
      content={content}
      image={image}
      imageAlt={imageAlt}
      imageRatio={imageRatio}
      disabled={disabled}
      onSubmit={onSubmit}
    />;
  }

  if (activity.type === 'SPEAK') {
    return <SpeakingActivity
      phrase={asString(content.modelText) || activity.prompt}
      instruction={activity.instruction}
      onComplete={() => onSubmit({ completed: true })}
    />;
  }

  if (activity.type === 'TYPE_ANSWER') {
    return <View style={styles.stack}>
      <TextInput
        value={input}
        onChangeText={setInput}
        editable={!disabled}
        autoCapitalize="none"
        autoCorrect={false}
        maxLength={asNumber(content.maxLength) || 40}
        placeholder={asString(content.placeholder) || 'Nhập câu trả lời'}
        placeholderTextColor="#74838C"
        style={styles.input}
      />
      <ActionButton label="Kiểm tra" disabled={disabled || !input.trim()} onPress={() => onSubmit({ value: input.trim() })} />
    </View>;
  }

  if (activity.type === 'WORD_ORDER') {
    return <View style={styles.stack}>
      <View style={styles.sentenceArea}>{ordered.length === 0
        ? <Text style={styles.helper}>Chạm các từ theo đúng thứ tự.</Text>
        : ordered.map((word, index) => <Pressable key={`${word}-${index}`} disabled={disabled} onPress={() => setOrdered((items) => items.filter((_, itemIndex) => itemIndex !== index))} style={styles.selectedWord}><Text style={styles.wordText}>{word}</Text></Pressable>)}</View>
      <View style={styles.wordRow}>{shuffledTokens.map((word, index) => {
        const used = ordered.filter((item) => item === word).length > shuffledTokens.slice(0, index).filter((item) => item === word).length;
        return <Pressable key={`${word}-${index}`} disabled={disabled || used} onPress={() => setOrdered((items) => [...items, word])} style={[styles.wordButton, used && styles.used]}><Text style={styles.wordText}>{word}</Text></Pressable>;
      })}</View>
      <ActionButton label="Kiểm tra" disabled={disabled || ordered.length !== tokens.length} onPress={() => onSubmit({ order: ordered })} />
    </View>;
  }

  if (activity.type === 'MATCH_PAIRS') {
    const left = asStrings(content.left);
    const removePair = (leftValue: string) => {
      setPairs((current) => {
        const next = { ...current };
        delete next[leftValue];
        return next;
      });
      setSelectedLeft(undefined);
    };

    return <View style={styles.stack}>
      <View style={styles.matchGuide}>
        <MaterialCommunityIcons name="gesture-tap" size={22} color={Theme.colors.blueDark} />
        <Text style={styles.matchGuideText}>Chọn một từ tiếng Anh, rồi chọn nghĩa tiếng Việt.</Text>
      </View>
      <View style={styles.matchToolbar}>
        <Text style={styles.pairCount}>Đã ghép {Object.keys(pairs).length}/{left.length} cặp</Text>
        {Object.keys(pairs).length > 0 ? <Pressable accessibilityRole="button" accessibilityLabel="Làm lại các cặp" onPress={() => { setPairs({}); setSelectedLeft(undefined); }} style={styles.resetButton}>
          <MaterialCommunityIcons name="refresh" size={21} color={Theme.colors.coralDark} />
          <Text style={styles.resetText}>Làm lại</Text>
        </Pressable> : null}
      </View>
      <View style={styles.columnLabels}>
        <Text style={styles.columnLabel}>{asString(content.leftLabel) || 'Tiếng Anh'}</Text>
        <Text style={styles.columnLabel}>{asString(content.rightLabel) || 'Nghĩa tiếng Việt'}</Text>
      </View>
      <View style={styles.columns}>
        <View style={styles.column}>{left.map((value) => {
          const pairIndex = Object.keys(pairs).indexOf(value);
          const tone = pairIndex >= 0 ? pairColors[pairIndex % pairColors.length] : undefined;
          return <Pressable
            key={value}
            disabled={disabled}
            onPress={() => pairs[value] ? removePair(value) : setSelectedLeft(value)}
            style={[styles.matchChoice, selectedLeft === value && styles.matchSelected, tone]}
          >
            {pairIndex >= 0 ? <View style={[styles.pairBadge, { backgroundColor: tone?.borderColor }]}><Text style={styles.pairBadgeText}>{pairIndex + 1}</Text></View> : null}
            <Text style={styles.matchChoiceText}>{value}</Text>
          </Pressable>;
        })}</View>
        <View style={styles.column}>{shuffledRight.map((value) => {
          const pairedLeft = Object.keys(pairs).find((key) => pairs[key] === value);
          const pairIndex = pairedLeft ? Object.keys(pairs).indexOf(pairedLeft) : -1;
          const tone = pairIndex >= 0 ? pairColors[pairIndex % pairColors.length] : undefined;
          return <Pressable
            key={value}
            disabled={disabled || (!selectedLeft && !pairedLeft)}
            onPress={() => {
              if (pairedLeft) return removePair(pairedLeft);
              if (!selectedLeft) return;
              setPairs((current) => ({ ...current, [selectedLeft]: value }));
              setSelectedLeft(undefined);
            }}
            style={[styles.matchChoice, tone, !selectedLeft && !pairedLeft && styles.matchChoiceIdle]}
          >
            {pairIndex >= 0 ? <View style={[styles.pairBadge, { backgroundColor: tone?.borderColor }]}><Text style={styles.pairBadgeText}>{pairIndex + 1}</Text></View> : null}
            <Text style={styles.matchChoiceText}>{value}</Text>
          </Pressable>;
        })}</View>
      </View>
      {selectedLeft ? <Text style={styles.selectionHint}>Đang chọn “{selectedLeft}”. Hãy chạm nghĩa ở cột bên phải.</Text> : null}
      <Text style={styles.undoHint}>Chạm lại một cặp đã ghép để tháo cặp.</Text>
      <ActionButton label="Kiểm tra" disabled={disabled || Object.keys(pairs).length !== left.length} onPress={() => onSubmit({ pairs })} />
    </View>;
  }

  const rawOptions = Array.isArray(content.options) ? content.options : [];
  const options = rawOptions.map((option) => typeof option === 'string'
    ? { id: option, label: option }
    : { id: asString((option as Record<string, unknown>).id), label: asString((option as Record<string, unknown>).label) });
  const binaryOptions = activity.type === 'TRUE_FALSE'
    ? [{ id: 'true', label: 'Đúng' }, { id: 'false', label: 'Sai' }]
    : options;
  const speechText = asString(content.speechText);

  return <View style={styles.stack}>
    {image ? <Image accessibilityLabel={imageAlt} source={image} style={[styles.heroImage, { aspectRatio: imageRatio }]} resizeMode="contain" /> : null}
    {activity.type === 'LISTEN_CHOICE' ? <Pressable accessibilityRole="button" accessibilityLabel="Nghe câu hỏi" onPress={() => Speech.speak(speechText || activity.prompt, { language: 'en-US', rate: 0.74 })} style={styles.bigListen}>
      <MaterialCommunityIcons name="volume-high" size={36} color="#FFFFFF" />
    </Pressable> : null}
    <View style={styles.stack}>{binaryOptions.map((option) => <Pressable key={option.id} disabled={disabled} onPress={() => setSelected(option.id)} style={[styles.choice, selected === option.id && styles.choiceSelected]}>
      <Text style={styles.choiceText}>{option.label}</Text>
      {selected === option.id ? <MaterialCommunityIcons name="check-circle" size={22} color={Theme.colors.greenDark} /> : null}
    </Pressable>)}</View>
    <ActionButton label="Kiểm tra" disabled={disabled || !selected} onPress={() => onSubmit({ value: selected })} />
  </View>;
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function asStrings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function asVocabularyItems(value: unknown): VocabularyItem[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const record = item as Record<string, unknown>;
    const word = asString(record.word);
    const meaning = asString(record.meaning);
    return word && meaning ? [{ word, meaning, example: asString(record.example) || undefined }] : [];
  });
}

function asNumber(value: unknown): number {
  return typeof value === 'number' ? value : 0;
}

function stableShuffle(values: string[], seed: number): string[] {
  const result = [...values];
  let state = Math.max(1, seed);
  for (let index = result.length - 1; index > 0; index -= 1) {
    state = (state * 9301 + 49297) % 233280;
    const target = Math.floor((state / 233280) * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

const styles = StyleSheet.create({
  stack: { gap: 14 },
  heroImage: { width: '100%', maxHeight: 360, borderRadius: 8, backgroundColor: '#E8EEF2' },
  introImage: { width: '100%', maxHeight: 230, borderRadius: 8, backgroundColor: '#E8EEF2' },
  cardTitle: { color: Theme.colors.ink, fontSize: 30, fontWeight: '900', textAlign: 'center' },
  meaning: { color: Theme.colors.violet, fontSize: 18, fontWeight: '800', textAlign: 'center' },
  vocabularyProgress: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  vocabularyProgressText: { color: Theme.colors.blueDark, fontSize: 11, fontWeight: '900' },
  progressDots: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end', gap: 5 },
  progressDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#DDE6EB' },
  progressDotActive: { backgroundColor: Theme.colors.green },
  vocabularyCard: { minHeight: 220, alignItems: 'center', justifyContent: 'center', padding: 22, borderWidth: 2, borderBottomWidth: 5, borderColor: '#B9E3F8', borderRadius: 8, backgroundColor: '#FFFFFF' },
  pressedCard: { transform: [{ translateY: 2 }], borderBottomWidth: 3 },
  wordSpeaker: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', backgroundColor: Theme.colors.blue },
  vocabularyWord: { color: Theme.colors.ink, fontSize: 34, fontWeight: '900', marginTop: 12, textAlign: 'center' },
  meaningDivider: { width: 52, height: 3, borderRadius: 2, backgroundColor: Theme.colors.yellow, marginVertical: 12 },
  vocabularyMeaning: { color: Theme.colors.violet, fontSize: 21, fontWeight: '900', textAlign: 'center' },
  vocabularyExample: { color: Theme.colors.muted, lineHeight: 20, marginTop: 8, textAlign: 'center' },
  tapHint: { color: Theme.colors.muted, fontSize: 12, marginTop: 15 },
  navigationRow: { flexDirection: 'row', alignItems: 'stretch', gap: 10 },
  previousButton: { width: 54, minHeight: 52, borderWidth: 2, borderBottomWidth: 4, borderColor: Theme.colors.border, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  navigationDisabled: { opacity: 0.35 },
  nextButton: { flex: 1 },
  wordRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  listenButton: { minHeight: 48, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, borderRadius: 8, backgroundColor: '#EAF7FE', borderWidth: 1, borderColor: '#B9E3F8' },
  listenText: { color: Theme.colors.blueDark, fontWeight: '900' },
  input: { minHeight: 56, borderWidth: 2, borderColor: Theme.colors.border, borderRadius: 8, backgroundColor: '#FFFFFF', paddingHorizontal: 15, color: Theme.colors.ink, fontSize: 18, fontWeight: '700' },
  sentenceArea: { minHeight: 94, padding: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 8, borderBottomWidth: 2, borderBottomColor: Theme.colors.border },
  helper: { color: Theme.colors.muted, textAlign: 'center', lineHeight: 20 },
  selectedWord: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 7, backgroundColor: '#EAF7FE' },
  wordButton: { paddingHorizontal: 12, paddingVertical: 9, borderWidth: 1, borderBottomWidth: 3, borderColor: '#C7D1D7', borderRadius: 7, backgroundColor: '#FFFFFF' },
  wordText: { color: Theme.colors.ink, fontWeight: '800' },
  used: { opacity: 0.25 },
  matchGuide: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 9, padding: 11, borderRadius: 8, backgroundColor: '#EAF7FE' },
  matchGuideText: { flex: 1, color: Theme.colors.blueDark, fontWeight: '800', lineHeight: 19 },
  matchToolbar: { minHeight: 34, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  pairCount: { color: Theme.colors.ink, fontWeight: '900' },
  resetButton: { minHeight: 34, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8 },
  resetText: { color: Theme.colors.coralDark, fontSize: 12, fontWeight: '900' },
  columnLabels: { flexDirection: 'row', gap: 10 },
  columnLabel: { flex: 1, color: Theme.colors.muted, fontSize: 11, fontWeight: '900', textAlign: 'center' },
  columns: { flexDirection: 'row', alignItems: 'stretch', gap: 10 },
  column: { flex: 1, gap: 9 },
  matchChoice: { minHeight: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 8, paddingVertical: 10, borderWidth: 2, borderBottomWidth: 4, borderColor: Theme.colors.border, borderRadius: 8, backgroundColor: '#FFFFFF' },
  matchSelected: { borderColor: Theme.colors.blue, backgroundColor: '#EAF7FE' },
  matchChoiceIdle: { opacity: 0.72 },
  matchChoiceText: { flexShrink: 1, color: Theme.colors.ink, fontSize: 15, fontWeight: '800', textAlign: 'center' },
  pairBadge: { width: 23, height: 23, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  pairBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  selectionHint: { color: Theme.colors.blueDark, fontWeight: '800', textAlign: 'center', lineHeight: 19 },
  undoHint: { color: Theme.colors.muted, fontSize: 12, textAlign: 'center' },
  choice: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: 10, borderWidth: 2, borderBottomWidth: 4, borderColor: Theme.colors.border, borderRadius: 8, backgroundColor: '#FFFFFF' },
  choiceSelected: { borderColor: Theme.colors.green, backgroundColor: '#F0FBF2' },
  choiceText: { flex: 1, color: Theme.colors.ink, fontSize: 16, fontWeight: '800', textAlign: 'center' },
  bigListen: { width: 88, height: 88, borderRadius: 44, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', backgroundColor: Theme.colors.blue, borderBottomWidth: 6, borderBottomColor: Theme.colors.blueDark },
});
