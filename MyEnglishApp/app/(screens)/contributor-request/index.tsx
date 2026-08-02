import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionButton } from '@/components/ui/ActionButton';
import { Theme } from '@/constants/Theme';
import { getAllMyContributorRequests, submitContributorRequest, ContributorRequestDto } from '@/services/contributorService';
import { getUploadSignature, uploadToCloudinary } from '@/services/uploadService';

export default function ContributorRequestScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'form' | 'history'>('form');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [certificateUri, setCertificateUri] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [requests, setRequests] = useState<ContributorRequestDto[]>([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const data = await getAllMyContributorRequests();
      setRequests(data || []);
      
      // Auto switch to history if there is a pending or approved request
      const hasPending = data.some(r => r.status === 'PENDING');
      if (hasPending && activeTab === 'form') {
        setActiveTab('history');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError('Không thể tải thông tin: ' + msg);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setCertificateUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!certificateUri) {
      setError('Vui lòng cung cấp hình ảnh chứng chỉ.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) throw new Error('Không tìm thấy thông tin phiên đăng nhập');

      let finalCertUrl = certificateUri;

      if (certificateUri && !certificateUri.startsWith('http')) {
        const ext = certificateUri.split('.').pop()?.toLowerCase() || 'jpg';
        const signature = await getUploadSignature(userId, ext, 'contributor-requests');
        finalCertUrl = await uploadToCloudinary(certificateUri, signature);
      }

      await submitContributorRequest(finalCertUrl, note.trim());
      setCertificateUri(null);
      setNote('');
      await fetchRequests();
      setActiveTab('history');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi không xác định';
      setError(msg || 'Có lỗi xảy ra khi gửi yêu cầu.');
    } finally {
      setSaving(false);
    }
  };

  const hasPendingRequest = requests.some(r => r.status === 'PENDING');

  const renderForm = () => {
    if (hasPendingRequest) {
      return (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="clock-outline" size={48} color={Theme.colors.blue} />
          <Text style={styles.emptyStateTitle}>Bạn đang có yêu cầu chờ duyệt</Text>
          <Text style={styles.emptyStateText}>Vui lòng chờ ban quản trị phản hồi trước khi gửi yêu cầu mới.</Text>
        </View>
      );
    }

    return (
      <View>
        <Text style={styles.intro}>
          Trở thành cộng tác viên xây dựng nội dung bài học. Hãy upload hình ảnh chứng chỉ tiếng Anh (IELTS, TOEIC...) hoặc bằng cấp liên quan để chúng tôi xác thực trình độ của bạn.
        </Text>

        <Text style={styles.label}>Hình ảnh chứng chỉ</Text>
        <Pressable onPress={pickImage} style={styles.uploadArea}>
          {certificateUri ? (
            <Image source={{ uri: certificateUri }} style={styles.uploadedImage} resizeMode="contain" />
          ) : (
            <View style={styles.uploadPlaceholder}>
              <MaterialCommunityIcons name="cloud-upload" size={40} color={Theme.colors.muted} />
              <Text style={styles.uploadText}>Chạm để chọn hình ảnh</Text>
            </View>
          )}
        </Pressable>

        <Text style={styles.label}>Ghi chú thêm (Không bắt buộc)</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={note}
            onChangeText={setNote}
            placeholder="Kinh nghiệm giảng dạy, giới thiệu bản thân..."
            placeholderTextColor={Theme.colors.muted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {error ? (
          <View style={styles.errorBanner}>
            <MaterialCommunityIcons name="alert-circle" size={20} color={Theme.colors.coralDark} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          {saving ? (
            <ActivityIndicator size="large" color={Theme.colors.green} />
          ) : (
            <ActionButton label="Gửi yêu cầu" icon="send" color={Theme.colors.green} onPress={handleSave} />
          )}
        </View>
      </View>
    );
  };

  const renderHistory = () => {
    if (requests.length === 0) {
      return (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="clipboard-text-outline" size={48} color={Theme.colors.muted} />
          <Text style={styles.emptyStateTitle}>Chưa có lịch sử</Text>
          <Text style={styles.emptyStateText}>Bạn chưa gửi yêu cầu nào.</Text>
        </View>
      );
    }

    return (
      <View>
        {requests.map((req, index) => {
          let icon = 'clock-outline';
          let color = Theme.colors.blueDark;
          let label = 'Chờ duyệt';

          if (req.status === 'APPROVED') {
            icon = 'check-circle';
            color = Theme.colors.greenDark;
            label = 'Đã duyệt';
          } else if (req.status === 'REJECTED') {
            icon = 'close-circle';
            color = Theme.colors.coralDark;
            label = 'Từ chối';
          }

          return (
            <Pressable 
              key={req.id || index} 
              style={styles.historyCard}
              onPress={() => router.push({
                pathname: '/(screens)/contributor-request/detail',
                params: { requestData: JSON.stringify(req) }
              })}
            >
              <View style={[styles.statusIcon, { backgroundColor: `${color}15` }]}>
                <MaterialCommunityIcons name={icon as any} size={24} color={color} />
              </View>
              <View style={styles.historyInfo}>
                <Text style={styles.historyDate}>Gửi ngày: {new Date(req.createdAt).toLocaleDateString('vi-VN')}</Text>
                <Text style={[styles.historyStatus, { color }]}>{label}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={Theme.colors.muted} />
            </Pressable>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={26} color={Theme.colors.ink} />
        </Pressable>
        <Text style={styles.title}>Trở thành Contributor</Text>
      </View>

      <View style={styles.tabContainer}>
        <Pressable 
          style={[styles.tab, activeTab === 'form' && styles.activeTab]} 
          onPress={() => setActiveTab('form')}
        >
          <Text style={[styles.tabText, activeTab === 'form' && styles.activeTabText]}>Gửi yêu cầu</Text>
        </Pressable>
        <Pressable 
          style={[styles.tab, activeTab === 'history' && styles.activeTab]} 
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>Lịch sử</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Theme.colors.green} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'form' ? renderForm() : renderHistory()}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  backBtn: { marginRight: 12 },
  title: { fontSize: 20, fontWeight: '800', color: Theme.colors.ink },
  tabContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: Theme.colors.green },
  tabText: { fontSize: 15, fontWeight: '600', color: Theme.colors.muted },
  activeTabText: { color: Theme.colors.green },
  content: { padding: 24 },
  intro: { fontSize: 15, lineHeight: 22, color: Theme.colors.ink, marginBottom: 24 },
  label: { fontSize: 15, fontWeight: '700', color: Theme.colors.ink, marginBottom: 8 },
  uploadArea: { backgroundColor: '#F7F9FA', borderRadius: 12, borderWidth: 1, borderColor: '#E1E5E9', borderStyle: 'dashed', overflow: 'hidden', marginBottom: 20 },
  uploadPlaceholder: { padding: 30, alignItems: 'center', justifyContent: 'center' },
  uploadText: { marginTop: 10, fontSize: 14, color: Theme.colors.muted, fontWeight: '500' },
  uploadedImage: { width: '100%', height: 200, backgroundColor: '#F0F0F0', borderRadius: 12 },
  inputContainer: { backgroundColor: '#F7F9FA', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#E1E5E9', marginBottom: 24 },
  input: { fontSize: 15, color: Theme.colors.ink, minHeight: 80 },
  errorBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF4F4', padding: 12, borderRadius: 8, marginBottom: 20 },
  errorText: { color: Theme.colors.coralDark, fontSize: 14, fontWeight: '500', marginLeft: 8, flex: 1 },
  actions: { marginTop: 10 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyStateTitle: { fontSize: 18, fontWeight: '700', color: Theme.colors.ink, marginTop: 16, marginBottom: 8 },
  emptyStateText: { fontSize: 15, color: Theme.colors.muted, textAlign: 'center', paddingHorizontal: 20 },
  historyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#F0F0F0' },
  statusIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  historyInfo: { flex: 1 },
  historyDate: { fontSize: 14, color: Theme.colors.muted, marginBottom: 4 },
  historyStatus: { fontSize: 15, fontWeight: '700' }
});
