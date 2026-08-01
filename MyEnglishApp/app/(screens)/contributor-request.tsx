import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionButton } from '@/components/ui/ActionButton';
import { Theme } from '@/constants/Theme';
import { getCurrentContributorRequest, submitContributorRequest, ContributorRequestDto } from '@/services/contributorService';
import { getUploadSignature, uploadToCloudinary } from '@/services/uploadService';

export default function ContributorRequestScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [certificateUri, setCertificateUri] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [requestData, setRequestData] = useState<ContributorRequestDto | null>(null);

  useEffect(() => {
    fetchCurrentRequest();
  }, []);

  const fetchCurrentRequest = async () => {
    try {
      const data = await getCurrentContributorRequest();
      setRequestData(data);
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

      // Upload image to Cloudinary if it's a local file
      if (certificateUri && !certificateUri.startsWith('http')) {
        const ext = certificateUri.split('.').pop()?.toLowerCase() || 'jpg';
        const signature = await getUploadSignature(userId, ext, 'contributor-requests');
        finalCertUrl = await uploadToCloudinary(certificateUri, signature);
      }

      await submitContributorRequest(finalCertUrl, note.trim());
      await fetchCurrentRequest(); // Refresh the status
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi không xác định';
      setError(msg || 'Có lỗi xảy ra khi gửi yêu cầu.');
    } finally {
      setSaving(false);
    }
  };

  const renderStatus = () => {
    if (!requestData) return null;

    let icon = 'clock-outline';
    let color = Theme.colors.blueDark;
    let title = 'Yêu cầu đang chờ duyệt';
    let message = 'Vui lòng kiên nhẫn, ban quản trị sẽ xem xét chứng chỉ của bạn sớm nhất có thể.';

    if (requestData.status === 'APPROVED') {
      icon = 'check-circle';
      color = Theme.colors.greenDark;
      title = 'Đã được duyệt';
      message = 'Chúc mừng, bạn đã là Contributor! Vui lòng đăng xuất và đăng nhập lại để vào Portal quản trị.';
    } else if (requestData.status === 'REJECTED') {
      icon = 'close-circle';
      color = Theme.colors.coralDark;
      title = 'Yêu cầu bị từ chối';
      message = requestData.adminFeedback ? `Lý do: ${requestData.adminFeedback}` : 'Chứng chỉ chưa đạt yêu cầu.';
    }

    return (
      <View style={[styles.statusBanner, { backgroundColor: `${color}15` }]}>
        <MaterialCommunityIcons name={icon as any} size={28} color={color} />
        <View style={styles.statusCopy}>
          <Text style={[styles.statusTitle, { color }]}>{title}</Text>
          <Text style={styles.statusMessage}>{message}</Text>
        </View>
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

      {loading ? (
        <ActivityIndicator size="large" color={Theme.colors.green} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {renderStatus()}

          {(!requestData || requestData.status === 'REJECTED') && (
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
          )}
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
  content: { padding: 24 },
  intro: { fontSize: 15, lineHeight: 22, color: Theme.colors.ink, marginBottom: 24 },
  label: { fontSize: 15, fontWeight: '700', color: Theme.colors.ink, marginBottom: 8 },
  uploadArea: { backgroundColor: '#F7F9FA', borderRadius: 12, borderWidth: 1, borderColor: '#E1E5E9', borderStyle: 'dashed', overflow: 'hidden', marginBottom: 20 },
  uploadPlaceholder: { padding: 30, alignItems: 'center', justifyContent: 'center' },
  uploadText: { marginTop: 10, fontSize: 14, color: Theme.colors.muted, fontWeight: '500' },
  uploadedImage: { width: '100%', height: 200, backgroundColor: '#F0F0F0' },
  inputContainer: { backgroundColor: '#F7F9FA', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#E1E5E9', marginBottom: 24 },
  input: { fontSize: 15, color: Theme.colors.ink, minHeight: 80 },
  errorBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF4F4', padding: 12, borderRadius: 8, marginBottom: 20 },
  errorText: { color: Theme.colors.coralDark, fontSize: 14, fontWeight: '500', marginLeft: 8, flex: 1 },
  actions: { marginTop: 10 },
  statusBanner: { flexDirection: 'row', padding: 16, borderRadius: 12, marginBottom: 24, alignItems: 'flex-start' },
  statusCopy: { flex: 1, marginLeft: 12 },
  statusTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  statusMessage: { fontSize: 14, lineHeight: 20, color: Theme.colors.ink },
});
