import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Theme } from '@/constants/Theme';
import { curriculum } from '@/data/curriculum';

export default function CurriculumScreen() {
  const router = useRouter();
  return <ScrollView contentContainerStyle={styles.content}>
    <View style={styles.heading}><View><Text style={styles.eyebrow}>FUN ENGLISH PATH</Text><Text style={styles.title}>Chuong trinh hoc</Text><Text style={styles.subtitle}>Course - Unit - Lesson - Activity</Text></View><Pressable style={styles.preview} onPress={() => router.push('/(tabs)')}><MaterialCommunityIcons name="eye" size={20} color="#FFFFFF" /><Text style={styles.previewText}>Preview</Text></Pressable></View>
    {curriculum.map((unit, unitIndex) => <View key={unit.id} style={styles.unit}>
      <View style={[styles.unitHeader, { borderLeftColor: unit.color }]}><View style={[styles.number, { backgroundColor: `${unit.color}22` }]}><Text style={[styles.numberText, { color: unit.accent }]}>{unitIndex + 1}</Text></View><View style={{ flex: 1 }}><Text style={styles.unitTitle}>{unit.title}</Text><Text style={styles.unitSubtitle}>{unit.subtitle}</Text></View><Text style={styles.unitCount}>{unit.lessons.length} lesson</Text></View>
      {unit.lessons.map((lesson, lessonIndex) => <View key={lesson.id} style={styles.lesson}><View style={styles.order}><Text style={styles.orderText}>{lessonIndex + 1}</Text></View><MaterialCommunityIcons name={lesson.icon as never} size={23} color={lesson.color} /><View style={{ flex: 1 }}><Text style={styles.lessonTitle}>{lesson.title}</Text><Text style={styles.lessonObjective}>{lesson.objective}</Text></View><View style={styles.activityCount}><MaterialCommunityIcons name="cards-outline" size={17} color={Theme.colors.muted} /><Text style={styles.activityCountText}>{lesson.activities.length}</Text></View><Pressable onPress={() => router.push({ pathname: '/(learner)/lesson/[lessonId]', params: { lessonId: lesson.id } })} style={styles.iconButton}><MaterialCommunityIcons name="play" size={20} color={Theme.colors.blueDark} /></Pressable></View>)}
    </View>)}
  </ScrollView>;
}

const styles = StyleSheet.create({
  content: { padding: 24, paddingBottom: 48, maxWidth: 1000, width: '100%', alignSelf: 'center' }, heading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12, marginBottom: 22 }, eyebrow: { color: Theme.colors.greenDark, fontSize: 11, fontWeight: '900' }, title: { color: Theme.colors.ink, fontSize: 29, fontWeight: '900', marginTop: 3 }, subtitle: { color: Theme.colors.muted, marginTop: 3 }, preview: { height: 44, borderRadius: 7, backgroundColor: Theme.colors.greenDark, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 15 }, previewText: { color: '#FFFFFF', fontWeight: '900' },
  unit: { marginBottom: 16, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 8, backgroundColor: '#FFFFFF', overflow: 'hidden' }, unitHeader: { minHeight: 78, borderLeftWidth: 6, backgroundColor: '#F8FAFB', padding: 13, flexDirection: 'row', alignItems: 'center', gap: 11 }, number: { width: 42, height: 42, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }, numberText: { fontWeight: '900', fontSize: 18 }, unitTitle: { color: Theme.colors.ink, fontWeight: '900', fontSize: 18 }, unitSubtitle: { color: Theme.colors.muted, fontSize: 12, marginTop: 2 }, unitCount: { color: Theme.colors.muted, fontWeight: '800', fontSize: 11 },
  lesson: { minHeight: 70, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10, borderTopWidth: 1, borderTopColor: Theme.colors.border }, order: { width: 26, height: 26, borderRadius: 6, backgroundColor: '#EDF2F5', alignItems: 'center', justifyContent: 'center' }, orderText: { color: Theme.colors.muted, fontWeight: '900', fontSize: 11 }, lessonTitle: { color: Theme.colors.ink, fontWeight: '900' }, lessonObjective: { color: Theme.colors.muted, fontSize: 11, marginTop: 2 }, activityCount: { flexDirection: 'row', alignItems: 'center', gap: 3 }, activityCountText: { color: Theme.colors.muted, fontWeight: '800' }, iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 7, backgroundColor: '#EAF7FE' },
});
