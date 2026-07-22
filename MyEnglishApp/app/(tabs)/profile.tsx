import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Theme } from '@/constants/Theme';
import { useLearning } from '@/context/LearningContext';
import { curriculumService } from '@/services/curriculumService';

export default function ProfileScreen() {
  const router = useRouter();
  const { state } = useLearning();
  const [completed, setCompleted] = useState(0);
  const [total, setTotal] = useState(0);
  const [stars, setStars] = useState(0);
  const level = Math.floor(state.xp / 100) + 1;

  useFocusEffect(useCallback(() => {
    curriculumService.getSelectedPath().then((path) => {
      const lessons = path.units.flatMap((unit) => unit.lessons);
      setTotal(lessons.length);
      setCompleted(lessons.filter((lesson) => lesson.progressStatus === 'COMPLETED').length);
      setStars(lessons.reduce((sum, lesson) => sum + lesson.stars, 0));
    }).catch(() => undefined);
  }, []));


  return <SafeAreaView style={styles.safe} edges={['top']}><ScrollView contentContainerStyle={styles.content}>
    <View style={styles.profileHeader}>
      <View style={styles.avatar}><MaterialCommunityIcons name="account" size={56} color={Theme.colors.blueDark} /></View>
      <Text style={styles.name}>English Explorer</Text>
      <Text style={styles.level}>Cấp độ {level}</Text>
      <View style={styles.levelTrack}><View style={[styles.levelFill, { width: `${state.xp % 100}%` }]} /></View>
      <Text style={styles.levelCaption}>{state.xp % 100}/100 XP đến cấp tiếp theo</Text>
    </View>
    <Text style={styles.sectionTitle}>Thành tích của bé</Text>
    <View style={styles.grid}>
      <Stat icon="fire" value={`${state.streak} ngày`} label="Chuỗi học" color={Theme.colors.coral} />
      <Stat icon="star-four-points" value={`${state.xp} XP`} label="Điểm trên thiết bị" color={Theme.colors.yellowDark} />
      <Stat icon="check-decagram" value={`${completed}/${total || 10}`} label="Bài đã học" color={Theme.colors.greenDark} />
      <Stat icon="star" value={String(stars)} label="Sao đạt được" color={Theme.colors.violet} />
    </View>
    <Text style={styles.sectionTitle}>Khám phá</Text>
    <Pressable style={styles.mission} onPress={() => router.push('/(learner)/photo-mission')}>
      <View style={styles.missionIcon}><MaterialCommunityIcons name="camera-iris" size={30} color={Theme.colors.violet} /></View>
      <View style={styles.missionCopy}><Text style={styles.missionTitle}>Photo Mission</Text><Text style={styles.missionText}>Chụp hoặc chọn ảnh để tạo caption tiếng Anh</Text></View>
      <MaterialCommunityIcons name="chevron-right" size={25} color={Theme.colors.muted} />
    </Pressable>
  </ScrollView></SafeAreaView>;
}

function Stat({ icon, value, label, color }: { icon: string; value: string; label: string; color: string }) {
  return <View style={styles.stat}><MaterialCommunityIcons name={icon as never} size={27} color={color} /><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.background },
  content: { padding: 18, paddingBottom: 45, maxWidth: 680, width: '100%', alignSelf: 'center' },
  profileHeader: { alignItems: 'center', paddingVertical: 18 },
  avatar: { width: 104, height: 104, borderRadius: 52, backgroundColor: '#EAF7FE', borderWidth: 4, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', ...Theme.shadow },
  name: { color: Theme.colors.ink, fontSize: 24, fontWeight: '900', marginTop: 14 },
  level: { color: Theme.colors.blueDark, fontWeight: '800', marginTop: 3 },
  levelTrack: { width: '75%', maxWidth: 330, height: 10, borderRadius: 5, backgroundColor: '#DFE7EB', overflow: 'hidden', marginTop: 13 },
  levelFill: { height: '100%', backgroundColor: Theme.colors.blue },
  levelCaption: { color: Theme.colors.muted, fontSize: 11, fontWeight: '700', marginTop: 4 },
  sectionTitle: { color: Theme.colors.ink, fontSize: 17, fontWeight: '900', marginTop: 20, marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  stat: { width: '48%', flexGrow: 1, minHeight: 112, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 8, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  statValue: { color: Theme.colors.ink, fontSize: 18, fontWeight: '900', marginTop: 5 },
  statLabel: { color: Theme.colors.muted, fontSize: 11, fontWeight: '700', marginTop: 2 },
  mission: { minHeight: 88, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#DED8FA', borderBottomWidth: 3, borderRadius: 8, backgroundColor: '#F7F5FF', padding: 12 },
  missionIcon: { width: 52, height: 52, borderRadius: 8, backgroundColor: '#EAE6FF', alignItems: 'center', justifyContent: 'center' },
  missionCopy: { flex: 1 },
  missionTitle: { color: Theme.colors.ink, fontWeight: '900', fontSize: 16 },
  missionText: { color: Theme.colors.muted, fontSize: 12, marginTop: 3 },
});
