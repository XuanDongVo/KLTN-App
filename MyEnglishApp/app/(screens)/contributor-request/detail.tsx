import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { Theme } from '@/constants/Theme';
import { ContributorRequestDto } from '@/services/contributorService';

export default function ContributorRequestDetailScreen() {
  const router = useRouter();
  const { requestData } = useLocalSearchParams();
  
  let req: ContributorRequestDto | null = null;
  try {
    if (typeof requestData === 'string') {
      req = JSON.parse(requestData);
    }
  } catch (e) {
    // Ignore parse error
  }

  if (!req) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={26} color={Theme.colors.ink} />
          </Pressable>
          <Text style={styles.title}>Chi tiết yêu cầu</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.errorText}>Không tìm thấy thông tin yêu cầu.</Text>
        </View>
      </SafeAreaView>
    );
  }

  let icon = 'clock-outline';
  let color = Theme.colors.blueDark;
  let statusText = 'Chờ duyệt';
  let message = 'Yêu cầu của bạn đang chờ ban quản trị xét duyệt.';

  if (req.status === 'APPROVED') {
    icon = 'check-circle';
    color = Theme.colors.greenDark;
    statusText = 'Đã duyệt';
    message = 'Yêu cầu của bạn đã được duyệt. Chào mừng bạn gia nhập đội ngũ Contributor!';
  } else if (req.status === 'REJECTED') {
    icon = 'close-circle';
    color = Theme.colors.coralDark;
    statusText = 'Bị từ chối';
    message = 'Yêu cầu của bạn đã bị từ chối.';
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={26} color={Theme.colors.ink} />
        </Pressable>
        <Text style={styles.title}>Chi tiết yêu cầu</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={[styles.statusBanner, { backgroundColor: `${color}15` }]}>
          <MaterialCommunityIcons name={icon as any} size={28} color={color} />
          <View style={styles.statusCopy}>
            <Text style={[styles.statusTitle, { color }]}>{statusText}</Text>
            <Text style={styles.statusMessage}>{message}</Text>
          </View>
        </View>

        {req.status === 'REJECTED' && req.adminFeedback && (
          <View style={styles.feedbackContainer}>
            <Text style={styles.label}>Phản hồi từ Admin:</Text>
            <View style={styles.feedbackBox}>
              <Text style={styles.feedbackText}>{req.adminFeedback}</Text>
            </View>
          </View>
        )}

        <Text style={styles.label}>Hình ảnh chứng chỉ:</Text>
        <View style={styles.imageContainer}>
          {req.certificateUrl ? (
            <Image 
              source={{ uri: req.certificateUrl }} 
              style={styles.certificateImage} 
              resizeMode="contain" 
            />
          ) : (
            <Text style={styles.noDataText}>Không có hình ảnh</Text>
          )}
        </View>
        
        {req.certificateUrl && (
          <Text style={styles.urlText}>URL: {req.certificateUrl}</Text>
        )}

        {req.note ? (
          <View style={{ marginTop: 24 }}>
            <Text style={styles.label}>Ghi chú đính kèm:</Text>
            <Text style={styles.noteText}>{req.note}</Text>
          </View>
        ) : null}

        <View style={{ marginTop: 24 }}>
          <Text style={styles.label}>Ngày nộp:</Text>
          <Text style={styles.dateText}>{new Date(req.createdAt).toLocaleString('vi-VN')}</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  backBtn: { marginRight: 12 },
  title: { fontSize: 20, fontWeight: '800', color: Theme.colors.ink },
  content: { padding: 24 },
  errorText: { fontSize: 15, color: Theme.colors.coralDark, textAlign: 'center', marginTop: 20 },
  statusBanner: { flexDirection: 'row', padding: 16, borderRadius: 12, marginBottom: 24, alignItems: 'flex-start' },
  statusCopy: { flex: 1, marginLeft: 12 },
  statusTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  statusMessage: { fontSize: 14, lineHeight: 20, color: Theme.colors.ink },
  feedbackContainer: { marginBottom: 24 },
  feedbackBox: { backgroundColor: '#FFF4F4', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#FFE2E2' },
  feedbackText: { color: Theme.colors.coralDark, fontSize: 15, lineHeight: 22 },
  label: { fontSize: 15, fontWeight: '700', color: Theme.colors.ink, marginBottom: 8 },
  imageContainer: { width: '100%', height: 250, backgroundColor: '#F7F9FA', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#E1E5E9', justifyContent: 'center', alignItems: 'center' },
  certificateImage: { width: '100%', height: '100%' },
  noDataText: { color: Theme.colors.muted, fontSize: 14 },
  urlText: { fontSize: 12, color: Theme.colors.muted, marginTop: 8 },
  noteText: { fontSize: 15, color: Theme.colors.ink, lineHeight: 22, backgroundColor: '#F7F9FA', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E1E5E9' },
  dateText: { fontSize: 15, color: Theme.colors.muted }
});
