
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CustomHeader from '../../../../components/common/CustomHeader';
import ResponsiveWrapper from '../../../../components/common/ResponsiveWrapper';
import { unitService } from '../../../../services/unitService';

export default function UnitContentsPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [contexts, setContexts] = useState<any[]>([]);

  useEffect(() => {
    const fetchContents = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('userToken') || '';
        const res = await unitService.getUnitContents(Number(id), token);
        if (res.code === 200) setContexts(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchContents();
  }, [id]);

  return (
    <View style={styles.container}>
      <CustomHeader title={`Nội dung bài học - Unit ${id}`} />

      {loading ? (
        <ActivityIndicator size="large" color="#10b981" style={{ marginTop: 30 }} />
      ) : (
        <ResponsiveWrapper contentContainerStyle={styles.wrapper}>
          {contexts.map((item) => (
          
            <TouchableOpacity 
              key={item.id} 
              style={styles.card}
              onPress={() => router.push(`/admin/units/forms/content?unitId=${id}&contentId=${item.id}`)}
            >
              <Image source={{ uri: item.imageUrl }} style={styles.img} />
              <View style={styles.cardBody}>
                <Text style={styles.caption}>{item.finalCaption}</Text>
                <Text style={styles.grammar}>Ngữ pháp: {item.grammarStructure || 'Không'}</Text>
                <View style={styles.badgeRow}>
                  {item.vocabularies?.map((v: any) => (
                    <View key={v.id} style={styles.badge}>
                      <Text style={styles.badgeText}>{v.word} ({v.type})</Text>
                    </View>
                  ))}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          ))}

          {contexts.length === 0 && (
            <View style={styles.empty}>
              <Ionicons name="document-text-outline" size={40} color="#9ca3af" />
              <Text style={{ color: '#6b7280' }}>Chưa có dữ liệu học tập nào.</Text>
            </View>
          )}

          <TouchableOpacity 
            style={styles.btnAdd} 
            onPress={() => router.push(`/admin/units/forms/content?unitId=${id}`)}
          >
            <Text style={styles.addText}>Thêm Nội Dung Mới</Text>
          </TouchableOpacity>
        </ResponsiveWrapper>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  wrapper: { padding: 20 },
  card: { backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 15, flexDirection: 'row', alignItems: 'center', gap: 15, elevation: 1 },
  img: { width: 80, height: 80, borderRadius: 8 },
  cardBody: { flex: 1 },
  caption: { fontWeight: 'bold', fontSize: 15, color: '#1f2937', marginBottom: 4 },
  grammar: { color: '#6b7280', fontSize: 13 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 8 },
  badge: { backgroundColor: '#e0f2fe', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { color: '#0369a1', fontSize: 12 },
  empty: { alignItems: 'center', marginVertical: 40, gap: 10 },
  btnAdd: { backgroundColor: '#10b981', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10, marginBottom: 30 },
  addText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});