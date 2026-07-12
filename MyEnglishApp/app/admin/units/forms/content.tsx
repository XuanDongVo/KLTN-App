
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import CustomHeader from '../../../../components/common/CustomHeader';
import ResponsiveWrapper from '../../../../components/common/ResponsiveWrapper';
import { unitService } from '../../../../services/unitService';

export default function AddOrEditContentForm() {
  const { unitId, contentId } = useLocalSearchParams();
  const router = useRouter();
  
  const isEditMode = !!contentId;

  const [imageUri, setImageUri] = useState('');
  const [caption, setCaption] = useState('');
  const [grammar, setGrammar] = useState('');
  const [vocabularies, setVocabularies] = useState([{ word: '', type: '', example: '' }]);
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);

  useEffect(() => {
    if (isEditMode) {
      const fetchDetail = async () => {
        try {
          const token = await AsyncStorage.getItem('userToken') || '';
          const res = await unitService.getUnitContentById(Number(contentId), token);
          
          if (res.code === 200 && res.data) {
            const data = res.data;
            setImageUri(data.imageUrl || '');
            setCaption(data.finalCaption || '');
            setGrammar(data.grammarStructure || '');
            
            if (data.vocabularies && Array.isArray(data.vocabularies) && data.vocabularies.length > 0) {
              setVocabularies(data.vocabularies);
            }
          }
        } catch (error) {
          console.error("Lỗi tải chi tiết:", error);
        } finally {
          setInitialLoading(false);
        }
      };
      fetchDetail();
    }
  }, [contentId, isEditMode]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setCaption('');
      setGrammar('');
      setVocabularies([{ word: '', type: '', example: '' }]);
    }
  };

  const handleAddVocab = () => {
    setVocabularies([...vocabularies, { word: '', type: '', example: '' }]);
  };

  const handleRemoveVocab = (index: number) => {
    const newVocabs = [...vocabularies];
    newVocabs.splice(index, 1);
    setVocabularies(newVocabs);
  };

  const updateVocab = (text: string, index: number, field: 'word' | 'type' | 'example') => {
    const newVocabs = [...vocabularies];
    newVocabs[index] = { ...newVocabs[index], [field]: text };
    setVocabularies(newVocabs);
  };

  const handleSubmit = async () => {
    if (!imageUri || !caption) {
      alert("Vui lòng chọn hình ảnh và nhập caption.");
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) throw new Error("Không tìm thấy token");

      let uploadedImageUrl = imageUri;

      if (!imageUri.startsWith('http')) {
        const fileName = `unit_${unitId}_${Date.now()}.jpg`;
        const sigData = await unitService.getCloudinarySignature(fileName);
        const uploadResult = await unitService.uploadToCloudinary(imageUri, sigData, fileName, 'english_units');
        uploadedImageUrl = uploadResult.secure_url;
      }

      const validVocabs = vocabularies.filter(v => v.word.trim() !== '');

      const payload = {
        imageUrl: uploadedImageUrl,
        finalCaption: caption,
        grammarStructure: grammar,
        vocabularies: validVocabs
      };

      let response;
      if (isEditMode) {
        response = await unitService.updateUnitContent(Number(contentId), token, payload);
      } else {
        response = await unitService.addUnitContent(Number(unitId), token, payload);
      }
      
      if (response.code === 200 || response.data) {
        router.back();
      } else {
        alert("Lỗi lưu nội dung: " + response.message);
      }
    } catch (error: any) {
      alert("Lỗi hệ thống: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomHeader title={isEditMode ? "Chỉnh sửa nội dung" : "Tạo nội dung bài học mới"} />
      
      <ResponsiveWrapper contentContainerStyle={styles.contentWrapper}>
        <View style={styles.card}>
          <Text style={styles.info}>Bài học áp dụng: Unit {unitId}</Text>
          
          <View style={styles.group}>
            <Text style={styles.label}>Hình ảnh minh họa</Text>
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera-outline" size={32} color="#9ca3af" />
                  <Text style={styles.imagePlaceholderText}>Nhấn để chọn ảnh</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.group}>
            <Text style={styles.label}>Câu Caption chính</Text>
            <TextInput style={styles.input} placeholder="Nhập câu mô tả..." value={caption} onChangeText={setCaption} />
          </View>

          <View style={styles.group}>
            <Text style={styles.label}>Cấu trúc ngữ pháp</Text>
            <TextInput style={styles.input} placeholder="Ví dụ: Present Simple..." value={grammar} onChangeText={setGrammar} />
          </View>

          <View style={styles.vocabSection}>
            <Text style={styles.sectionTitle}>Danh sách từ vựng đính kèm</Text>
            
            {vocabularies.map((vocab, index) => (
              <View key={index} style={styles.vocabBox}>
                <View style={styles.vocabHeader}>
                  <Text style={styles.vocabIndex}>Từ vựng #{index + 1}</Text>
                  {vocabularies.length > 1 && (
                    <TouchableOpacity onPress={() => handleRemoveVocab(index)}>
                      <Ionicons name="trash-outline" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                </View>
                
                <View style={styles.row}>
                  <View style={styles.flex2}>
                    <TextInput 
                      style={styles.input} 
                      placeholder="Từ tiếng Anh" 
                      value={vocab.word}
                      onChangeText={(text) => updateVocab(text, index, 'word')}
                    />
                  </View>
                  <View style={styles.flex1}>
                    <TextInput 
                      style={styles.input} 
                      placeholder="Loại từ" 
                      value={vocab.type}
                      onChangeText={(text) => updateVocab(text, index, 'type')}
                    />
                  </View>
                </View>

                <TextInput 
                  style={[styles.input, { marginTop: 10 }]} 
                  placeholder="Ví dụ" 
                  value={vocab.example}
                  onChangeText={(text) => updateVocab(text, index, 'example')}
                />
              </View>
            ))}

            <TouchableOpacity style={styles.btnAddVocab} onPress={handleAddVocab}>
              <Ionicons name="add-circle-outline" size={20} color="#3b82f6" />
              <Text style={styles.btnAddVocabText}>Thêm từ vựng</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.btnSave} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnSaveText}>{isEditMode ? 'Cập nhật' : 'Lưu thông tin'}</Text>}
          </TouchableOpacity>
        </View>
      </ResponsiveWrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f4f6' },
  contentWrapper: { padding: 20 },
  card: { backgroundColor: 'white', padding: 25, borderRadius: 12, elevation: 2 },
  info: { fontSize: 15, color: '#3b82f6', fontWeight: 'bold', marginBottom: 20 },
  group: { marginBottom: 18 },
  label: { fontSize: 15, fontWeight: '600', color: '#4b5563', marginBottom: 8 },
  input: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12, fontSize: 15 },
  imagePicker: { height: 150, backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, overflow: 'hidden', borderStyle: 'dashed' },
  imagePreview: { width: '100%', height: '100%' },
  imagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imagePlaceholderText: { color: '#9ca3af', marginTop: 8 },
  vocabSection: { marginTop: 10, marginBottom: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 15 },
  vocabBox: { backgroundColor: '#f8fafc', padding: 15, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#e2e8f0' },
  vocabHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  vocabIndex: { fontSize: 14, fontWeight: 'bold', color: '#64748b' },
  row: { flexDirection: 'row', gap: 10 },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  btnAddVocab: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 8, backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe', borderStyle: 'dashed' },
  btnAddVocabText: { color: '#3b82f6', fontWeight: 'bold', marginLeft: 8 },
  btnSave: { backgroundColor: '#10b981', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  btnSaveText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});