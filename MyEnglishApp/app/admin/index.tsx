import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Theme } from '@/constants/Theme';
import { adminCurriculumService } from '@/services/adminCurriculumService';
import { adminOperationsService } from '@/services/adminOperationsService';
import type { AdminLevelOverview } from '@/types/adminCurriculum';
import type { AdminDashboard } from '@/types/adminOperations';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const compact = width < 560;
  const [levels, setLevels] = useState<AdminLevelOverview[]>([]);
  const [dashboard, setDashboard] = useState<AdminDashboard>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([adminCurriculumService.getLevels(), adminOperationsService.getDashboard()])
      .then(([nextLevels, nextDashboard]) => { setLevels(nextLevels); setDashboard(nextDashboard); })
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'Không tải được tổng quan quản trị.'))
      .finally(() => setLoading(false));
  }, []);

  const totals = useMemo(() => levels.reduce((result, level) => {
    const published = level.versions.find((version) => version.status === 'PUBLISHED');
    if (!published) return result;
    return {
      units: result.units + published.unitCount,
      lessons: result.lessons + published.lessonCount,
      activities: result.activities + published.activityCount,
    };
  }, { units: 0, lessons: 0, activities: 0 }), [levels]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={Theme.colors.green} /></View>;

  return <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View style={styles.heading}>
      <View style={styles.headingCopy}><Text style={styles.eyebrow}>CURRICULUM OVERVIEW</Text><Text style={styles.title}>Trung tâm nội dung</Text><Text style={styles.subtitle}>Starters, Movers và Flyers trong cùng một quy trình biên soạn.</Text></View>
      <View style={styles.headingActions}><Pressable style={styles.secondary} onPress={() => router.push('/admin/users')}><MaterialCommunityIcons name="account-group" size={20} color={Theme.colors.ink} /><Text style={styles.secondaryText}>Người học</Text></Pressable><Pressable style={styles.primary} onPress={() => router.push('/admin/curriculum')}><MaterialCommunityIcons name="pencil-ruler" size={20} color="#FFFFFF" /><Text style={styles.primaryText}>Curriculum CMS</Text></Pressable></View>
    </View>

    {error ? <View style={styles.error}><MaterialCommunityIcons name="alert-circle" size={22} color={Theme.colors.coralDark} /><Text style={styles.errorText}>{error}</Text></View> : null}

    <View style={styles.stats}>
      <Stat icon="account-group" label="Tổng người học" value={dashboard?.totalLearners ?? 0} color={Theme.colors.blue} />
      <Stat icon="account-check" label="Đang hoạt động" value={dashboard?.activeLearners ?? 0} color={Theme.colors.green} />
      <Stat icon="account-clock" label="Đăng nhập 7 ngày" value={dashboard?.activeLastSevenDays ?? 0} color={Theme.colors.violet} />
      <Stat icon="account-lock" label="Tài khoản khóa" value={dashboard?.lockedLearners ?? 0} color={Theme.colors.coral} />
      <Stat icon="play-circle" label="Tổng session" value={dashboard?.totalSessions ?? 0} color={Theme.colors.yellowDark} />
      <Stat icon="check-decagram" label="Lesson hoàn thành" value={dashboard?.completedLessons ?? 0} color={Theme.colors.greenDark} />
    </View>

    <View style={styles.curriculumBand}><View><Text style={styles.bandTitle}>Nội dung đang phục vụ</Text><Text style={styles.bandMeta}>{totals.units} unit · {totals.lessons} lesson · {totals.activities} activity</Text></View><Pressable onPress={() => router.push('/admin/media')} style={styles.mediaLink}><MaterialCommunityIcons name="image-multiple" size={19} color={Theme.colors.blueDark} /><Text style={styles.mediaLinkText}>Thư viện ảnh</Text></Pressable></View>

    <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Trạng thái cấp độ</Text><Text style={styles.sectionMeta}>{levels.filter((level) => level.versions.some((version) => version.status === 'DRAFT')).length} bản nháp đang chỉnh</Text></View>
    <View style={styles.levelList}>{levels.map((level) => {
      const published = level.versions.find((version) => version.status === 'PUBLISHED');
      const draft = level.versions.find((version) => version.status === 'DRAFT');
      return <Pressable key={level.code} onPress={() => router.push('/admin/curriculum')} style={[styles.levelRow, compact && styles.levelRowCompact]}>
        <View style={styles.levelMain}>
          <View style={[styles.levelIcon, { backgroundColor: level.code === 'PRE_A1_STARTERS' ? '#E8F8EA' : level.code === 'A1_MOVERS' ? '#EAF7FE' : '#F0EDFF' }]}><MaterialCommunityIcons name={level.code === 'PRE_A1_STARTERS' ? 'sprout' : level.code === 'A1_MOVERS' ? 'map-marker-path' : 'rocket-launch-outline'} size={27} color={level.code === 'PRE_A1_STARTERS' ? Theme.colors.greenDark : level.code === 'A1_MOVERS' ? Theme.colors.blueDark : Theme.colors.violet} /></View>
          <View style={styles.levelCopy}><Text style={styles.levelTitle}>{level.displayName}</Text><Text style={styles.levelMeta}>{published ? `${published.unitCount} unit · ${published.lessonCount} lesson · ${published.activityCount} activity` : 'Chưa có version xuất bản'}</Text></View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={Theme.colors.muted} />
        </View>
        <View style={[styles.versionCopy, compact && styles.versionCopyCompact]}><Text style={styles.versionCode}>{published?.versionCode ?? '-'}</Text>{draft ? <View style={styles.draftBadge}><Text style={styles.draftText}>BẢN NHÁP</Text></View> : <View style={styles.publishedBadge}><Text style={styles.publishedText}>ĐÃ XUẤT BẢN</Text></View>}</View>
      </Pressable>;
    })}</View>

    <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Hoạt động quản trị gần đây</Text><Text style={styles.sectionMeta}>{dashboard?.recentActions.length ?? 0} bản ghi</Text></View>
    <View style={styles.auditList}>{dashboard?.recentActions.length ? dashboard.recentActions.slice(0, 8).map((action) => <View key={action.id} style={styles.auditRow}><View style={styles.auditIcon}><MaterialCommunityIcons name={action.action === 'CURRICULUM_PUBLISHED' ? 'publish' : action.action === 'MEDIA_UPLOAD' ? 'image-plus' : 'account-cog'} size={19} color={Theme.colors.blueDark} /></View><View style={styles.auditCopy}><Text style={styles.auditTitle}>{auditLabel(action.action)}</Text><Text numberOfLines={1} style={styles.auditMeta}>{action.details || action.targetId} · {formatDate(action.createdAt)}</Text></View></View>) : <Text style={styles.emptyAudit}>Chưa có thao tác quản trị được ghi nhận.</Text>}</View>

    <View style={styles.notice}><MaterialCommunityIcons name="shield-lock-outline" size={23} color={Theme.colors.blueDark} /><View style={styles.noticeCopy}><Text style={styles.noticeTitle}>Published luôn bất biến</Text><Text style={styles.noticeText}>Mọi thay đổi được thực hiện trên bản nháp, kiểm tra đầy đủ rồi mới xuất bản.</Text></View></View>
  </ScrollView>;
}

function Stat({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) {
  return <View style={styles.stat}><View style={[styles.statIcon, { backgroundColor: `${color}1A` }]}><MaterialCommunityIcons name={icon as never} size={24} color={color} /></View><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

function auditLabel(action: string) {
  if (action === 'CURRICULUM_PUBLISHED') return 'Đã xuất bản curriculum';
  if (action === 'MEDIA_UPLOAD') return 'Đã tải ảnh lên Cloudinary';
  if (action === 'USER_STATUS_CHANGED') return 'Đã thay đổi trạng thái người học';
  return action;
}

function formatDate(value: string) { return new Date(value).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }); }

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Theme.colors.background },
  content: { padding: 20, paddingBottom: 50, maxWidth: 1120, width: '100%', alignSelf: 'center' },
  heading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' },
  headingCopy: { flex: 1, minWidth: 250 },
  headingActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  eyebrow: { color: Theme.colors.greenDark, fontSize: 11, fontWeight: '900' },
  title: { color: Theme.colors.ink, fontSize: 28, fontWeight: '900', marginTop: 3 },
  subtitle: { color: Theme.colors.muted, marginTop: 4 },
  primary: { minHeight: 48, borderRadius: 7, borderBottomWidth: 4, borderBottomColor: Theme.colors.greenDark, backgroundColor: Theme.colors.green, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 15 },
  primaryText: { color: '#FFFFFF', fontWeight: '900' },
  secondary: { minHeight: 48, borderRadius: 7, borderWidth: 1, borderBottomWidth: 3, borderColor: Theme.colors.border, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 14 },
  secondaryText: { color: Theme.colors.ink, fontWeight: '900' },
  error: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, borderWidth: 1, borderColor: '#FFD0CD', borderRadius: 8, backgroundColor: '#FFF0EF', padding: 11 },
  errorText: { color: Theme.colors.coralDark, fontWeight: '700' },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 24 },
  stat: { minWidth: 160, flex: 1, minHeight: 126, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 8, backgroundColor: '#FFFFFF', padding: 15 },
  statIcon: { width: 44, height: 44, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  statValue: { color: Theme.colors.ink, fontSize: 27, fontWeight: '900', marginTop: 8 },
  statLabel: { color: Theme.colors.muted, fontWeight: '700', fontSize: 12 },
  curriculumBand: { minHeight: 66, marginTop: 12, borderWidth: 1, borderColor: '#CBE8F5', borderRadius: 8, backgroundColor: '#EDF9FE', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: 12 },
  bandTitle: { color: Theme.colors.ink, fontWeight: '900' },
  bandMeta: { color: Theme.colors.muted, fontSize: 11, marginTop: 3 },
  mediaLink: { minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10 },
  mediaLinkText: { color: Theme.colors.blueDark, fontWeight: '900', fontSize: 11 },
  sectionHeading: { minHeight: 70, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 12 },
  sectionTitle: { color: Theme.colors.ink, fontSize: 18, fontWeight: '900' },
  sectionMeta: { color: Theme.colors.muted, fontSize: 11 },
  levelList: { borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 8, backgroundColor: '#FFFFFF', overflow: 'hidden' },
  levelRow: { minHeight: 88, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  levelRowCompact: { alignItems: 'stretch', flexDirection: 'column', gap: 7 },
  levelMain: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 12 },
  levelIcon: { width: 54, height: 54, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  levelCopy: { flex: 1, minWidth: 0 },
  levelTitle: { color: Theme.colors.ink, fontSize: 16, fontWeight: '900' },
  levelMeta: { color: Theme.colors.muted, fontSize: 11, marginTop: 4 },
  versionCopy: { alignItems: 'flex-end', gap: 5 },
  versionCopyCompact: { minHeight: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', paddingLeft: 66 },
  versionCode: { color: Theme.colors.ink, fontSize: 10, fontWeight: '900' },
  draftBadge: { borderRadius: 5, backgroundColor: '#FFF5CE', paddingHorizontal: 7, paddingVertical: 4 },
  draftText: { color: Theme.colors.yellowDark, fontSize: 8, fontWeight: '900' },
  publishedBadge: { borderRadius: 5, backgroundColor: '#E6F8E9', paddingHorizontal: 7, paddingVertical: 4 },
  publishedText: { color: Theme.colors.greenDark, fontSize: 8, fontWeight: '900' },
  auditList: { borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 8, backgroundColor: '#FFFFFF', overflow: 'hidden' },
  auditRow: { minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: 9, borderBottomWidth: 1, borderBottomColor: Theme.colors.border, padding: 10 },
  auditIcon: { width: 38, height: 38, borderRadius: 7, backgroundColor: '#EAF7FE', alignItems: 'center', justifyContent: 'center' },
  auditCopy: { flex: 1, minWidth: 0 },
  auditTitle: { color: Theme.colors.ink, fontSize: 12, fontWeight: '900' },
  auditMeta: { color: Theme.colors.muted, fontSize: 10, marginTop: 3 },
  emptyAudit: { color: Theme.colors.muted, textAlign: 'center', padding: 22 },
  notice: { marginTop: 16, borderRadius: 8, backgroundColor: '#EAF7FE', borderWidth: 1, borderColor: '#C8E8F8', padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  noticeCopy: { flex: 1 },
  noticeTitle: { color: Theme.colors.ink, fontWeight: '900' },
  noticeText: { color: Theme.colors.muted, fontSize: 12, lineHeight: 17, marginTop: 2 },
});
