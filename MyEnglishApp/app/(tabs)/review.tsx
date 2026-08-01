import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Theme } from '@/constants/Theme';
import { curriculumService } from '@/services/curriculumService';
import type { BackendLessonSummary, BackendLevelCode } from '@/types/backendCurriculum';
import { styles } from '@/styles/(tabs)/review.styles';

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
