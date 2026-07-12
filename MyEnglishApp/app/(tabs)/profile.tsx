import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Theme } from '@/constants/Theme';
import { useLearning } from '@/context/LearningContext';
import { allLessons } from '@/data/curriculum';

export default function ProfileScreen() {
  const router = useRouter();
  const { state, resetProgress } = useLearning();
  const level = Math.floor(state.xp / 100) + 1;
  const nextLevelXp = level * 100;

  return <SafeAreaView style={styles.safe} edges={['top']}><ScrollView contentContainerStyle={styles.content}>
    <View style={styles.profileHeader}><View style={styles.avatar}><MaterialCommunityIcons name="account" size={56} color={Theme.colors.blueDark} /></View><Text style={styles.name}>English Explorer</Text><Text style={styles.level}>Cap do {level}</Text><View style={styles.levelTrack}><View style={[styles.levelFill, { width: `${((state.xp % 100) / 100) * 100}%` }]} /></View><Text style={styles.levelCaption}>{state.xp}/{nextLevelXp} XP</Text></View>
    <Text style={styles.sectionTitle}>Thanh tich cua be</Text>
    <View style={styles.grid}><Stat icon="fire" value={`${state.streak} ngay`} label="Chuoi hoc" color={Theme.colors.coral} /><Stat icon="star-four-points" value={`${state.xp} XP`} label="Tong diem" color={Theme.colors.yellowDark} /><Stat icon="check-decagram" value={`${state.completedLessonIds.length}/${allLessons.length}`} label="Bai da hoc" color={Theme.colors.greenDark} /><Stat icon="camera" value={String(state.captionCount)} label="Photo mission" color={Theme.colors.violet} /></View>
    <Text style={styles.sectionTitle}>Kham pha</Text>
    <Pressable style={styles.mission} onPress={() => router.push('/(learner)/photo-mission')}><View style={styles.missionIcon}><MaterialCommunityIcons name="camera-iris" size={30} color={Theme.colors.violet} /></View><View style={{ flex: 1 }}><Text style={styles.missionTitle}>Photo Mission</Text><Text style={styles.missionText}>Chup do vat va tao caption tieng Anh</Text></View><MaterialCommunityIcons name="chevron-right" size={25} color={Theme.colors.muted} /></Pressable>
    <Pressable onPress={() => Alert.alert('Dat lai tien do?', 'Tat ca XP va bai da hoc tren thiet bi se bi xoa.', [{ text: 'Huy', style: 'cancel' }, { text: 'Dat lai', style: 'destructive', onPress: resetProgress }])} style={styles.reset}><MaterialCommunityIcons name="restart" size={20} color={Theme.colors.coralDark} /><Text style={styles.resetText}>Dat lai tien do thu nghiem</Text></Pressable>
  </ScrollView></SafeAreaView>;
}

function Stat({ icon, value, label, color }: { icon: string; value: string; label: string; color: string }) { return <View style={styles.stat}><MaterialCommunityIcons name={icon as never} size={27} color={color} /><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>; }

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.background }, content: { padding: 18, paddingBottom: 45, maxWidth: 680, width: '100%', alignSelf: 'center' },
  profileHeader: { alignItems: 'center', paddingVertical: 18 }, avatar: { width: 104, height: 104, borderRadius: 52, backgroundColor: '#EAF7FE', borderWidth: 4, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', ...Theme.shadow }, name: { color: Theme.colors.ink, fontSize: 24, fontWeight: '900', marginTop: 14 }, level: { color: Theme.colors.blueDark, fontWeight: '800', marginTop: 3 }, levelTrack: { width: '75%', maxWidth: 330, height: 10, borderRadius: 5, backgroundColor: '#DFE7EB', overflow: 'hidden', marginTop: 13 }, levelFill: { height: '100%', backgroundColor: Theme.colors.blue }, levelCaption: { color: Theme.colors.muted, fontSize: 11, fontWeight: '700', marginTop: 4 },
  sectionTitle: { color: Theme.colors.ink, fontSize: 17, fontWeight: '900', marginTop: 20, marginBottom: 10 }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 }, stat: { width: '48%', flexGrow: 1, minHeight: 112, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 8, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }, statValue: { color: Theme.colors.ink, fontSize: 18, fontWeight: '900', marginTop: 5 }, statLabel: { color: Theme.colors.muted, fontSize: 11, fontWeight: '700', marginTop: 2 },
  mission: { minHeight: 78, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#DED8FA', borderBottomWidth: 3, borderRadius: 8, backgroundColor: '#F7F5FF', padding: 12 }, missionIcon: { width: 52, height: 52, borderRadius: 8, backgroundColor: '#EAE6FF', alignItems: 'center', justifyContent: 'center' }, missionTitle: { color: Theme.colors.ink, fontWeight: '900', fontSize: 16 }, missionText: { color: Theme.colors.muted, fontSize: 12, marginTop: 3 },
  reset: { marginTop: 34, minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }, resetText: { color: Theme.colors.coralDark, fontWeight: '800' },
});
