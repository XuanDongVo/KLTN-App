import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import CustomHeader from '../../components/common/CustomHeader';
import ResponsiveWrapper from '../../components/common/ResponsiveWrapper';
import { CustomModal } from '../../components/modals/CustomModal';
import { learnerService } from '../../services/learnerService';

export default function QuizScreen() {
  const { unitId } = useLocalSearchParams();
  const router = useRouter();

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  const [answerInput, setAnswerInput] = useState('');
  const [shuffledChoices, setShuffledChoices] = useState<string[]>([]);

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matchedLefts, setMatchedLefts] = useState<string[]>([]);
  const [shuffledLeftPairs, setShuffledLeftPairs] = useState<any[]>([]);
  const [shuffledRightPairs, setShuffledRightPairs] = useState<any[]>([]);
  const [hasMatchingError, setHasMatchingError] = useState(false);

  // === STATE QUẢN LÝ CUSTOM MODAL ===
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'info' | 'warning',
    confirmText: 'Tiếp tục',
    onConfirm: () => { }
  });

  const showModal = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'info' | 'warning',
    confirmText: string,
    onConfirm: () => void
  ) => {
    setModalConfig({ title, message, type, confirmText, onConfirm });
    setModalVisible(true);
  };

  useEffect(() => {
    loadQuiz();
  }, []);

  useEffect(() => {
    if (questions.length > 0 && currentIndex < questions.length) {
      const q = questions[currentIndex];
      const qData = q.questionData || {};

      setAnswerInput('');
      setSelectedLeft(null);
      setMatchedLefts([]);
      setHasMatchingError(false);

      if (q.questionType === 'MULTIPLE_CHOICE' || q.questionType === 'IMAGE_CHOICE') {
        const choices = [qData.answer, ...(qData.distractors || [])];
        setShuffledChoices([...choices].sort(() => Math.random() - 0.5));
      }

      if (q.questionType === 'MATCHING' && qData.pairs) {
        setShuffledLeftPairs([...qData.pairs].sort(() => Math.random() - 0.5));
        setShuffledRightPairs([...qData.pairs].sort(() => Math.random() - 0.5));
      }
    }
  }, [currentIndex, questions]);

  const loadQuiz = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const res = await learnerService.getQuiz(Number(unitId), token!);
      setQuestions(res || []);
    } catch (e) {
      showModal('Lỗi hệ thống', 'Không thể tải danh sách câu hỏi. Vui lòng thử lại sau.', 'error', 'Trở lại', () => {
        setModalVisible(false);
        router.back();
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (isCorrect: boolean, correctAnswerText: string = '') => {
    const title = isCorrect ? 'Chính xác!' : 'Chưa chính xác!';
    const message = isCorrect
      ? 'Tuyệt vời, bạn đã trả lời đúng câu này.'
      : `Đáp án đúng là: ${correctAnswerText}\n\nĐừng buồn, hãy cố gắng ở câu sau nhé!`;
    const type = isCorrect ? 'success' : 'error';

    showModal(title, message, type, 'Tiếp tục', () => {
      setModalVisible(false);

      // Cập nhật điểm
      const nextCorrect = isCorrect ? correctCount + 1 : correctCount;
      const nextWrong = isCorrect ? wrongCount : wrongCount + 1;

      if (isCorrect) setCorrectCount(nextCorrect);
      else setWrongCount(nextWrong);

      // Chuyển câu hoặc Nộp bài
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(prev => prev + 1);
      } else {
        finishQuiz(nextCorrect, nextWrong);
      }
    });
  };

  const finishQuiz = async (finalCorrect: number, finalWrong: number) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const res = await learnerService.submitQuiz({
        unitId: Number(unitId),
        correctCount: finalCorrect,
        wrongCount: finalWrong,
      }, token!);

      setLoading(false);

      // Modal Nộp bài thành công
      showModal(
        'Hoàn thành bài tập',
        `Bạn đã làm xong!\n\nSố câu đúng: ${finalCorrect}\nSố câu sai: ${finalWrong}\n\nTổng điểm hiện tại: ${res.newScore || 0} ⭐`,
        'success',
        'Về trang chủ',
        () => {
          setModalVisible(false);
          router.push('/(tabs)');
        }
      );
    } catch (e: any) {
      setLoading(false);
      console.error("LỖI API:", e);
      showModal('Lỗi nộp bài', 'Không thể đồng bộ điểm số lên server.', 'error', 'Đóng', () => {
        setModalVisible(false);
      });
    }
  };

  const renderQuestionUI = () => {
    if (questions.length === 0) return null;
    const q = questions[currentIndex];
    const qData = q.questionData || {};

    switch (q.questionType) {
      case 'FILL_IN_BLANK': {
        let displaySentence = qData.sentence || '';


        if (displaySentence && !displaySentence.includes('_') && qData.missingWords?.[0]) {
          const regex = new RegExp(qData.missingWords[0], 'i');
          displaySentence = displaySentence.replace(regex, '____');
        } else {
          displaySentence = displaySentence.replace('_', '____');
        }

        return (
          <View style={styles.quizBox}>
            <Text style={styles.questionText}>{displaySentence}</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập câu trả lời của bạn..."
              placeholderTextColor="#9ca3af"
              value={answerInput}
              onChangeText={setAnswerInput}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.btnPrimary}
              activeOpacity={0.8}
              onPress={() => {
                if (!answerInput.trim()) {
                  showModal('Thông báo', 'Vui lòng điền đáp án từ còn thiếu trước khi kiểm tra.', 'warning', 'Đã hiểu', () => setModalVisible(false));
                  return;
                }

                try {
                  let wordsArray: string[] = [];
                  if (Array.isArray(qData.missingWords)) wordsArray = qData.missingWords;
                  else if (typeof qData.missingWords === 'string') wordsArray = [qData.missingWords];

                  const isCorrect = wordsArray.some(
                    (w: string) => w.trim().toLowerCase() === answerInput.trim().toLowerCase()
                  );

                  handleAnswer(isCorrect, wordsArray.join(', '));
                } catch (e) {
                  console.error(e);
                  handleAnswer(false, 'Lỗi dữ liệu');
                }
              }}
            >
              <Text style={styles.btnText}>Kiểm tra câu trả lời</Text>
            </TouchableOpacity>
          </View>
        );
      }

      case 'MULTIPLE_CHOICE':
        return (
          <View style={styles.quizBox}>
            <Text style={styles.questionText}>{qData.question}</Text>
            <View style={styles.choicesContainer}>
              {shuffledChoices.map((choice, i) => (
                <TouchableOpacity
                  key={`choice-${i}`}
                  style={styles.choiceBtn}
                  activeOpacity={0.7}
                  onPress={() => handleAnswer(choice === qData.answer, qData.answer)}
                >
                  <Text style={styles.choiceText}>{choice}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'IMAGE_CHOICE':
        return (
          <View style={styles.quizBox}>
            {qData.imageUrl && (
              <Image source={{ uri: qData.imageUrl }} style={styles.questionImage} />
            )}
            <Text style={styles.questionText}>{qData.question}</Text>
            <View style={styles.choicesContainer}>
              {shuffledChoices.map((choice, i) => (
                <TouchableOpacity
                  key={`img-choice-${i}`}
                  style={styles.choiceBtn}
                  activeOpacity={0.7}
                  onPress={() => handleAnswer(choice === qData.answer, qData.answer)}
                >
                  <Text style={styles.choiceText}>{choice}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'TRUE_FALSE':
        return (
          <View style={styles.quizBox}>
            {qData.imageUrl && (
              <Image source={{ uri: qData.imageUrl }} style={styles.questionImage} />
            )}
            <Text style={styles.questionText}>{qData.caption}</Text>
            <View style={styles.rowButtons}>
              <TouchableOpacity
                style={[styles.choiceBtn, styles.flexButton, styles.trueBtn]}
                activeOpacity={0.7}
                onPress={() => handleAnswer(qData.isTrue === true, qData.isTrue ? 'ĐÚNG (True)' : 'SAI (False)')}
              >
                <Text style={[styles.choiceText, styles.trueText]}>ĐÚNG (True)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.choiceBtn, styles.flexButton, styles.falseBtn]}
                activeOpacity={0.7}
                onPress={() => handleAnswer(qData.isTrue === false, qData.isTrue ? 'ĐÚNG (True)' : 'SAI (False)')}
              >
                <Text style={[styles.choiceText, styles.falseText]}>SAI (False)</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'MATCHING':
        return (
          <View style={styles.quizBox}>
            <Text style={styles.questionText}>Hãy nối các cặp tương ứng:</Text>
            <View style={styles.matchingColumns}>
              {/* Cột trái */}
              <View style={styles.column}>
                {shuffledLeftPairs.map((p: any, i: number) => {
                  const isMatched = matchedLefts.includes(p.left);
                  const isSelected = selectedLeft === p.left;
                  return (
                    <TouchableOpacity
                      key={`left-${i}`}
                      disabled={isMatched}
                      style={[styles.matchBtn, isSelected && styles.matchBtnSelected, isMatched && styles.matchBtnSuccess]}
                      activeOpacity={0.7}
                      onPress={() => setSelectedLeft(p.left)}
                    >
                      <Text style={[styles.matchText, isMatched && styles.textWhite]}>{p.left}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Cột phải */}
              <View style={styles.column}>
                {shuffledRightPairs.map((p: any, i: number) => {
                  const targetLeft = qData.pairs?.find((pair: any) => pair.right === p.right)?.left;
                  const isMatched = matchedLefts.includes(targetLeft);

                  return (
                    <TouchableOpacity
                      key={`right-${i}`}
                      disabled={isMatched}
                      style={[styles.matchBtn, isMatched && styles.matchBtnSuccess]}
                      activeOpacity={0.7}
                      onPress={() => {
                        if (!selectedLeft) {
                          showModal('Thông báo', 'Vui lòng chọn một từ ở cột bên trái trước.', 'warning', 'Đã hiểu', () => setModalVisible(false));
                          return;
                        }

                        if (targetLeft === selectedLeft) {
                          const updatedMatched = [...matchedLefts, selectedLeft];
                          setMatchedLefts(updatedMatched);
                          setSelectedLeft(null);

                          if (updatedMatched.length === qData.pairs?.length) {
                            handleAnswer(!hasMatchingError, "Các cặp nối phải được hoàn thành chính xác ngay từ đầu.");
                          }
                        } else {
                          setHasMatchingError(true);
                          setSelectedLeft(null);
                          // Lỗi từng cặp lẻ thì vẫn giữ nguyên Modal màu đỏ nhỏ để người ta nối lại
                          showModal('Chưa chính xác', 'Cặp nghĩa không khớp, bạn hãy thử lại cặp khác nhé.', 'error', 'Thử lại', () => setModalVisible(false));
                        }
                      }}
                    >
                      <Text style={[styles.matchText, isMatched && styles.textWhite]}>{p.right}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        );

      default:
        return <Text style={styles.errorText}>Dạng câu hỏi chưa hỗ trợ.</Text>;
    }
  };

  if (loading && questions.length === 0) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <CustomHeader title="Đang tải dữ liệu" />
        <ActivityIndicator style={styles.centeredLoader} size="large" color="#3b82f6" />
      </View>
    );
  }

  const progressPercent = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <CustomHeader title={`Câu hỏi ôn tập ${currentIndex + 1}/${questions.length}`} />
      <CustomModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
        confirmText={modalConfig.confirmText}
      />

      <ResponsiveWrapper contentContainerStyle={styles.scrollContent}>
        {loading && questions.length > 0 ? (
          <ActivityIndicator style={{ marginTop: 50 }} size="large" color="#3b82f6" />
        ) : questions.length > 0 ? (
          <>
            <View style={styles.progressTrack}>
              <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
            </View>
            <View style={styles.card}>
              {renderQuestionUI()}
            </View>
          </>
        ) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Chưa có câu hỏi nào trong bài học này.</Text>
          </View>
        )}
      </ResponsiveWrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  scrollContent: { padding: Platform.OS === 'web' ? 30 : 16, paddingBottom: 50 },
  centeredLoader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  progressTrack: { height: 10, backgroundColor: '#e5e7eb', borderRadius: 6, overflow: 'hidden', marginBottom: 20 },
  progressBar: { height: '100%', backgroundColor: '#3b82f6', borderRadius: 6 },
  card: { backgroundColor: 'white', borderRadius: 16, padding: Platform.OS === 'web' ? 30 : 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 3 },
  quizBox: { width: '100%' },
  questionText: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 24, lineHeight: 28 },
  questionImage: { width: '100%', height: Platform.OS === 'web' ? 320 : 220, borderRadius: 12, marginBottom: 20, resizeMode: 'cover' },
  input: { borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, padding: 16, fontSize: 16, color: '#111827', backgroundColor: '#f9fafb', marginBottom: 20 },
  btnPrimary: { backgroundColor: '#3b82f6', paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: 'white', fontSize: 16, fontWeight: '700' },
  choicesContainer: { gap: 12 },
  choiceBtn: { backgroundColor: 'white', borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center' },
  choiceText: { fontSize: 16, color: '#374151', fontWeight: '500' },
  rowButtons: { flexDirection: 'row', gap: 12 },
  flexButton: { flex: 1, justifyContent: 'center', paddingVertical: 18 },
  trueBtn: { borderColor: '#d1fae5', backgroundColor: '#f0fdf4' },
  trueText: { color: '#16a34a', fontWeight: '700' },
  falseBtn: { borderColor: '#fee2e2', backgroundColor: '#fef2f2' },
  falseText: { color: '#dc2626', fontWeight: '700' },
  matchingColumns: { flexDirection: 'row', gap: 16 },
  column: { flex: 1, gap: 12 },
  matchBtn: { backgroundColor: 'white', borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, padding: 16, alignItems: 'center', justifyContent: 'center', minHeight: 55 },
  matchBtnSelected: { borderColor: '#3b82f6', backgroundColor: '#eff6ff', borderWidth: 2 },
  matchBtnSuccess: { backgroundColor: '#10b981', borderColor: '#10b981' },
  matchText: { fontSize: 15, color: '#374151', fontWeight: '500', textAlign: 'center' },
  textWhite: { color: 'white', fontWeight: '700' },
  emptyBox: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#6b7280', fontSize: 16, textAlign: 'center' },
  errorText: { color: '#ef4444', textAlign: 'center', fontSize: 16 },
});