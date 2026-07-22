import AsyncStorage from '@react-native-async-storage/async-storage';

import type {
  AccountStatus,
  AdminDashboard,
  AdminMediaAsset,
  AdminUserDetail,
  AdminUserPage,
  CloudinarySignature,
} from '@/types/adminOperations';

import { request } from './apiClient';
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
