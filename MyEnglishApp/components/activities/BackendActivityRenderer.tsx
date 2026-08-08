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
import { styles } from './BackendActivityRenderer.styles';

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
