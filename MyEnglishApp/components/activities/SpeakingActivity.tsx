import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import * as Speech from 'expo-speech';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { ActionButton } from '@/components/ui/ActionButton';
import { Theme } from '@/constants/Theme';

type Props = {
  phrase: string;
  instruction?: string;
  onComplete: (recordingUri: string) => void;
};

export function SpeakingActivity({ phrase, instruction, onComplete }: Props) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 150);
  const player = useAudioPlayer(null);
  const playerState = useAudioPlayerStatus(player);
  const [recordingUri, setRecordingUri] = useState<string>();
  const [busy, setBusy] = useState(false);

  const startRecording = async () => {
    setBusy(true);
    try {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Cần quyền micro', 'Hãy cho phép Fun English dùng micro để con luyện nói nhé.');
        return;
      }
      Speech.stop();
      player.pause();
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setRecordingUri(undefined);
    } catch {
      Alert.alert('Chưa thể bật micro', 'Con hãy kiểm tra quyền micro rồi thử lại nhé.');
    } finally {
      setBusy(false);
    }
  };

  const stopRecording = async () => {
    setBusy(true);
    try {
      await recorder.stop();
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
      if (recorder.uri) {
        setRecordingUri(recorder.uri);
        player.replace({ uri: recorder.uri });
      }
    } catch {
      Alert.alert('Chưa lưu được giọng nói', 'Con thử ghi âm lại một lần nữa nhé.');
    } finally {
      setBusy(false);
    }
  };

  const playSample = () => {
    Speech.stop();
    Speech.speak(phrase, { language: 'en-US', rate: 0.78, pitch: 1.05 });
  };

  const playRecording = async () => {
    if (!recordingUri) return;
    await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
    if (playerState.didJustFinish || playerState.currentTime >= playerState.duration) {
      await player.seekTo(0);
    }
    player.play();
  };

  const seconds = Math.max(0, Math.round(recorderState.durationMillis / 1000));

  return <View style={styles.container}>
    <Pressable onPress={playSample} style={styles.sampleButton} accessibilityRole="button" accessibilityLabel="Nghe câu mẫu">
      <MaterialCommunityIcons name="volume-high" size={25} color={Theme.colors.blueDark} />
      <Text style={styles.sampleText}>Nghe câu mẫu</Text>
    </Pressable>

    <View style={[styles.micCircle, recorderState.isRecording && styles.micRecording]}>
      <MaterialCommunityIcons name={recorderState.isRecording ? 'waveform' : 'microphone'} size={46} color={recorderState.isRecording ? '#FFFFFF' : Theme.colors.coral} />
    </View>
    <Text style={styles.phrase}>{phrase}</Text>
    <Text style={styles.helper}>{recorderState.isRecording ? `Đang ghi âm ${seconds} giây` : recordingUri ? 'Tuyệt lắm! Con có thể nghe lại trước khi nộp.' : instruction ?? 'Chạm nút micro và đọc thật rõ.'}</Text>

    {recorderState.isRecording
      ? <ActionButton label="Dừng ghi âm" icon="stop" color={Theme.colors.coral} onPress={stopRecording} disabled={busy || recorderState.durationMillis < 700} />
      : <ActionButton label={recordingUri ? 'Ghi âm lại' : 'Bắt đầu ghi âm'} icon="microphone" color={Theme.colors.coral} onPress={startRecording} disabled={busy} />}

    {recordingUri && !recorderState.isRecording && <View style={styles.reviewRow}>
      <Pressable onPress={playRecording} style={styles.reviewButton} accessibilityRole="button">
        <MaterialCommunityIcons name={playerState.playing ? 'volume-high' : 'play'} size={23} color={Theme.colors.blueDark} />
        <Text style={styles.reviewText}>{playerState.playing ? 'Đang phát...' : 'Nghe lại'}</Text>
      </Pressable>
      <Pressable onPress={() => onComplete(recordingUri)} style={styles.submitButton} accessibilityRole="button">
        <MaterialCommunityIcons name="check" size={23} color="#FFFFFF" />
        <Text style={styles.submitText}>Nộp bài nói</Text>
      </Pressable>
    </View>}
    <Text style={styles.note}>Bản ghi chỉ dùng cho hoạt động luyện nói này.</Text>
  </View>;
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 14 },
  sampleButton: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, borderRadius: 8, borderWidth: 2, borderColor: '#B9E3F8', backgroundColor: '#EAF7FE' },
  sampleText: { color: Theme.colors.blueDark, fontSize: 15, fontWeight: '900' },
  micCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#FFF0EF', borderWidth: 3, borderColor: '#FFD0CD', alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  micRecording: { backgroundColor: Theme.colors.coral, borderColor: Theme.colors.coralDark },
  phrase: { color: Theme.colors.ink, fontSize: 24, lineHeight: 32, fontWeight: '900', textAlign: 'center' },
  helper: { minHeight: 40, color: Theme.colors.muted, fontSize: 14, lineHeight: 20, textAlign: 'center' },
  reviewRow: { width: '100%', flexDirection: 'row', gap: 10 },
  reviewButton: { flex: 1, minHeight: 54, borderRadius: 8, borderWidth: 2, borderColor: '#B9E3F8', backgroundColor: '#EAF7FE', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  reviewText: { color: Theme.colors.blueDark, fontWeight: '900' },
  submitButton: { flex: 1.4, minHeight: 54, borderRadius: 8, backgroundColor: Theme.colors.green, borderBottomWidth: 4, borderBottomColor: Theme.colors.greenDark, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  submitText: { color: '#FFFFFF', fontWeight: '900' },
  note: { color: Theme.colors.muted, fontSize: 11, lineHeight: 16, textAlign: 'center' },
});
