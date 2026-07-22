import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Theme } from '@/constants/Theme';
import { curriculumService } from '@/services/curriculumService';
import type { BackendLessonSummary, BackendLevelCode } from '@/types/backendCurriculum';

export default function ReviewScreen() {
  const router = useRouter();
  const [lessons, setLessons] = useState<BackendLessonSummary[]>([]);
  const [level, setLevel] = useState<BackendLevelCode>('PRE_A1_STARTERS');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useFocusEffect(useCallback(() => {
    setLoading(true);
    curriculumService.getSelectedPath()
      .then((path) => {
        setLevel(path.level);
        setLessons(path.units.flatMap((unit) => unit.lessons).filter((lesson) => lesson.progressStatus !== 'AVAILABLE'));
        setError('');
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'Không tải được danh sách ôn tập.'))
      .finally(() => setLoading(false));
  }, []));

  return <SafeAreaView style={styles.safe} edges={['top']}>
    <View style={styles.header}><Text style={styles.eyebrow}>PRE A1 STARTERS</Text><Text style={styles.title}>Ôn tập</Text></View>
    {loading ? <View style={styles.center}><ActivityIndicator size="large" color={Theme.colors.green} /></View> : <ScrollView contentContainerStyle={styles.content}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable style={styles.primaryButton} onPress={() => router.push('/(learner)/review-session')}>
        <MaterialCommunityIcons name="brain" size={24} color="#FFFFFF" />
        <Text style={styles.primaryText}>Ôn tập tổng hợp</Text>
      </Pressable>
      <View style={{ height: 1, backgroundColor: Theme.colors.border, marginVertical: 10 }} />

      {!error && lessons.length === 0 ? <View style={styles.empty}>
        <View style={styles.emptyIcon}><MaterialCommunityIcons name="brain" size={48} color={Theme.colors.violet} /></View>
        <Text style={styles.emptyTitle}>Chưa có bài cần ôn</Text>
        <Text style={styles.emptyText}>Hoàn thành bài học đầu tiên để bắt đầu luyện lại.</Text>
        <Pressable style={styles.primaryButton} onPress={() => router.replace('/(tabs)')}><MaterialCommunityIcons name="map-marker-path" size={20} color="#FFFFFF" /><Text style={styles.primaryText}>Đến lộ trình học</Text></Pressable>
      </View> : null}
      {lessons.map((lesson) => <Pressable key={lesson.id} onPress={() => router.push({ pathname: '/(learner)/lesson/[lessonId]', params: { lessonId: String(lesson.id), level } })} style={styles.lesson}>
        <View style={[styles.lessonIcon, lesson.progressStatus === 'COMPLETED' ? styles.completedIcon : styles.progressIcon]}>
          <MaterialCommunityIcons name={lesson.progressStatus === 'COMPLETED' ? 'check-bold' : 'book-open-page-variant'} size={24} color={lesson.progressStatus === 'COMPLETED' ? Theme.colors.greenDark : Theme.colors.blueDark} />
        </View>
        <View style={styles.lessonCopy}><Text style={styles.lessonTitle}>{lesson.title}</Text><Text style={styles.lessonMeta}>{lesson.activityCount} hoạt động · Điểm cao nhất {lesson.bestScore}%</Text></View>
        <View style={styles.stars}>{[1, 2, 3].map((star) => <MaterialCommunityIcons key={star} name="star" size={17} color={star <= lesson.stars ? Theme.colors.yellow : '#D9E1E5'} />)}</View>
        <MaterialCommunityIcons name="chevron-right" size={24} color={Theme.colors.muted} />
      </Pressable>)}
    </ScrollView>}
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.background },
  header: { minHeight: 84, paddingHorizontal: 20, justifyContent: 'center', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  eyebrow: { color: Theme.colors.violet, fontSize: 11, fontWeight: '900' },
  title: { color: Theme.colors.ink, fontSize: 24, fontWeight: '900', marginTop: 2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16, paddingBottom: 42, maxWidth: 680, width: '100%', alignSelf: 'center', gap: 10 },
  empty: { minHeight: 360, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyIcon: { width: 92, height: 92, borderRadius: 46, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EEEAFE' },
  emptyTitle: { color: Theme.colors.ink, fontSize: 21, fontWeight: '900', marginTop: 18 },
  emptyText: { color: Theme.colors.muted, textAlign: 'center', lineHeight: 20, marginTop: 6 },
  primaryButton: { minHeight: 48, marginTop: 20, paddingHorizontal: 18, borderRadius: 8, flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: Theme.colors.greenDark },
  primaryText: { color: '#FFFFFF', fontWeight: '900' },
  lesson: { minHeight: 78, padding: 11, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderBottomWidth: 3, borderColor: Theme.colors.border, borderRadius: 8, backgroundColor: '#FFFFFF' },
  lessonIcon: { width: 48, height: 48, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  completedIcon: { backgroundColor: '#E6F8E9' },
  progressIcon: { backgroundColor: '#EAF7FE' },
  lessonCopy: { flex: 1 },
  lessonTitle: { color: Theme.colors.ink, fontSize: 16, fontWeight: '900' },
  lessonMeta: { color: Theme.colors.muted, fontSize: 11, marginTop: 4 },
  stars: { flexDirection: 'row' },
  error: { color: Theme.colors.coralDark, fontWeight: '700', textAlign: 'center', marginTop: 30 },
});
