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

export function BackendReviewScreen() {
  const router = useRouter();
  const { completeLesson } = useLearning();
  const [session, setSession] = useState<BackendLessonSession>();
  const [feedback, setFeedback] = useState<BackendAttemptResult>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const activity = useMemo(() => session?.activities[session.currentActivityIndex], [session]);

  const start = async () => {
    setBusy(true);
    setError('');
    try {
      setSession(await curriculumService.startReviewSession());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không thể bắt đầu ôn tập.');
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
        },
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không thể hoàn tất bài học.');
    } finally {
      setBusy(false);
    }
  };

  if (!session && !error) {
    return <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.intro}>
        <View style={styles.header}><MaterialCommunityIcons name="close" size={28} color={Theme.colors.muted} onPress={() => router.back()} /></View>
        <MaterialCommunityIcons name="brain" size={100} color={Theme.colors.violet} style={{ marginVertical: 32 }} />
        <Text style={styles.introTitle}>Ôn tập tổng hợp</Text>
        <Text style={styles.introDescription}>Làm mới trí nhớ với các từ vựng bạn đã học và thẻ bài ảnh đã lưu.</Text>
        <View style={styles.spacer} />
        <ActionButton label="Bắt đầu" onPress={start} disabled={busy} />
      </ScrollView>
    </SafeAreaView>;
  }
  if (!session && error) {
      return <SafeAreaView style={styles.safe}><View style={styles.intro}><Text style={styles.error}>{error}</Text></View></SafeAreaView>;
  }



  if (session?.status === 'COMPLETED' || session?.status === 'ABANDONED') {
    return <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.intro}>
        {session.status === 'COMPLETED' ? <MaterialCommunityIcons name="check-circle" size={100} color={Theme.colors.green} style={{ marginVertical: 32 }} /> : <MaterialCommunityIcons name="heart-broken" size={100} color={Theme.colors.coral} style={{ marginVertical: 32 }} />}
        <Text style={styles.introTitle}>{session.status === 'COMPLETED' ? 'Tuyệt vời!' : 'Hết tim mất rồi'}</Text>
        <Text style={styles.introDescription}>{session.status === 'COMPLETED' ? 'Bạn đã hoàn thành bài ôn tập tổng hợp.' : 'Bạn đã trả lời sai quá nhiều câu. Hãy làm lại nhé.'}</Text>
        <View style={styles.metaRow}>
          <Meta icon="star-four-points" value={`${session.xpEarned} XP`} />
          <Meta icon="target" value={`${Math.round(session.correctAttempts / Math.max(1, session.totalAttempts) * 100)}%`} />
        </View>
        <View style={styles.spacer} />
        <ActionButton label="Tiếp tục" onPress={() => {
          if (session.status === 'COMPLETED') {
             completeLesson({ lessonId: 'review', correct: session.correctAttempts, total: session.totalAttempts, xpEarned: session.xpEarned, stars: 3, completedAt: new Date().toISOString(), mistakes: [] });
          }
          router.back();
        }} />
      </ScrollView>
    </SafeAreaView>;
  }

  if (!activity && !feedback) {
    return <SafeAreaView style={styles.safe}><View style={styles.intro}><Text style={styles.error}>Phiên học không có hoạt động tiếp theo.</Text></View></SafeAreaView>;
  }

  if (!session) return null;
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
  header: { alignSelf: 'flex-start' },
  introTitle: { color: Theme.colors.ink, fontSize: 24, fontWeight: '900', textAlign: 'center', marginBottom: 12 },
  introDescription: { color: Theme.colors.muted, fontSize: 16, lineHeight: 24, textAlign: 'center' },
  spacer: { flex: 1, minHeight: 40 },
});
