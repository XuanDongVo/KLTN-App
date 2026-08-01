import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Theme } from '@/constants/Theme';
import { useLearning } from '@/context/LearningContext';
import { curriculumService } from '@/services/curriculumService';
import { styles } from '@/styles/(tabs)/profile.styles';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const router = useRouter();
  const { state } = useLearning();
  const [completed, setCompleted] = useState(0);
  const [total, setTotal] = useState(0);
  const [stars, setStars] = useState(0);
  const [isVerified, setIsVerified] = useState(true);
  const level = Math.floor(state.xp / 100) + 1;

  useFocusEffect(useCallback(() => {
    AsyncStorage.getItem('isVerified').then(val => setIsVerified(val === 'true')).catch(() => undefined);
    curriculumService.getSelectedPath().then((path) => {
      const lessons = path.units.flatMap((unit) => unit.lessons);
      setTotal(lessons.length);
      setCompleted(lessons.filter((lesson) => lesson.progressStatus === 'COMPLETED').length);
      setStars(lessons.reduce((sum, lesson) => sum + lesson.stars, 0));
    }).catch(() => undefined);
  }, []));


  return <SafeAreaView style={styles.safe} edges={['top']}><ScrollView contentContainerStyle={styles.content}>
    <View style={[styles.profileHeader, { position: 'relative' }]}>
      <Pressable onPress={() => router.push('/(screens)/settings')} style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
        <MaterialCommunityIcons name="cog" size={28} color={Theme.colors.muted} />
      </Pressable>
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

    {!isVerified && (
        <View style={{ marginTop: 20, backgroundColor: '#FFF4E5', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#FFE0B2' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <MaterialCommunityIcons name="shield-alert-outline" size={20} color={Theme.colors.coralDark} />
                <Text style={{ fontSize: 15, fontWeight: '700', color: Theme.colors.ink, marginLeft: 8 }}>Chưa xác thực email</Text>
            </View>
            <Text style={{ fontSize: 13, color: Theme.colors.muted, marginBottom: 12, lineHeight: 20 }}>
                Bạn chưa xác thực email. Xác thực ngay để nhận thông báo báo cáo tiến độ từ hệ thống.
            </Text>
            <Pressable 
                onPress={() => router.push({ pathname: '/(auth)/forgot-password', params: { mode: 'verify' } })}
                style={{ backgroundColor: Theme.colors.coral, paddingVertical: 10, borderRadius: 8, alignItems: 'center' }}
            >
                <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 14 }}>Xác thực ngay</Text>
            </Pressable>
        </View>
    )}
  </ScrollView></SafeAreaView>;
}

function Stat({ icon, value, label, color }: { icon: string; value: string; label: string; color: string }) {
  return <View style={styles.stat}><MaterialCommunityIcons name={icon as never} size={27} color={color} /><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}
