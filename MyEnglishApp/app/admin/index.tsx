import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Theme } from '@/constants/Theme';
import { curriculumService } from '@/services/curriculumService';
import { unitService } from '@/services/unitService';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const [learners, setLearners] = useState<number>();
  const [units, setUnits] = useState(0);
  const [lessons, setLessons] = useState(0);
  const [activities, setActivities] = useState(0);
  const [version, setVersion] = useState('-');

  useEffect(() => {
    unitService.getDashboardStats().then((data) => setLearners(data.data?.totalUsers)).catch(() => undefined);
    curriculumService.getSelectedPath().then((path) => {
      const allLessons = path.units.flatMap((unit) => unit.lessons);
      setUnits(path.units.length);
      setLessons(allLessons.length);
      setActivities(allLessons.reduce((sum, lesson) => sum + lesson.activityCount, 0));
      setVersion(path.versionCode);
    }).catch(() => undefined);
  }, []);

  return <ScrollView contentContainerStyle={styles.content}>
    <View style={styles.heading}>
      <View><Text style={styles.eyebrow}>CURRICULUM OVERVIEW</Text><Text style={styles.title}>Trung tâm nội dung</Text><Text style={styles.subtitle}>Theo dõi gói chương trình đang được backend xuất bản.</Text></View>
      <Pressable style={styles.preview} onPress={() => router.push('/(tabs)')}><MaterialCommunityIcons name="eye" size={20} color="#FFFFFF" /><Text style={styles.previewText}>Xem như học viên</Text></Pressable>
    </View>
    <View style={styles.stats}>
      <Stat icon="flag" label="Unit" value={units} color={Theme.colors.blue} />
      <Stat icon="book-open-variant" label="Lesson" value={lessons} color={Theme.colors.green} />
      <Stat icon="cards" label="Activity" value={activities} color={Theme.colors.yellowDark} />
      <Stat icon="account-group" label="Học viên" value={learners ?? '-'} color={Theme.colors.violet} />
    </View>
    <View style={styles.sectionHeader}>
      <View><Text style={styles.sectionTitle}>Chương trình đang chạy</Text><Text style={styles.sectionSubtitle}>Pre A1 Starters · {version}</Text></View>
      <Pressable onPress={() => router.push('/admin/curriculum')}><Text style={styles.link}>Mở danh sách bài</Text></Pressable>
    </View>
    <View style={styles.courseBand}>
      <View style={styles.courseIcon}><MaterialCommunityIcons name="book-education" size={31} color={Theme.colors.greenDark} /></View>
      <View style={styles.courseCopy}><Text style={styles.courseTitle}>Pre A1 Starters</Text><Text style={styles.courseMeta}>{units} unit · {lessons} lesson · {activities} activity</Text></View>
      <View style={styles.status}><Text style={styles.statusText}>ĐÃ XUẤT BẢN</Text></View>
    </View>
    <View style={styles.notice}><MaterialCommunityIcons name="shield-check" size={23} color={Theme.colors.blueDark} /><View style={styles.noticeCopy}><Text style={styles.noticeTitle}>Image Caption giữ đúng ranh giới dịch vụ</Text><Text style={styles.noticeText}>Ứng dụng chỉ chụp hoặc chọn ảnh và gửi lên backend; model AI được triển khai ở dịch vụ riêng.</Text></View></View>
  </ScrollView>;
}

function Stat({ icon, label, value, color }: { icon: string; label: string; value: number | string; color: string }) {
  return <View style={styles.stat}><View style={[styles.statIcon, { backgroundColor: `${color}1A` }]}><MaterialCommunityIcons name={icon as never} size={24} color={color} /></View><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  content: { padding: 24, paddingBottom: 44, maxWidth: 1120, width: '100%', alignSelf: 'center' },
  heading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' },
  eyebrow: { color: Theme.colors.greenDark, fontSize: 11, fontWeight: '900' },
  title: { color: Theme.colors.ink, fontSize: 29, fontWeight: '900', marginTop: 3 },
  subtitle: { color: Theme.colors.muted, marginTop: 4 },
  preview: { minHeight: 44, borderRadius: 7, backgroundColor: Theme.colors.greenDark, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 15 },
  previewText: { color: '#FFFFFF', fontWeight: '900' },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 24 },
  stat: { minWidth: 150, flex: 1, minHeight: 126, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 8, backgroundColor: '#FFFFFF', padding: 15 },
  statIcon: { width: 44, height: 44, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  statValue: { color: Theme.colors.ink, fontSize: 27, fontWeight: '900', marginTop: 8 },
  statLabel: { color: Theme.colors.muted, fontWeight: '700', fontSize: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 30, marginBottom: 11 },
  sectionTitle: { color: Theme.colors.ink, fontSize: 18, fontWeight: '900' },
  sectionSubtitle: { color: Theme.colors.muted, marginTop: 2 },
  link: { color: Theme.colors.blueDark, fontWeight: '900' },
  courseBand: { minHeight: 104, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 8, backgroundColor: '#FFFFFF', padding: 15, flexDirection: 'row', alignItems: 'center', gap: 13 },
  courseIcon: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#E8F8EA', alignItems: 'center', justifyContent: 'center' },
  courseCopy: { flex: 1 },
  courseTitle: { color: Theme.colors.ink, fontSize: 17, fontWeight: '900' },
  courseMeta: { color: Theme.colors.muted, fontSize: 12, marginTop: 3 },
  status: { backgroundColor: '#E6F8E9', borderRadius: 6, paddingHorizontal: 9, paddingVertical: 7 },
  statusText: { color: Theme.colors.greenDark, fontSize: 9, fontWeight: '900' },
  notice: { marginTop: 16, borderRadius: 8, backgroundColor: '#EAF7FE', borderWidth: 1, borderColor: '#C8E8F8', padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  noticeCopy: { flex: 1 },
  noticeTitle: { color: Theme.colors.ink, fontWeight: '900' },
  noticeText: { color: Theme.colors.muted, fontSize: 12, lineHeight: 17, marginTop: 2 },
});
