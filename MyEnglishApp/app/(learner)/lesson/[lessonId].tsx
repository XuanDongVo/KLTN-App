import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActivityRenderer } from '@/components/activities/ActivityRenderer';
import { ActionButton } from '@/components/ui/ActionButton';
import { Theme } from '@/constants/Theme';
import { useLearning } from '@/context/LearningContext';
import { findLesson } from '@/data/curriculum';
import { LessonResult } from '@/types/learning';

type Feedback = { correct: boolean; explanation?: string };

export default function LessonScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const router = useRouter();
  const { completeLesson } = useLearning();
  const lesson = findLesson(lessonId);
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [mistakes, setMistakes] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<Feedback>();

  if (!lesson) return <SafeAreaView style={styles.center}><Text style={styles.title}>Khong tim thay bai hoc</Text><ActionButton label="Ve trang hoc" onPress={() => router.replace('/(tabs)')} /></SafeAreaView>;

  if (!started) return <SafeAreaView style={styles.safe}>
    <View style={styles.introTop}><Pressable onPress={() => router.back()} style={styles.close}><MaterialCommunityIcons name="close" size={26} color={Theme.colors.muted} /></Pressable></View>
    <View style={styles.intro}>
      <View style={[styles.introIcon, { backgroundColor: lesson.color }]}><MaterialCommunityIcons name={lesson.icon as never} size={52} color="#FFFFFF" /></View>
      <Text style={styles.eyebrow}>BAI HOC MOI</Text><Text style={styles.introTitle}>{lesson.title}</Text><Text style={styles.objective}>{lesson.objective}</Text>
      <View style={styles.metaRow}><Meta icon="clock-outline" value={`${lesson.estimatedMinutes} phut`} /><Meta icon="cards-outline" value={`${lesson.activities.length} hoat dong`} /><Meta icon="star-four-points" value={`${lesson.activities.reduce((sum, item) => sum + item.xp, 0)} XP`} /></View>
    </View>
    <View style={styles.bottom}><ActionButton label="Bat dau bai hoc" icon="play" color={lesson.color} onPress={() => setStarted(true)} /></View>
  </SafeAreaView>;

  const activity = lesson.activities[index];
  const onAnswer = (isCorrect: boolean) => {
    if (feedback) return;
    if (isCorrect) setCorrect((value) => value + 1);
    else setMistakes((value) => [...value, activity.id]);
    setFeedback({ correct: isCorrect, explanation: activity.explanation });
  };

  const continueLesson = async () => {
    if (index + 1 < lesson.activities.length) {
      setIndex((value) => value + 1);
      setFeedback(undefined);
      return;
    }
    const total = lesson.activities.length;
    const finalCorrect = correct;
    const accuracy = finalCorrect / total;
    const stars = accuracy >= 0.9 ? 3 : accuracy >= 0.65 ? 2 : 1;
    const xpEarned = lesson.activities.reduce((sum, item) => sum + item.xp, 0);
    const result: LessonResult = { lessonId: lesson.id, correct: finalCorrect, total, stars, xpEarned, mistakes, completedAt: new Date().toISOString() };
    await completeLesson(result);
    router.replace({ pathname: '/(learner)/lesson-complete', params: { lessonId: lesson.id, correct: String(finalCorrect), total: String(total), stars: String(stars), xp: String(xpEarned) } });
  };

  return <SafeAreaView style={styles.safe}>
    <View style={styles.playerHeader}>
      <Pressable onPress={() => router.back()} style={styles.close}><MaterialCommunityIcons name="close" size={26} color={Theme.colors.muted} /></Pressable>
      <View style={styles.progress}><View style={[styles.progressFill, { width: `${((index + 1) / lesson.activities.length) * 100}%`, backgroundColor: lesson.color }]} /></View>
      <View style={styles.heart}><MaterialCommunityIcons name="heart" size={22} color={Theme.colors.coral} /><Text style={styles.heartText}>5</Text></View>
    </View>
    <ScrollView contentContainerStyle={styles.playerContent} keyboardShouldPersistTaps="handled">
      <Text style={styles.counter}>HOAT DONG {index + 1}/{lesson.activities.length}</Text>
      <Text style={styles.prompt}>{activity.prompt}</Text>
      {activity.instruction && activity.type !== 'IMAGE_CAPTION' && activity.type !== 'SPEAK_REPEAT' && <Text style={styles.instruction}>{activity.instruction}</Text>}
      <ActivityRenderer key={activity.id} activity={activity} onAnswer={onAnswer} />
    </ScrollView>
    {feedback && <View style={[styles.feedback, { backgroundColor: feedback.correct ? '#E5F8E8' : '#FFF0EF', borderTopColor: feedback.correct ? '#B8EAC0' : '#FFD0CD' }]}>
      <View style={styles.feedbackCopy}><MaterialCommunityIcons name={feedback.correct ? 'check-circle' : 'lightbulb-on'} size={30} color={feedback.correct ? Theme.colors.greenDark : Theme.colors.coralDark} /><View style={{ flex: 1 }}><Text style={[styles.feedbackTitle, { color: feedback.correct ? Theme.colors.greenDark : Theme.colors.coralDark }]}>{feedback.correct ? 'Chinh xac!' : 'Thu lai o buoi on tap nhe'}</Text>{feedback.explanation && <Text style={styles.feedbackText}>{feedback.explanation}</Text>}</View></View>
      <ActionButton label={index + 1 === lesson.activities.length ? 'Xem ket qua' : 'Tiep tuc'} color={feedback.correct ? Theme.colors.green : Theme.colors.coral} onPress={continueLesson} />
    </View>}
  </SafeAreaView>;
}

function Meta({ icon, value }: { icon: string; value: string }) {
  return <View style={styles.meta}><MaterialCommunityIcons name={icon as never} size={20} color={Theme.colors.blueDark} /><Text style={styles.metaText}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.background }, center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 20 },
  introTop: { paddingHorizontal: 16, paddingTop: 4 }, close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  intro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 26 }, introIcon: { width: 116, height: 116, borderRadius: 58, alignItems: 'center', justifyContent: 'center', borderWidth: 7, borderColor: 'rgba(255,255,255,0.65)', ...Theme.shadow },
  eyebrow: { color: Theme.colors.greenDark, fontWeight: '900', fontSize: 11, marginTop: 24 }, introTitle: { color: Theme.colors.ink, fontSize: 30, fontWeight: '900', marginTop: 6, textAlign: 'center' }, title: { color: Theme.colors.ink, fontSize: 24, fontWeight: '900' },
  objective: { color: Theme.colors.muted, fontSize: 16, lineHeight: 23, marginTop: 10, textAlign: 'center', maxWidth: 420 }, metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, justifyContent: 'center', marginTop: 24 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#EAF7FE', borderRadius: 7, paddingHorizontal: 10, paddingVertical: 8 }, metaText: { color: Theme.colors.ink, fontWeight: '800', fontSize: 12 }, bottom: { padding: 16, borderTopWidth: 1, borderTopColor: Theme.colors.border, backgroundColor: '#FFFFFF' },
  playerHeader: { height: 68, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: Theme.colors.border, backgroundColor: '#FFFFFF' },
  progress: { flex: 1, height: 12, borderRadius: 6, backgroundColor: '#DFE7EB', overflow: 'hidden' }, progressFill: { height: '100%', borderRadius: 6 }, heart: { flexDirection: 'row', alignItems: 'center', gap: 3 }, heartText: { color: Theme.colors.coralDark, fontWeight: '900' },
  playerContent: { padding: 20, paddingBottom: 38, maxWidth: 660, width: '100%', alignSelf: 'center' }, counter: { color: Theme.colors.blueDark, fontWeight: '900', fontSize: 11 }, prompt: { color: Theme.colors.ink, fontWeight: '900', fontSize: 23, lineHeight: 30, marginTop: 7, marginBottom: 18 }, instruction: { color: Theme.colors.muted, marginBottom: 14 },
  feedback: { borderTopWidth: 1, padding: 14, gap: 12 }, feedbackCopy: { flexDirection: 'row', alignItems: 'center', gap: 10, maxWidth: 660, width: '100%', alignSelf: 'center' }, feedbackTitle: { fontSize: 18, fontWeight: '900' }, feedbackText: { color: Theme.colors.ink, marginTop: 2, lineHeight: 18 },
});
