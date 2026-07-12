
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CustomHeader from '../../../../components/common/CustomHeader';

export default function UnitHubMenu() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      <CustomHeader title={`Cấu hình bài học chi tiết`} />

      <View style={styles.menuBox}>
        <Text style={styles.subtitle}>BÀI HỌC SỐ: {id}</Text>

        <TouchableOpacity style={styles.card} onPress={() => router.push(`/admin/units/${id}/contents`)}>
          <View style={[styles.iconBox, { backgroundColor: '#e0f2fe' }]}>
            <Ionicons name="images" size={24} color="#0369a1" />
          </View>
          <View style={{ flex: 1, marginLeft: 15 }}>
            <Text style={styles.cardTitle}>Quản lý Nội dung học</Text>
            <Text style={styles.cardDesc}>Danh sách hình ảnh, từ vựng và câu phụ đề cốt lõi</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => router.push(`/admin/units/${id}/questions`)}>
          <View style={[styles.iconBox, { backgroundColor: '#e0f2fe' }]}>
            <Ionicons name="help-circle" size={24} color="#0369a1" />
          </View>
          <View style={{ flex: 1, marginLeft: 15 }}>
            <Text style={styles.cardTitle}>Quản lý Câu hỏi ôn tập</Text>
            <Text style={styles.cardDesc}>Bài tập kiểm tra ngữ pháp dạng điền từ hoặc trắc nghiệm</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  menuBox: { flex: 1, padding: 25, justifyContent: 'center', gap: 15},
  subtitle: { fontSize: 13, fontWeight: 'bold', color: '#9ca3af', textAlign: 'center', marginBottom: 10 },
  card: { backgroundColor: 'white', padding: 20, borderRadius: 16, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  iconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  cardDesc: { fontSize: 13, color: '#6b7280', marginTop: 2 }
});