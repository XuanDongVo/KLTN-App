import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Theme } from '@/constants/Theme';
import { adminCurriculumService } from '@/services/adminCurriculumService';
import { adminOperationsService } from '@/services/adminOperationsService';
import type { AdminLevelOverview } from '@/types/adminCurriculum';
import type { AdminDashboard, ChallengeStatsResponse } from '@/types/adminOperations';
import { styles } from '@/styles/admin/index.styles';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const compact = width < 560;
  const [levels, setLevels] = useState<AdminLevelOverview[]>([]);
  const [dashboard, setDashboard] = useState<AdminDashboard>();
  const [challengeStats, setChallengeStats] = useState<ChallengeStatsResponse>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      adminCurriculumService.getLevels(), 
      adminOperationsService.getDashboard(),
      adminOperationsService.getChallengeStats()
    ])
      .then(([nextLevels, nextDashboard, nextChallengeStats]) => { 
        setLevels(nextLevels); 
        setDashboard(nextDashboard); 
        setChallengeStats(nextChallengeStats);
      })
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

    <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Thử Thách Người Học</Text><Text style={styles.sectionMeta}>Tổng quan</Text></View>
    <View style={{ flexDirection: 'row', gap: 15, marginBottom: 20 }}>
        <View style={{ flex: 1, backgroundColor: '#E8F8EA', padding: 15, borderRadius: 12, alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: Theme.colors.greenDark }}>{challengeStats?.totalActive ?? 0}</Text>
            <Text style={{ fontSize: 13, color: Theme.colors.green, marginTop: 4 }}>Đang tham gia</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: '#EAF7FE', padding: 15, borderRadius: 12, alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: Theme.colors.blueDark }}>{challengeStats?.totalCompleted ?? 0}</Text>
            <Text style={{ fontSize: 13, color: Theme.colors.blue, marginTop: 4 }}>Hoàn thành</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: '#FFF1F0', padding: 15, borderRadius: 12, alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: Theme.colors.coralDark }}>{challengeStats?.totalFailed ?? 0}</Text>
            <Text style={{ fontSize: 13, color: Theme.colors.coral, marginTop: 4 }}>Thất bại</Text>
        </View>
    </View>

    {challengeStats && challengeStats.optionsStats.length > 0 && (
      <View style={{ backgroundColor: '#F9FAFB', borderRadius: 12, padding: 15, marginBottom: 30 }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: Theme.colors.ink, marginBottom: 10 }}>Phân bố lựa chọn Thử thách</Text>
        {challengeStats.optionsStats.map((stat, idx) => (
            <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: idx < challengeStats.optionsStats.length - 1 ? 1 : 0, borderBottomColor: Theme.colors.border }}>
                <Text style={{ fontSize: 14, color: Theme.colors.ink }}>Gói {stat.targetXp} XP - {stat.targetDays} Ngày</Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: Theme.colors.ink }}>{stat.count} người chọn</Text>
            </View>
        ))}
      </View>
    )}

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
