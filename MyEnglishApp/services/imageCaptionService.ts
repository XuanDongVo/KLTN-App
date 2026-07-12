import AsyncStorage from '@react-native-async-storage/async-storage';

import { CaptionResult } from '@/types/learning';

const API_URL = process.env.EXPO_PUBLIC_API_URL?.trim();
const mockCaptions = [
  { caption: 'This is a school object.', objects: ['school object'] },
  { caption: 'This is a colorful book.', objects: ['book'] },
  { caption: 'I can see a pencil on the desk.', objects: ['pencil', 'desk'] },
];

export async function createImageCaption(uri: string): Promise<CaptionResult> {
  if (API_URL) {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const form = new FormData();
      form.append('image', { uri, name: 'photo-mission.jpg', type: 'image/jpeg' } as unknown as Blob);
      const response = await fetch(`${API_URL.replace(/\/$/, '')}/learner/image-caption`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: form,
      });
      if (response.ok) {
        const data = await response.json();
        return { caption: data.caption, confidence: data.confidence, objects: data.objects, source: 'backend' };
      }
    } catch {
      // Fall through to the local adapter while the separate AI service is unavailable.
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 900));
  const selected = mockCaptions[Math.floor(Math.random() * mockCaptions.length)];
  return { ...selected, confidence: 0.92, source: 'mock' };
}
