
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CustomHeader from '../../../../components/common/CustomHeader';
import ResponsiveWrapper from '../../../../components/common/ResponsiveWrapper';
import { unitService } from '../../../../services/unitService';

export default function UnitQuestionsPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('userToken') || '';
        const res = await unitService.getQuestionsByUnit(Number(id), token);
        if (res.code === 200) setQuestions(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchQuestions();
  }, [id]);


  const renderQuestionBody = (item: any) => {
    const data = item.questionData;
    switch (item.questionType) {
      case 'FILL_IN_BLANK':
        return <Text style={styles.qBody}>{data?.sentence}</Text>;
      case 'MATCHING':
        return (
          <View style={{ marginTop: 5 }}>
            {data?.pairs?.map((p: any, i: number) => (
              <Text key={i} style={styles.qBody}>• {p.left} - {p.right}</Text>
            ))}
          </View>
        );
      case 'MULTIPLE_CHOICE':
        return <Text style={styles.qBody}>{data?.question}</Text>;
      case 'TRUE_FALSE':
        return <Text style={styles.qBody}>{data?.caption}</Text>;
      case 'IMAGE_CHOICE':
        return <Text style={styles.qBody}>{data?.question}</Text>;
      default:
        return <Text style={styles.qBody}>Dạng câu hỏi không xác định</Text>;
    }
  };


  const renderAnswer = (item: any) => {
    const data = item.questionData;
    switch (item.questionType) {
      case 'FILL_IN_BLANK':
        return <Text style={styles.qAns}>Đáp án: {data?.missingWords?.join(', ')}</Text>;
      case 'MATCHING':
        return <Text style={styles.qAns}>Đã khớp các cặp</Text>;
      case 'MULTIPLE_CHOICE':
      case 'IMAGE_CHOICE':
        return <Text style={styles.qAns}>Đáp án: {data?.answer}</Text>;
      case 'TRUE_FALSE':
        return <Text style={styles.qAns}>Đáp án: {String(data?.isTrue)}</Text>;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <CustomHeader title={`Câu hỏi ôn tập - Unit ${id}`} />

      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 30 }} />
      ) : (
        <ResponsiveWrapper scrollable={false} style={{ padding: 20 }}>
          <FlatList
            data={questions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={styles.qCard}
                onPress={() => router.push(`/admin/units/forms/question?unitId=${id}&questionId=${item.id}`)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.qHeader}>CÂU {index + 1} - {item.questionType}</Text>
                  {renderQuestionBody(item)}
                  {renderAnswer(item)}
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="help-buoy-outline" size={40} color="#9ca3af" />
                <Text style={{ color: '#6b7280' }}>Chưa có câu hỏi ôn tập.</Text>
              </View>
            }
          />
          <TouchableOpacity
            style={styles.btnBlue}
            onPress={() => router.push(`/admin/units/forms/question?unitId=${id}`)}
          >
            <Text style={styles.btnText}>Thêm Câu Hỏi Mới</Text>
          </TouchableOpacity>
        </ResponsiveWrapper>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  qCard: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 12, borderLeftWidth: 5, borderLeftColor: '#3b82f6', flexDirection: 'row', alignItems: 'center' },
  qHeader: { fontWeight: 'bold', color: '#9ca3af', fontSize: 11 },
  qBody: { fontSize: 15, color: '#1f2937', marginTop: 5 },
  qAns: { color: '#10b981', fontSize: 13, marginTop: 4, fontWeight: 'bold' },
  empty: { alignItems: 'center', marginVertical: 40, gap: 10 },
  btnBlue: { backgroundColor: '#3b82f6', padding: 15, borderRadius: 10, alignItems: 'center', marginVertical: 15 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});