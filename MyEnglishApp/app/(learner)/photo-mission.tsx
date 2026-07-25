import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PhotoMissionActivity } from '@/components/activities/PhotoMissionActivity';
import { Theme } from '@/constants/Theme';
import { styles } from './photo-mission.styles';

export default function PhotoMissionScreen() {
  const router = useRouter();
  return <SafeAreaView style={styles.safe}><View style={styles.header}><Pressable onPress={() => router.back()} style={styles.back}><MaterialCommunityIcons name="arrow-left" size={25} color={Theme.colors.ink} /></Pressable><View><Text style={styles.eyebrow}>SPECIAL MISSION</Text><Text style={styles.title}>Photo Mission</Text></View></View><ScrollView contentContainerStyle={styles.content}><View style={styles.intro}><MaterialCommunityIcons name="creation" size={25} color={Theme.colors.violet} /><Text style={styles.introText}>Biến một bức ảnh thành câu tiếng Anh để bé đọc và học từ mới.</Text></View><PhotoMissionActivity /></ScrollView></SafeAreaView>;
}
