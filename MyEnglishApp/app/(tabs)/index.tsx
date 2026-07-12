import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LessonPathNode } from '@/components/learner/LessonPathNode';
import { StatusStrip } from '@/components/learner/StatusStrip';
import { Theme } from '@/constants/Theme';
import { useLearning } from '@/context/LearningContext';
import { allLessons, curriculum } from '@/data/curriculum';

export default function HomeScreen() {
  const router = useRouter();
  const { state, ready, isLessonUnlocked } = useLearning();
  let globalIndex = -1;
  if (!ready) return <View style={styles.loading}><ActivityIndicator size="large" color={Theme.colors.green} /></View>;

  return <SafeAreaView style={styles.safe} edges={['top']}>
    <View style={styles.header}><View><Text style={styles.eyebrow}>FUN ENGLISH</Text><Text style={styles.greeting}>San sang hoc nao!</Text></View><StatusStrip /></View>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.goalBand}>
        <View style={styles.goalIcon}><MaterialCommunityIcons name="target" size={24} color={Theme.colors.blueDark} /></View>
        <View style={styles.goalCopy}><Text style={styles.goalTitle}>Muc tieu hom nay</Text><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.min(100, (state.dailyXp / state.dailyGoal) * 100)}%` }]} /></View></View>
        <Text style={styles.goalValue}>{state.dailyXp}/{state.dailyGoal} XP</Text>
      </View>
      {curriculum.map((unit) => <View key={unit.id} style={styles.unitSection}>
        <View style={[styles.unitHeader, { backgroundColor: unit.color, borderBottomColor: unit.accent }]}>
          <View style={styles.unitNumber}><Text style={[styles.unitNumberText, { color: unit.accent }]}>{unit.id.split('-')[1]}</Text></View>
          <View style={styles.unitCopy}><Text style={styles.unitTitle}>{unit.title}</Text><Text style={styles.unitSubtitle}>{unit.subtitle}</Text></View>
        </View>
        <View style={styles.path}>{unit.lessons.map((lesson) => {
          globalIndex += 1;
          const unlocked = isLessonUnlocked(lesson.id);
          const completed = state.completedLessonIds.includes(lesson.id);
          const current = unlocked && !completed && (globalIndex === 0 || state.completedLessonIds.includes(allLessons[globalIndex - 1]?.id));
          const side = globalIndex % 4 === 1 ? 'right' : globalIndex % 4 === 3 ? 'left' : 'center';
          return <LessonPathNode key={lesson.id} lesson={lesson} locked={!unlocked} completed={completed} current={current} side={side} stars={state.results[lesson.id]?.stars ?? 0} onPress={() => router.push({ pathname: '/(learner)/lesson/[lessonId]', params: { lessonId: lesson.id } })} />;
        })}</View>
      </View>)}
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.background }, loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { minHeight: 76, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  eyebrow: { color: Theme.colors.greenDark, fontWeight: '900', fontSize: 11 }, greeting: { color: Theme.colors.ink, fontWeight: '900', fontSize: 19, marginTop: 2 },
  content: { padding: 16, paddingBottom: 48, maxWidth: 720, width: '100%', alignSelf: 'center' },
  goalBand: { minHeight: 70, flexDirection: 'row', alignItems: 'center', backgroundColor: '#EAF7FE', borderWidth: 1, borderColor: '#CBEAFA', borderRadius: 8, padding: 12, gap: 10, marginBottom: 18 },
  goalIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }, goalCopy: { flex: 1 },
  goalTitle: { color: Theme.colors.ink, fontWeight: '800', fontSize: 14, marginBottom: 7 }, goalValue: { color: Theme.colors.blueDark, fontWeight: '900', fontSize: 13 },
  progressTrack: { height: 9, borderRadius: 5, backgroundColor: '#C9DFEA', overflow: 'hidden' }, progressFill: { height: '100%', borderRadius: 5, backgroundColor: Theme.colors.blue },
  unitSection: { marginBottom: 18 }, unitHeader: { minHeight: 84, borderRadius: 8, borderBottomWidth: 5, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  unitNumber: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' }, unitNumberText: { fontSize: 22, fontWeight: '900' }, unitCopy: { flex: 1 },
  unitTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' }, unitSubtitle: { color: 'rgba(255,255,255,0.92)', fontSize: 13, fontWeight: '600', marginTop: 3 }, path: { paddingTop: 16, paddingBottom: 2 },
});
