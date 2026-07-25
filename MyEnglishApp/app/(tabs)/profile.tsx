import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Theme } from '@/constants/Theme';
import { useLearning } from '@/context/LearningContext';
import { curriculumService } from '@/services/curriculumService';
import { styles } from './profile.styles';

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
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text style={styles.sectionTitle}>Thành tích của bé</Text>
      <Pressable onPress={() => router.push('/history')}>
        <Text style={{ color: Theme.colors.green, fontSize: 14, fontWeight: '700', marginTop: 32 }}>Xem chi tiết</Text>
      </Pressable>
    </View>
    <View style={styles.grid}>
      <Stat icon="fire" value={`${state.streak} ngày`} label="Chuỗi học" color={Theme.colors.coral} />
      <Stat icon="star-four-points" value={`${state.xp} XP`} label="Tổng XP" color={Theme.colors.yellowDark} />
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
