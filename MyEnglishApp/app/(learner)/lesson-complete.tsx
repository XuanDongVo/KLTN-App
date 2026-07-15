import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionButton } from '@/components/ui/ActionButton';
import { Theme } from '@/constants/Theme';

export default function LessonCompleteScreen() {
  const params = useLocalSearchParams<{ lessonId: string; correct: string; total: string; stars: string; xp: string; level?: string }>();
  const router = useRouter();
  const correct = Number(params.correct || 0);
  const total = Number(params.total || 1);
  const stars = Number(params.stars || 1);
  const xp = Number(params.xp || 0);

  return <SafeAreaView style={styles.safe}>
    <View style={styles.content}>
      <View style={styles.badge}><MaterialCommunityIcons name="trophy" size={66} color={Theme.colors.yellowDark} /></View>
      <Text style={styles.eyebrow}>HOÀN THÀNH BÀI HỌC</Text>
      <Text style={styles.title}>Tuyệt lắm!</Text>
      <Text style={styles.subtitle}>Một bài mới trong lộ trình đã được mở khóa.</Text>
      <View style={styles.stars}>{[1, 2, 3].map((value) => <MaterialCommunityIcons key={value} name="star" size={42} color={value <= stars ? Theme.colors.yellow : '#DDE4E8'} />)}</View>
      <View style={styles.stats}>
        <View style={styles.stat}><MaterialCommunityIcons name="check-circle" size={24} color={Theme.colors.greenDark} /><Text style={styles.statValue}>{correct}/{total}</Text><Text style={styles.statLabel}>Chính xác</Text></View>
        <View style={styles.stat}><MaterialCommunityIcons name="star-four-points" size={24} color={Theme.colors.violet} /><Text style={styles.statValue}>+{xp}</Text><Text style={styles.statLabel}>XP nhận được</Text></View>
      </View>
    </View>
    <View style={styles.bottom}>
      <ActionButton label="Tiếp tục lộ trình" icon="map-marker-path" onPress={() => router.replace('/(tabs)')} />
      <ActionButton label="Học lại bài này" outline icon="refresh" onPress={() => router.replace({ pathname: '/(learner)/lesson/[lessonId]', params: { lessonId: params.lessonId, level: params.level ?? 'PRE_A1_STARTERS' } })} />
    </View>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.background },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  badge: { width: 126, height: 126, borderRadius: 63, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF5CE', borderWidth: 7, borderColor: '#FFFFFF', ...Theme.shadow },
  eyebrow: { color: Theme.colors.greenDark, fontSize: 11, fontWeight: '900', marginTop: 24 },
  title: { color: Theme.colors.ink, fontSize: 32, fontWeight: '900', marginTop: 4 },
  subtitle: { color: Theme.colors.muted, textAlign: 'center', lineHeight: 21, marginTop: 7 },
  stars: { flexDirection: 'row', gap: 4, marginTop: 18 },
  stats: { width: '100%', maxWidth: 420, flexDirection: 'row', gap: 10, marginTop: 24 },
  stat: { flex: 1, minHeight: 108, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 8, backgroundColor: '#FFFFFF' },
  statValue: { color: Theme.colors.ink, fontSize: 20, fontWeight: '900', marginTop: 4 },
  statLabel: { color: Theme.colors.muted, fontSize: 11, fontWeight: '700', marginTop: 2 },
  bottom: { padding: 16, gap: 10, borderTopWidth: 1, borderTopColor: Theme.colors.border, backgroundColor: '#FFFFFF' },
});
