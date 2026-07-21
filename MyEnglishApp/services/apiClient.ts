import AsyncStorage from '@react-native-async-storage/async-storage';
import { refreshTokenApi } from './authService';

export const API_URL = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/$/, '') ?? '';

export type ServerResponse<T> = { code: number; message: string; data: T };

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_URL) throw new Error('Chưa cấu hình địa chỉ máy chủ.');
  
  let token = await AsyncStorage.getItem('userToken');
  if (!token) throw new Error('Phiên đăng nhập đã hết hạn.');

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(init?.headers ?? {}),
      },
    });
    
    if (response.status === 401 || response.status === 403) {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const refreshRes = await refreshTokenApi(refreshToken);
          token = refreshRes.data.jwtToken;
          await AsyncStorage.setItem('userToken', token);
          if (refreshRes.data.refreshToken) {
            await AsyncStorage.setItem('refreshToken', refreshRes.data.refreshToken);
          }
          response = await fetch(`${API_URL}${path}`, {
            ...init,
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
              ...(init?.headers ?? {}),
            },
          });
        } catch (refreshErr) {
          await AsyncStorage.multiRemove(['userId', 'userToken', 'userRole', 'userEmail', 'refreshToken']);
          throw new Error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.');
        }
      } else {
        await AsyncStorage.multiRemove(['userId', 'userToken', 'userRole', 'userEmail', 'refreshToken']);
        throw new Error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.');
      }
    }
  } catch (err: any) {
    if (err.message && err.message.includes('Phiên đăng nhập')) throw err;
    throw new Error('Không thể kết nối máy chủ. Hãy kiểm tra Wi-Fi và địa chỉ API.');
  }

  const payload = (await response.json()) as ServerResponse<T>;
  if (!response.ok) throw new Error(payload.message || 'Yêu cầu không thành công.');
  return payload.data;
}
