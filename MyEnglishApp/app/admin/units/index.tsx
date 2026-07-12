
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { Unit, UnitCard } from '../../../components/cards/UnitCard';
import ResponsiveWrapper from '../../../components/common/ResponsiveWrapper';
import { unitService } from '../../../services/unitService';

export default function UnitListScreen() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    try {
      const data = await unitService.getAllUnits();
      if (data.code === 200) {
        setUnits(data.data);
      } else {
        alert("Lỗi tải dữ liệu: " + data.message);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ResponsiveWrapper scrollable={false} contentContainerStyle={{ padding: 20 }}>
      
      {/* Header của danh sách bài học */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Text style={{ fontSize: 26, fontWeight: 'bold', color: '#1f2937' }}>Quản lý Bài học</Text>
        
        <TouchableOpacity 
          onPress={() => router.push('/admin/units/create' as any)}
          style={{ backgroundColor: '#4ade80', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, elevation: 2 }}>
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Thêm Bài Học</Text>
        </TouchableOpacity>
      </View>

      {/* Hiển thị danh sách */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#4ade80" />
        </View>
      ) : (
        <FlatList
          data={units}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => <UnitCard unit={item} index={index} />}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', color: '#6b7280', marginTop: 40, fontSize: 16 }}>
              Chưa có bài học nào.
            </Text>
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 50 }} 
        />
      )}
    </ResponsiveWrapper>
  );
}