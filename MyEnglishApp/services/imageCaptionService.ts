import AsyncStorage from '@react-native-async-storage/async-storage';

import { CaptionResult } from '@/types/learning';

const API_URL = process.env.EXPO_PUBLIC_API_URL?.trim();
const AI_URL = process.env.EXPO_PUBLIC_AI_URL?.trim() || API_URL?.replace(':8080', ':8000') || 'http://10.0.2.2:8000';
const mockCaptions = [
  { caption: 'This is a school object.', objects: ['school object'] },
  { caption: 'This is a colorful book.', objects: ['book'] },
  { caption: 'I can see a pencil on the desk.', objects: ['pencil', 'desk'] },
];

export async function createImageCaption(uri: string): Promise<CaptionResult> {
  if (AI_URL) {
    try {
      const userId = await AsyncStorage.getItem('userId') || 'anonymous';
      const timestamp = new Date().getTime();
      const uniqueFileName = `${userId}_${timestamp}.jpg`;

      const form = new FormData();
      form.append('file', { uri, name: uniqueFileName, type: 'image/jpeg' } as unknown as Blob);
      const response = await fetch(`${AI_URL.replace(/\/$/, '')}/v1/predict`, {
        method: 'POST',
        body: form,
      });
      if (response.ok) {
        const data = await response.json();
        return { caption: data.caption, confidence: data.confidence, objects: data.objects || [], source: 'backend' };
      }
    } catch (error) {
      console.warn('AI Model connection failed:', error);
      // Fall through to the local adapter while the separate AI service is unavailable.
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 900));
  const selected = mockCaptions[Math.floor(Math.random() * mockCaptions.length)];
  return { ...selected, confidence: 0.92, source: 'mock' };
}
