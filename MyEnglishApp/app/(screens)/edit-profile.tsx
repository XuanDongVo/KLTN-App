import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionButton } from '@/components/ui/ActionButton';
import { Theme } from '@/constants/Theme';
import { request } from '@/services/apiClient';
import { getUploadSignature, uploadToCloudinary } from '@/services/uploadService';

import { useLearning } from '@/context/LearningContext';

interface UserProfile {
  username?: string;
  avatarUrl?: string;
}

export default function EditProfileScreen() {
  const router = useRouter();
  const { refreshProfile } = useLearning();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [username, setUsername] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await request<UserProfile>('/api/learner/profile');
      setUsername(data.username || '');
      setAvatarUri(data.avatarUrl || null);
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
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!username.trim()) {
      setError('Tên hiển thị không được để trống.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) throw new Error('Không tìm thấy thông tin phiên đăng nhập');

      let finalAvatarUrl = avatarUri;

      // Upload image to Cloudinary if it's a local file
      if (avatarUri && !avatarUri.startsWith('http')) {
        const ext = avatarUri.split('.').pop()?.toLowerCase() || 'jpg';
        const signature = await getUploadSignature(userId, ext);
        finalAvatarUrl = await uploadToCloudinary(avatarUri, signature);
      }

      await request('/api/learner/profile/update', {
        method: 'POST',
        body: JSON.stringify({
          username: username.trim(),
          avatarUrl: finalAvatarUrl,
        }),
      });

      await refreshProfile();
      router.back();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi không xác định';
      setError(msg || 'Có lỗi xảy ra khi lưu thông tin.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={26} color={Theme.colors.ink} />
        </Pressable>
        <Text style={styles.title}>Chỉnh sửa thông tin</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Theme.colors.green} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.avatarSection}>
            <Pressable onPress={pickImage} style={styles.avatarContainer}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <MaterialCommunityIcons name="account" size={60} color={Theme.colors.blueDark} />
                </View>
              )}
              <View style={styles.editIconContainer}>
                <MaterialCommunityIcons name="camera" size={18} color="#FFFFFF" />
              </View>
            </Pressable>
            <Text style={styles.avatarHint}>Chạm để thay đổi ảnh</Text>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>Tên hiển thị</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="card-account-details-outline" size={22} color={Theme.colors.muted} />
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Nhập tên hiển thị của bạn"
                placeholderTextColor={Theme.colors.muted}
                maxLength={30}
              />
            </View>
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
              <ActionButton label="Lưu thay đổi" icon="content-save" color={Theme.colors.green} onPress={handleSave} />
            )}
          </View>
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
  avatarSection: { alignItems: 'center', marginBottom: 32 },
  avatarContainer: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#F0F5FF', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  avatarImage: { width: 110, height: 110, borderRadius: 55 },
  avatarPlaceholder: { width: 110, height: 110, borderRadius: 55, justifyContent: 'center', alignItems: 'center' },
  editIconContainer: { position: 'absolute', bottom: 0, right: 0, backgroundColor: Theme.colors.blue, width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  avatarHint: { marginTop: 12, fontSize: 13, color: Theme.colors.muted, fontWeight: '500' },
  formSection: { marginBottom: 24 },
  label: { fontSize: 15, fontWeight: '700', color: Theme.colors.ink, marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7F9FA', borderRadius: 12, paddingHorizontal: 16, minHeight: 52, borderWidth: 1, borderColor: '#E1E5E9' },
  input: { flex: 1, marginLeft: 12, fontSize: 16, color: Theme.colors.ink, fontWeight: '500', height: '100%' },
  errorBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF4F4', padding: 12, borderRadius: 8, marginBottom: 20 },
  errorText: { color: Theme.colors.coralDark, fontSize: 14, fontWeight: '500', marginLeft: 8, flex: 1 },
  actions: { marginTop: 10 },
});
