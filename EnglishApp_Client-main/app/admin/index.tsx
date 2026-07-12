
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import ResponsiveWrapper from '../../components/common/ResponsiveWrapper';
import { unitService } from '../../services/unitService';

export default function AdminDashboardScreen() {
  const [stats, setStats] = useState({ totalUnits: 0, totalUsers: 0 });
  const [loading, setLoading] = useState(true);
  
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await unitService.getDashboardStats();
      if (data.code === 200) {
        setStats(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ResponsiveWrapper scrollable={true} contentContainerStyle={{ padding: 25 }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 10, color: '#1f2937' }}>
        Chào mừng quay lại!
      </Text>
      <Text style={{ fontSize: 16, color: '#6b7280', marginBottom: 30 }}>
        Dưới đây là tổng quan hệ thống hôm nay.
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#4ade80" style={{ marginTop: 50 }} />
      ) : (
        <View style={{ flexDirection: isMobile ? 'column' : 'row', gap: 20 }}>
          
          <Animated.View entering={FadeInDown.duration(400).delay(100)} style={{ flex: 1, backgroundColor: 'white', padding: 25, borderRadius: 15, elevation: 3, borderLeftWidth: 5, borderLeftColor: '#3b82f6' }}>
            <Text style={{ fontSize: 16, color: '#6b7280', fontWeight: 'bold' }}>TỔNG BÀI HỌC</Text>
            <Text style={{ fontSize: 36, fontWeight: 'bold', color: '#1f2937', marginTop: 10 }}>{stats.totalUnits}</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(200)} style={{ flex: 1, backgroundColor: 'white', padding: 25, borderRadius: 15, elevation: 3, borderLeftWidth: 5, borderLeftColor: '#10b981' }}>
            <Text style={{ fontSize: 16, color: '#6b7280', fontWeight: 'bold' }}>NGƯỜI DÙNG</Text>
            <Text style={{ fontSize: 36, fontWeight: 'bold', color: '#1f2937', marginTop: 10 }}>{stats.totalUsers}</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(300)} style={{ flex: 1, backgroundColor: 'white', padding: 25, borderRadius: 15, elevation: 3, borderLeftWidth: 5, borderLeftColor: '#f59e0b' }}>
            <Text style={{ fontSize: 16, color: '#6b7280', fontWeight: 'bold' }}>TỪ VỰNG MỚI</Text>
            <Text style={{ fontSize: 36, fontWeight: 'bold', color: '#1f2937', marginTop: 10 }}>Chưa rõ</Text>
          </Animated.View>

        </View>
      )}
    </ResponsiveWrapper>
  );
}