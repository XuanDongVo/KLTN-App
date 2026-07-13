import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionButton } from '@/components/ui/ActionButton';
import { Theme } from '@/constants/Theme';
import { allLessons } from '@/data/curriculum';

export default function LessonCompleteScreen() {
  const params = useLocalSearchParams<{ lessonId: string; correct: string; total: string; stars: string; xp: string }>();
  const router = useRouter();
  const index = allLessons.findIndex((lesson) => lesson.id === params.lessonId);
  const nextLesson = allLessons[index + 1];
  const accuracy = Math.round((Number(params.correct) / Math.max(1, Number(params.total))) * 100);

  return <SafeAreaView style={styles.safe}>
    <View style={styles.content}>
      <View style={styles.badge}><MaterialCommunityIcons name="trophy" size={70} color={Theme.colors.yellowDark} /></View>
      <Text style={styles.eyebrow}>HOÀN THÀNH BÀI HỌC</Text><Text style={styles.title}>Tuyệt vời!</Text><Text style={styles.subtitle}>Mỗi bước nhỏ đều giúp tiếng Anh của bé tốt hơn.</Text>
      <View style={styles.stars}>{[1, 2, 3].map((star) => <MaterialCommunityIcons key={star} name="star" size={44} color={star <= Number(params.stars) ? Theme.colors.yellow : '#DCE4E8'} />)}</View>
      <View style={styles.stats}><Stat icon="star-four-points" label="Kinh nghiệm" value={`+${params.xp} XP`} color={Theme.colors.yellowDark} /><Stat icon="bullseye-arrow" label="Chính xác" value={`${accuracy}%`} color={Theme.colors.blueDark} /><Stat icon="check-decagram" label="Trả lời đúng" value={`${params.correct}/${params.total}`} color={Theme.colors.greenDark} /></View>
    </View>
    <View style={styles.actions}>{Number(params.correct) < Number(params.total) && <ActionButton label="Ôn lại lỗi sai" icon="brain" outline onPress={() => router.replace('/(tabs)/review')} />}<ActionButton label={nextLesson ? 'Bài học tiếp theo' : 'Về lộ trình học'} icon="arrow-right" onPress={() => nextLesson ? router.replace({ pathname: '/(learner)/lesson/[lessonId]', params: { lessonId: nextLesson.id } }) : router.replace('/(tabs)')} /></View>
  </SafeAreaView>;
}

function Stat({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) { return <View style={styles.stat}><MaterialCommunityIcons name={icon as never} size={26} color={color} /><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>; }

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.background }, content: { flex: 1, padding: 22, alignItems: 'center', justifyContent: 'center' },
  badge: { width: 132, height: 132, borderRadius: 66, backgroundColor: '#FFF5D6', alignItems: 'center', justifyContent: 'center' }, eyebrow: { color: Theme.colors.greenDark, fontWeight: '900', fontSize: 11, marginTop: 20 },
  title: { color: Theme.colors.ink, fontSize: 34, fontWeight: '900', marginTop: 3 }, subtitle: { color: Theme.colors.muted, textAlign: 'center', lineHeight: 21, marginTop: 5, maxWidth: 380 }, stars: { flexDirection: 'row', marginTop: 17 },
  stats: { flexDirection: 'row', width: '100%', maxWidth: 560, gap: 8, marginTop: 24 }, stat: { flex: 1, minHeight: 110, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 8, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', padding: 8 }, statValue: { color: Theme.colors.ink, fontWeight: '900', fontSize: 17, marginTop: 6 }, statLabel: { color: Theme.colors.muted, fontWeight: '700', fontSize: 10, textAlign: 'center', marginTop: 2 },
  actions: { padding: 16, gap: 9, borderTopWidth: 1, borderTopColor: Theme.colors.border, backgroundColor: '#FFFFFF' },
});
