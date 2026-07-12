import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import UnitLearnerCard from '../../components/cards/UnitLearnerCard';
import { GlobalStyles } from '../../constants/Style';
import { learnerService } from '../../services/learnerService';

export default function HomeScreen() {
  const router = useRouter();
  const [units, setUnits] = useState<any[]>([]);
  const [totalScore, setTotalScore] = useState(0); // State lưu Điểm
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const data = await learnerService.getDashboard(token!);
      setUnits(data.units);
      setTotalScore(data.totalScore); // Set Điểm
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#3b82f6" />;

  return (
    <View style={GlobalStyles.container}>
      <View style={styles.headerSection}>
        <View style={styles.headerTopRow}>
           <View>
             <Text style={styles.greetingText}>Hôm nay học gì nhỉ?</Text>
             <Text style={styles.subGreetingText}>Chọn một bài học để bắt đầu hành trình của bạn.</Text>
           </View>
           
           <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>Tổng điểm</Text>
              <Text style={styles.scoreValue}>⭐ {totalScore}</Text>
           </View>
        </View>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.gridContainer}>
          {units.map((item) => (
            <UnitLearnerCard 
              key={item.id}
              item={item} 
              onPress={() => router.push(`/quiz?unitId=${item.id}&isReview=${item.isCompleted}`)} 
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerSection: { paddingHorizontal: 25, paddingTop: 30, paddingBottom: 20 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 15 },
  greetingText: { fontSize: 28, fontWeight: '800', color: '#1f2937', marginBottom: 5 },
  subGreetingText: { fontSize: 15, color: '#6b7280' },

  scoreBox: { backgroundColor: '#fffbeb', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#fde68a', alignItems: 'center', minWidth: 100 },
  scoreLabel: { fontSize: 12, color: '#d97706', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 4 },
  scoreValue: { fontSize: 20, color: '#b45309', fontWeight: '900' },
  
  scrollContent: { paddingBottom: 40 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 20, paddingHorizontal: 20 }
});