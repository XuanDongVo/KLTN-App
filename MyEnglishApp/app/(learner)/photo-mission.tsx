import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PhotoMissionActivity } from '@/components/activities/PhotoMissionActivity';
import { Theme } from '@/constants/Theme';

export default function PhotoMissionScreen() {
  const router = useRouter();
  return <SafeAreaView style={styles.safe}><View style={styles.header}><Pressable onPress={() => router.back()} style={styles.back}><MaterialCommunityIcons name="arrow-left" size={25} color={Theme.colors.ink} /></Pressable><View><Text style={styles.eyebrow}>SPECIAL MISSION</Text><Text style={styles.title}>Photo Mission</Text></View></View><ScrollView contentContainerStyle={styles.content}><View style={styles.intro}><MaterialCommunityIcons name="creation" size={25} color={Theme.colors.violet} /><Text style={styles.introText}>Bien mot buc anh thanh cau tieng Anh de be doc va hoc tu moi.</Text></View><PhotoMissionActivity /></ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.background }, header: { minHeight: 74, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: Theme.colors.border, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 9 }, back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }, eyebrow: { color: Theme.colors.violet, fontSize: 10, fontWeight: '900' }, title: { color: Theme.colors.ink, fontSize: 20, fontWeight: '900' }, content: { padding: 18, paddingBottom: 38, maxWidth: 620, width: '100%', alignSelf: 'center' }, intro: { flexDirection: 'row', gap: 10, backgroundColor: '#F0EDFF', borderRadius: 8, padding: 13, marginBottom: 16, alignItems: 'center' }, introText: { flex: 1, color: Theme.colors.ink, fontWeight: '700', lineHeight: 19 },
});
