import AsyncStorage from '@react-native-async-storage/async-storage';

import type {
  AccountStatus,
  AdminDashboard,
  AdminMediaAsset,
  AdminUserDetail,
  AdminUserPage,
  CloudinarySignature,
} from '@/types/adminOperations';

const API_URL = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/$/, '') ?? '';
type ServerResponse<T> = { code: number; message: string; data: T };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_URL) throw new Error('Chưa cấu hình địa chỉ máy chủ.');
  const token = await AsyncStorage.getItem('userToken');
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
  } catch {
    throw new Error('Không thể kết nối máy chủ. Hãy kiểm tra Wi-Fi và địa chỉ API.');
  }
  const payload = await response.json() as ServerResponse<T>;
  if (!response.ok) throw new Error(payload.message || 'Yêu cầu quản trị không thành công.');
  return payload.data;
}

const json = (method: string, body?: unknown): RequestInit => ({
  method,
  body: body === undefined ? undefined : JSON.stringify(body),
});

export const adminOperationsService = {
  getDashboard: () => request<AdminDashboard>('/api/admin/dashboard'),
  getUsers: (search = '', status?: AccountStatus, page = 0, size = 20) => {
    const params = new URLSearchParams({ search, page: String(page), size: String(size) });
    if (status) params.set('status', status);
    return request<AdminUserPage>(`/api/admin/users?${params.toString()}`);
  },
  getUser: (userId: string) => request<AdminUserDetail>(`/api/admin/users/${userId}`),
  updateUserStatus: (userId: string, status: AccountStatus) => request<AdminUserDetail>(`/api/admin/users/${userId}/status`, json('PUT', { status })),
  getMedia: () => request<AdminMediaAsset[]>('/api/admin/media'),
  getMediaSignature: (fileName: string, contentType: string) => request<CloudinarySignature>('/api/admin/media/signature', json('POST', { fileName, contentType })),
  registerMedia: (body: Omit<AdminMediaAsset, 'id' | 'createdAt'>) => request<AdminMediaAsset>('/api/admin/media', json('POST', body)),
};
