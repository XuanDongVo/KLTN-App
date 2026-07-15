import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackendActivityRenderer } from '@/components/activities/BackendActivityRenderer';
import { ActionButton } from '@/components/ui/ActionButton';
import { Theme } from '@/constants/Theme';
import { useLearning } from '@/context/LearningContext';
import { curriculumService, resolveCurriculumMediaUrl } from '@/services/curriculumService';
import type { BackendAttemptResult, BackendLessonSession, BackendLessonSummary, BackendLevelCode } from '@/types/backendCurriculum';

type Props = { lessonId: string; level: BackendLevelCode };

export function BackendLessonScreen({ lessonId, level }: Props) {
  const router = useRouter();
  const { completeLesson } = useLearning();
  const [lesson, setLesson] = useState<BackendLessonSummary>();
  const [session, setSession] = useState<BackendLessonSession>();
  const [feedback, setFeedback] = useState<BackendAttemptResult>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    curriculumService.getPath(level)
      .then((path) => {
        const found = path.units.flatMap((unit) => unit.lessons).find((item) => String(item.id) === lessonId);
        if (!found) throw new Error('Không tìm thấy bài học trong chương trình đã xuất bản.');
        setLesson(found);
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'Không tải được bài học.'));
  }, [lessonId, level]);

  const activity = useMemo(() => session?.activities[session.currentActivityIndex], [session]);

  const start = async () => {
    if (!lesson) return;
    setBusy(true);
    setError('');
    try {
      setSession(await curriculumService.startLesson(lesson.id));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không thể bắt đầu bài học.');
    } finally {
      setBusy(false);
    }
  };

  const submit = async (answer: unknown) => {
    if (!session || !activity || busy || feedback) return;
    setBusy(true);
    setError('');
    try {
      setFeedback(await curriculumService.submitAttempt(session.id, activity.id, answer));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không thể nộp câu trả lời.');
    } finally {
      setBusy(false);
    }
  };

  const continueLesson = async () => {
    if (!session || !feedback) return;
    if (!feedback.canFinish) {
      setSession({
        ...session,
        currentActivityIndex: feedback.currentActivityIndex,
        heartsRemaining: feedback.heartsRemaining,
        correctAttempts: session.correctAttempts + (feedback.correct ? 1 : 0),
        totalAttempts: session.totalAttempts + 1,
        xpEarned: feedback.xpEarned,
      });
      setFeedback(undefined);
      return;
    }

    setBusy(true);
    setError('');
    try {
      const result = await curriculumService.finishLesson(session.id);
      await completeLesson({
        lessonId: String(session.lessonId),
        correct: result.correct,
        total: result.total,
        xpEarned: result.xpEarned,
        stars: result.stars,
        completedAt: new Date().toISOString(),
        mistakes: [],
      });
      router.replace({
        pathname: '/(learner)/lesson-complete',
        params: {
          lessonId: String(session.lessonId),
          correct: String(result.correct),
          total: String(result.total),
          stars: String(result.stars),
          xp: String(result.xpEarned),
          level,
        },
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không thể hoàn tất bài học.');
    } finally {
      setBusy(false);
    }
  };

  if (!lesson && !error) {
    return <View style={styles.loading}><ActivityIndicator size="large" color={Theme.colors.green} /></View>;
  }

  if (!session) {
    const cover = lesson?.coverImage;
    const ratio = cover ? Math.max(0.86, Math.min(1.8, cover.width / cover.height)) : 1.5;
    return <SafeAreaView style={styles.safe}>
      <View style={styles.top}><Pressable accessibilityLabel="Đóng bài học" onPress={() => router.back()} style={styles.close}><MaterialCommunityIcons name="close" size={26} color={Theme.colors.muted} /></Pressable></View>
      <ScrollView contentContainerStyle={styles.intro}>
        {cover ? <Image accessibilityLabel={cover.alt} source={{ uri: resolveCurriculumMediaUrl(cover.path) }} style={[styles.introImage, { aspectRatio: ratio }]} resizeMode="contain" /> : null}
        <Text style={styles.eyebrow}>{level.replaceAll('_', ' ')}</Text>
        <Text style={styles.title}>{lesson?.title ?? 'Bài học'}</Text>
        <Text style={styles.objective}>{lesson?.objective}</Text>
        <View style={styles.metaRow}>
          <Meta icon="clock-outline" value={`${lesson?.estimatedMinutes ?? 0} phút`} />
          <Meta icon="cards-outline" value={`${lesson?.activityCount ?? 0} hoạt động`} />
          <Meta icon="star-four-points" value={`+${lesson?.xpReward ?? 0} XP thưởng`} />
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>
      <View style={styles.bottom}>{busy
        ? <ActivityIndicator size="large" color={Theme.colors.green} />
        : <ActionButton label="Bắt đầu bài học" icon="play" disabled={!lesson} onPress={start} />}</View>
    </SafeAreaView>;
  }

  if (!activity && !feedback) {
    return <SafeAreaView style={styles.safe}><View style={styles.intro}><Text style={styles.error}>Phiên học không có hoạt động tiếp theo.</Text></View></SafeAreaView>;
  }

  const visibleIndex = session.currentActivityIndex;
  return <SafeAreaView style={styles.safe}>
    <View style={styles.playerHeader}>
      <Pressable accessibilityLabel="Đóng bài học" onPress={() => router.back()} style={styles.close}><MaterialCommunityIcons name="close" size={26} color={Theme.colors.muted} /></Pressable>
      <View style={styles.progress}><View style={[styles.progressFill, { width: `${((visibleIndex + 1) / session.activities.length) * 100}%` }]} /></View>
      <View style={styles.heart}><MaterialCommunityIcons name="heart" size={22} color={Theme.colors.coral} /><Text style={styles.heartText}>{feedback?.heartsRemaining ?? session.heartsRemaining}</Text></View>
    </View>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.counter}>HOẠT ĐỘNG {visibleIndex + 1}/{session.activities.length}</Text>
      <Text style={styles.prompt}>{activity?.prompt}</Text>
      {activity?.instruction && activity.type !== 'SPEAK' ? <Text style={styles.instruction}>{activity.instruction}</Text> : null}
      {activity ? <BackendActivityRenderer key={activity.id} activity={activity} disabled={busy || Boolean(feedback)} onSubmit={submit} /> : null}
      {busy ? <ActivityIndicator color={Theme.colors.green} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </ScrollView>
    {feedback ? <View style={[styles.feedback, feedback.correct ? styles.feedbackCorrect : styles.feedbackWrong]}>
      <View style={styles.feedbackCopy}>
        <MaterialCommunityIcons name={feedback.correct ? 'check-circle' : 'lightbulb-on'} size={30} color={feedback.correct ? Theme.colors.greenDark : Theme.colors.coralDark} />
        <View style={styles.feedbackText}>
          <Text style={[styles.feedbackTitle, { color: feedback.correct ? Theme.colors.greenDark : Theme.colors.coralDark }]}>{feedback.feedback}</Text>
          <Text style={styles.feedbackMeta}>+{feedback.xpEarned} XP trong phiên</Text>
        </View>
      </View>
      <ActionButton label={feedback.canFinish ? 'Xem kết quả' : 'Tiếp tục'} color={feedback.correct ? Theme.colors.green : Theme.colors.coral} onPress={continueLesson} disabled={busy} />
    </View> : null}
  </SafeAreaView>;
}

function Meta({ icon, value }: { icon: string; value: string }) {
  return <View style={styles.meta}><MaterialCommunityIcons name={icon as never} size={19} color={Theme.colors.blueDark} /><Text style={styles.metaText}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.background },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  top: { padding: 10 },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  intro: { flexGrow: 1, padding: 24, paddingTop: 8, alignItems: 'center', justifyContent: 'center' },
  introImage: { width: '100%', maxWidth: 520, maxHeight: 350, borderRadius: 8, backgroundColor: '#E8EEF2' },
  eyebrow: { color: Theme.colors.greenDark, fontSize: 11, fontWeight: '900', marginTop: 20 },
  title: { color: Theme.colors.ink, fontSize: 30, fontWeight: '900', textAlign: 'center', marginTop: 5 },
  objective: { color: Theme.colors.muted, fontSize: 16, lineHeight: 23, textAlign: 'center', maxWidth: 430, marginTop: 9 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 22 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 7, backgroundColor: '#EAF7FE' },
  metaText: { color: Theme.colors.ink, fontSize: 12, fontWeight: '800' },
  bottom: { padding: 16, borderTopWidth: 1, borderTopColor: Theme.colors.border, backgroundColor: '#FFFFFF' },
  playerHeader: { height: 68, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: Theme.colors.border, backgroundColor: '#FFFFFF' },
  progress: { flex: 1, height: 12, borderRadius: 6, backgroundColor: '#DFE7EB', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 6, backgroundColor: Theme.colors.green },
  heart: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  heartText: { color: Theme.colors.coralDark, fontWeight: '900' },
  content: { padding: 20, paddingBottom: 40, maxWidth: 660, width: '100%', alignSelf: 'center' },
  counter: { color: Theme.colors.blueDark, fontSize: 11, fontWeight: '900' },
  prompt: { color: Theme.colors.ink, fontSize: 23, lineHeight: 30, fontWeight: '900', marginTop: 7, marginBottom: 12 },
  instruction: { color: Theme.colors.muted, lineHeight: 20, marginBottom: 14 },
  feedback: { padding: 14, gap: 12, borderTopWidth: 1 },
  feedbackCorrect: { backgroundColor: '#E5F8E8', borderTopColor: '#B8EAC0' },
  feedbackWrong: { backgroundColor: '#FFF0EF', borderTopColor: '#FFD0CD' },
  feedbackCopy: { flexDirection: 'row', gap: 10, alignItems: 'center', maxWidth: 660, width: '100%', alignSelf: 'center' },
  feedbackText: { flex: 1 },
  feedbackTitle: { fontSize: 17, fontWeight: '900' },
  feedbackMeta: { color: Theme.colors.muted, fontSize: 12, marginTop: 2 },
  error: { color: Theme.colors.coralDark, fontWeight: '700', textAlign: 'center', marginTop: 16 },
});
