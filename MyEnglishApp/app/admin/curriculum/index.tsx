import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Theme } from '@/constants/Theme';
import { curriculumService } from '@/services/curriculumService';
import type { BackendLearningPath } from '@/types/backendCurriculum';

export default function CurriculumScreen() {
  const router = useRouter();
  const [path, setPath] = useState<BackendLearningPath>();
  const [error, setError] = useState('');

  useEffect(() => {
    curriculumService.getSelectedPath().then(setPath)
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'Không tải được chương trình học.'));
  }, []);

  if (!path && !error) return <View style={styles.center}><ActivityIndicator size="large" color={Theme.colors.green} /></View>;

  return <ScrollView contentContainerStyle={styles.content}>
    <View style={styles.heading}>
      <View><Text style={styles.eyebrow}>PRE A1 STARTERS</Text><Text style={styles.title}>Chương trình học</Text><Text style={styles.subtitle}>{path?.versionCode ?? 'Backend curriculum'}</Text></View>
      <Pressable style={styles.preview} onPress={() => router.push('/(tabs)')}><MaterialCommunityIcons name="eye" size={20} color="#FFFFFF" /><Text style={styles.previewText}>Xem lộ trình</Text></Pressable>
    </View>
    {error ? <Text style={styles.error}>{error}</Text> : null}
    {path?.units.map((unit, unitIndex) => <View key={unit.id} style={styles.unit}>
      <View style={styles.unitHeader}>
        <View style={styles.number}><Text style={styles.numberText}>{unitIndex + 1}</Text></View>
        <View style={styles.unitCopy}><Text style={styles.unitTitle}>{unit.title}</Text><Text style={styles.unitSubtitle}>{unit.description}</Text></View>
        <Text style={styles.unitCount}>{unit.lessons.length} lesson</Text>
      </View>
      {unit.lessons.map((lesson, lessonIndex) => <View key={lesson.id} style={styles.lesson}>
        <View style={styles.order}><Text style={styles.orderText}>{lessonIndex + 1}</Text></View>
        <MaterialCommunityIcons name={lesson.unlocked ? 'book-open-page-variant' : 'lock'} size={23} color={lesson.unlocked ? Theme.colors.greenDark : Theme.colors.muted} />
        <View style={styles.lessonCopy}><Text style={styles.lessonTitle}>{lesson.title}</Text><Text style={styles.lessonObjective}>{lesson.objective}</Text></View>
        <View style={styles.activityCount}><MaterialCommunityIcons name="cards-outline" size={17} color={Theme.colors.muted} /><Text style={styles.activityCountText}>{lesson.activityCount}</Text></View>
        <Pressable disabled={!lesson.unlocked} accessibilityLabel={lesson.unlocked ? `Mở ${lesson.title}` : `${lesson.title} đang khóa`} onPress={() => router.push({ pathname: '/(learner)/lesson/[lessonId]', params: { lessonId: String(lesson.id), level: path.level } })} style={[styles.iconButton, !lesson.unlocked && styles.iconButtonDisabled]}><MaterialCommunityIcons name={lesson.unlocked ? 'play' : 'lock'} size={20} color={lesson.unlocked ? Theme.colors.blueDark : Theme.colors.muted} /></Pressable>
      </View>)}
    </View>)}
  </ScrollView>;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 24, paddingBottom: 48, maxWidth: 1000, width: '100%', alignSelf: 'center' },
  heading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12, marginBottom: 22 },
  eyebrow: { color: Theme.colors.greenDark, fontSize: 11, fontWeight: '900' },
  title: { color: Theme.colors.ink, fontSize: 29, fontWeight: '900', marginTop: 3 },
  subtitle: { color: Theme.colors.muted, marginTop: 3 },
  preview: { height: 44, borderRadius: 7, backgroundColor: Theme.colors.greenDark, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 15 },
  previewText: { color: '#FFFFFF', fontWeight: '900' },
  error: { color: Theme.colors.coralDark, fontWeight: '700', textAlign: 'center' },
  unit: { marginBottom: 16, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 8, backgroundColor: '#FFFFFF', overflow: 'hidden' },
  unitHeader: { minHeight: 78, borderLeftWidth: 6, borderLeftColor: Theme.colors.green, backgroundColor: '#F8FAFB', padding: 13, flexDirection: 'row', alignItems: 'center', gap: 11 },
  number: { width: 42, height: 42, borderRadius: 8, backgroundColor: '#E6F8E9', alignItems: 'center', justifyContent: 'center' },
  numberText: { color: Theme.colors.greenDark, fontWeight: '900', fontSize: 18 },
  unitCopy: { flex: 1 },
  unitTitle: { color: Theme.colors.ink, fontWeight: '900', fontSize: 18 },
  unitSubtitle: { color: Theme.colors.muted, fontSize: 12, marginTop: 2 },
  unitCount: { color: Theme.colors.muted, fontWeight: '800', fontSize: 11 },
  lesson: { minHeight: 74, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10, borderTopWidth: 1, borderTopColor: Theme.colors.border },
  order: { width: 26, height: 26, borderRadius: 6, backgroundColor: '#EDF2F5', alignItems: 'center', justifyContent: 'center' },
  orderText: { color: Theme.colors.muted, fontWeight: '900', fontSize: 11 },
  lessonCopy: { flex: 1 },
  lessonTitle: { color: Theme.colors.ink, fontWeight: '900' },
  lessonObjective: { color: Theme.colors.muted, fontSize: 11, marginTop: 2 },
  activityCount: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  activityCountText: { color: Theme.colors.muted, fontWeight: '800' },
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 7, backgroundColor: '#EAF7FE' },
  iconButtonDisabled: { backgroundColor: '#EDF1F3' },
});
