import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';

import { Theme } from '@/constants/Theme';
import { contributorCurriculumService } from '@/services/adminCurriculumService';
import type { AdminLevelOverview } from '@/types/adminCurriculum';
import { styles } from '@/styles/admin/index.styles';

export default function ContributorDashboardScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const compact = width < 560;
  const [levels, setLevels] = useState<AdminLevelOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    contributorCurriculumService.getLevels()
      .then((nextLevels) => setLevels(nextLevels))
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'Không tải được dữ liệu chương trình học.'))
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
      <View style={styles.headingCopy}><Text style={styles.eyebrow}>CONTRIBUTOR DASHBOARD</Text><Text style={styles.title}>Không gian sáng tạo</Text><Text style={styles.subtitle}>Thiết kế và biên soạn bài học tiếng Anh cho trẻ em.</Text></View>
      <View style={styles.headingActions}><Pressable style={styles.primary} onPress={() => router.push('/contributor/curriculum')}><MaterialCommunityIcons name="pencil-ruler" size={20} color="#FFFFFF" /><Text style={styles.primaryText}>Curriculum CMS</Text></Pressable></View>
    </View>

    {error ? <View style={styles.error}><MaterialCommunityIcons name="alert-circle" size={22} color={Theme.colors.coralDark} /><Text style={styles.errorText}>{error}</Text></View> : null}

    <View style={styles.curriculumBand}><View><Text style={styles.bandTitle}>Nội dung đang được phục vụ</Text><Text style={styles.bandMeta}>{totals.units} unit · {totals.lessons} lesson · {totals.activities} activity</Text></View><Pressable onPress={() => router.push('/contributor/media')} style={styles.mediaLink}><MaterialCommunityIcons name="image-multiple" size={19} color={Theme.colors.blueDark} /><Text style={styles.mediaLinkText}>Thư viện ảnh</Text></Pressable></View>

    <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Trạng thái cấp độ</Text><Text style={styles.sectionMeta}>{levels.filter((level) => level.versions.some((version) => version.status === 'DRAFT' || version.status === 'PENDING')).length} bản nháp / chờ duyệt</Text></View>
    <View style={styles.levelList}>{levels.map((level) => {
      const published = level.versions.find((version) => version.status === 'PUBLISHED');
      const draft = level.versions.find((version) => version.status === 'DRAFT' || version.status === 'PENDING');
      
      return <Pressable key={level.code} onPress={() => router.push('/contributor/curriculum')} style={[styles.levelRow, compact && styles.levelRowCompact]}>
        <View style={styles.levelMain}>
          <View style={[styles.levelIcon, { backgroundColor: level.code === 'PRE_A1_STARTERS' ? '#E8F8EA' : level.code === 'A1_MOVERS' ? '#EAF7FE' : '#F0EDFF' }]}><MaterialCommunityIcons name={level.code === 'PRE_A1_STARTERS' ? 'sprout' : level.code === 'A1_MOVERS' ? 'map-marker-path' : 'rocket-launch-outline'} size={27} color={level.code === 'PRE_A1_STARTERS' ? Theme.colors.greenDark : level.code === 'A1_MOVERS' ? Theme.colors.blueDark : Theme.colors.violet} /></View>
          <View style={styles.levelCopy}><Text style={styles.levelTitle}>{level.displayName}</Text><Text style={styles.levelMeta}>{published ? `${published.unitCount} unit · ${published.lessonCount} lesson · ${published.activityCount} activity` : 'Chưa có version xuất bản'}</Text></View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={Theme.colors.muted} />
        </View>
        <View style={[styles.versionCopy, compact && styles.versionCopyCompact]}>
          <Text style={styles.versionCode}>{published?.versionCode ?? '-'}</Text>
          {draft ? (
             <View style={[styles.draftBadge, draft.status === 'PENDING' && { backgroundColor: Theme.colors.blue, borderColor: Theme.colors.blueDark }]}>
                 <Text style={[styles.draftText, draft.status === 'PENDING' && { color: '#FFF' }]}>{draft.status === 'PENDING' ? 'CHỜ DUYỆT' : 'BẢN NHÁP'}</Text>
             </View>
          ) : <View style={styles.publishedBadge}><Text style={styles.publishedText}>ĐÃ XUẤT BẢN</Text></View>}
        </View>
      </Pressable>;
    })}</View>

    <View style={styles.notice}><MaterialCommunityIcons name="shield-lock-outline" size={23} color={Theme.colors.blueDark} /><View style={styles.noticeCopy}><Text style={styles.noticeTitle}>Bảo vệ nội dung</Text><Text style={styles.noticeText}>Mọi thay đổi của bạn sẽ được lưu dưới dạng Bản nháp và cần Admin duyệt trước khi Xuất bản cho người học.</Text></View></View>
  </ScrollView>;
}
