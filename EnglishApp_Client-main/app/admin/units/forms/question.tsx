
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import CustomHeader from '../../../../components/common/CustomHeader';
import ResponsiveWrapper from '../../../../components/common/ResponsiveWrapper';
import { unitService } from '../../../../services/unitService';

type QType = 'FILL_IN_BLANK' | 'MATCHING' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'IMAGE_CHOICE';

export default function AddOrEditQuestionForm() {
  const { unitId, questionId } = useLocalSearchParams();
  const router = useRouter();

  const isEditMode = !!questionId;

  const [qType, setQType] = useState<QType>('FILL_IN_BLANK');
  const [explanation, setExplanation] = useState('');
  const [imageUri, setImageUri] = useState('');

  // State tổng hợp cho các loại câu hỏi
  const [formState, setFormState] = useState({
    sentence: '', missingWordsStr: '',
    questionText: '', correctAnswer: '', distractorsStr: '',
    isTrue: true, captionText: '',
    pairs: [{ left: '', right: '' }] 
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);

  useEffect(() => {
    if (isEditMode) {
      const fetchDetail = async () => {
        try {
          const token = await AsyncStorage.getItem('userToken');
          const res = await unitService.getQuestionById(Number(questionId), token!);

          // Kiểm tra log xem res.data thực sự chứa gì
          console.log("Dữ liệu từ API:", res.data);

          if (res.code === 200 && res.data) {
            const data = res.data;

            // Đảm bảo khớp giá trị với QType trong code: FILL_IN_BLANK, TRUE_FALSE, v.v.
            setQType(data.questionType as QType);
            setExplanation(data.explanation || '');

            // 2. PARSE QUESTION DATA
            let qData;
            try {
              // Nếu data.questionData đã là object thì dùng luôn, nếu là string thì parse
              qData = typeof data.questionData === 'string'
                ? JSON.parse(data.questionData)
                : data.questionData;
            } catch (e) {
              console.error("Lỗi JSON:", e);
              qData = {};
            }

            // 3. CẬP NHẬT FORM STATE
            setFormState({
              sentence: qData.sentence || '',
              missingWordsStr: qData.missingWords ? qData.missingWords.join(', ') : '',
              questionText: qData.question || '',
              correctAnswer: qData.answer || '',
              distractorsStr: qData.distractors ? qData.distractors.join(', ') : '',
              isTrue: qData.isTrue !== undefined ? qData.isTrue : true,
              captionText: qData.caption || '',
              pairs: qData.pairs || [{ left: '', right: '' }]
            });

            if (qData.imageUrl) setImageUri(qData.imageUrl);
          }
        } catch (error) {
          console.error("Lỗi fetch chi tiết:", error);
        }
      };
      fetchDetail();
    }
  }, [questionId]); 
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      let finalCloudUrl = imageUri;

      // Upload ảnh nếu cần
      if ((qType === 'TRUE_FALSE' || qType === 'IMAGE_CHOICE') && imageUri && !imageUri.startsWith('http')) {
        const sigRes = await unitService.getCloudinarySignature(`question_${Date.now()}`);
        const cloudRes = await unitService.uploadToCloudinary(imageUri, sigRes.data, `question_${Date.now()}`, 'english_questions');
        finalCloudUrl = cloudRes.secure_url;
      }
      let questionData: any = {};

      switch (qType) {
        case 'FILL_IN_BLANK':
          questionData = { sentence: formState.sentence, missingWords: formState.missingWordsStr.split(',').map(s => s.trim()) };
          break;
        case 'MATCHING':
          questionData = { pairs: formState.pairs };
          break;
        case 'MULTIPLE_CHOICE':
          questionData = { question: formState.questionText, answer: formState.correctAnswer, distractors: formState.distractorsStr.split(',').map(s => s.trim()) };
          break;
        case 'TRUE_FALSE':
          questionData = { imageUrl: finalCloudUrl, caption: formState.captionText, isTrue: formState.isTrue };
          break;
        case 'IMAGE_CHOICE':
          questionData = { imageUrl: finalCloudUrl, question: formState.questionText, answer: formState.correctAnswer, distractors: formState.distractorsStr.split(',').map(s => s.trim()) };
          break;
      }

      const payload = { questionType: qType, explanation, questionData };
      const res = isEditMode
        ? await unitService.updateQuestion(Number(questionId), token!, payload)
        : await unitService.addQuestion(Number(unitId), token!, payload);

      if (res.code === 200) router.back();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };


  return (
    <View style={styles.container}>
      <CustomHeader title={isEditMode ? "Chỉnh sửa câu hỏi" : "Tạo câu hỏi mới"} />
      <ResponsiveWrapper contentContainerStyle={styles.contentWrapper}>
        <View style={styles.card}>
          <Text style={styles.label}>Loại câu hỏi:</Text>
          <View style={styles.typeSelector}>
            {(['FILL_IN_BLANK', 'MATCHING', 'MULTIPLE_CHOICE', 'TRUE_FALSE', 'IMAGE_CHOICE'] as QType[]).map(type => (
              <TouchableOpacity key={type} onPress={() => setQType(type)} style={[styles.typeBtn, qType === type && styles.typeBtnActive]}>
                <Text style={qType === type ? styles.typeTextActive : styles.typeText}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Render inputs tùy theo loại */}
          {qType === 'FILL_IN_BLANK' && (
            <>
              <TextInput style={styles.input} placeholder="Câu văn (dùng _ đục lỗ)..." value={formState.sentence} onChangeText={t => setFormState({ ...formState, sentence: t })} />
              <TextInput style={styles.input} placeholder="Từ đáp án (dấu phẩy)..." value={formState.missingWordsStr} onChangeText={t => setFormState({ ...formState, missingWordsStr: t })} />
            </>
          )}

          {(qType === 'MULTIPLE_CHOICE' || qType === 'IMAGE_CHOICE') && (
            <>
              {(qType === 'IMAGE_CHOICE') && (
                <TouchableOpacity style={styles.imagePicker} onPress={async () => {
                  const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true });
                  if (!res.canceled) setImageUri(res.assets[0].uri);
                }}>
                  {imageUri ? <Image source={{ uri: imageUri }} style={styles.imagePreview} /> : <Text>Chọn ảnh minh họa</Text>}
                </TouchableOpacity>
              )}
              <TextInput style={styles.input} placeholder="Câu hỏi..." value={formState.questionText} onChangeText={t => setFormState({ ...formState, questionText: t })} />
              <TextInput style={styles.input} placeholder="Đáp án đúng..." value={formState.correctAnswer} onChangeText={t => setFormState({ ...formState, correctAnswer: t })} />
              <TextInput style={styles.input} placeholder="Đáp án sai (dấu phẩy)..." value={formState.distractorsStr} onChangeText={t => setFormState({ ...formState, distractorsStr: t })} />
            </>
          )}

          {qType === 'MATCHING' && (
            formState.pairs.map((pair, idx) => (
              <View key={idx} style={{ flexDirection: 'row', gap: 5 }}>
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="Trái" value={pair.left} onChangeText={t => {
                  const newP = [...formState.pairs]; newP[idx].left = t; setFormState({ ...formState, pairs: newP });
                }} />
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="Phải" value={pair.right} onChangeText={t => {
                  const newP = [...formState.pairs]; newP[idx].right = t; setFormState({ ...formState, pairs: newP });
                }} />
              </View>
            ))
          )}

          {qType === 'TRUE_FALSE' && (
            <>
              <TouchableOpacity style={styles.imagePicker} onPress={async () => {
                const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true });
                if (!res.canceled) setImageUri(res.assets[0].uri);
              }}>
                {imageUri ? <Image source={{ uri: imageUri }} style={styles.imagePreview} /> : <Text>Chọn ảnh minh họa</Text>}
              </TouchableOpacity>
              <TextInput style={styles.input} placeholder="Caption..." value={formState.captionText} onChangeText={t => setFormState({ ...formState, captionText: t })} />
              <TouchableOpacity onPress={() => setFormState({ ...formState, isTrue: !formState.isTrue })} style={styles.checkbox}>
                <Text>Đáp án hiện tại: {formState.isTrue ? 'ĐÚNG' : 'SAI'}</Text>
              </TouchableOpacity>
            </>
          )}

          <TextInput style={styles.input} placeholder="Giải thích..." value={explanation} onChangeText={setExplanation} multiline />

          <TouchableOpacity style={styles.btnSave} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnSaveText}>{isEditMode ? 'Cập nhật' : 'Lưu câu hỏi'}</Text>}
          </TouchableOpacity>
        </View>
      </ResponsiveWrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  contentWrapper: { padding: 20 },
  card: { backgroundColor: 'white', padding: 25, borderRadius: 12, gap: 15 },
  label: { fontSize: 14, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12 },
  typeSelector: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  typeBtn: { padding: 8, borderRadius: 8, backgroundColor: '#f3f4f6' },
  typeBtnActive: { backgroundColor: '#3b82f6' },
  typeText: { color: '#4b5563', fontSize: 12 },
  typeTextActive: { color: 'white', fontSize: 12 },
  btnSave: { backgroundColor: '#3b82f6', padding: 16, borderRadius: 8, alignItems: 'center' },
  btnSaveText: { color: 'white', fontWeight: 'bold' },
  imagePicker: { height: 150, backgroundColor: '#f9fafb', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8 },
  imagePreview: { width: '100%', height: '100%', borderRadius: 8 },
  checkbox: { padding: 12, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, alignItems: 'center' }
});