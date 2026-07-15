import * as ImagePicker from 'expo-image-picker';

import { adminOperationsService } from '@/services/adminOperationsService';
import type { AdminMediaAsset } from '@/types/adminOperations';

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const maxBytes = 5 * 1024 * 1024;

export async function pickAndUploadAdminImage(): Promise<AdminMediaAsset | undefined> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) throw new Error('Cần quyền truy cập thư viện ảnh để tải ảnh lên.');

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 0.88,
  });
  if (result.canceled) return undefined;
  const asset = result.assets[0];
  const contentType = asset.mimeType ?? mimeFromName(asset.fileName ?? asset.uri);
  const fileName = asset.fileName ?? `curriculum-${Date.now()}.${extensionFor(contentType)}`;
  if (!allowedTypes.has(contentType)) throw new Error('Chỉ hỗ trợ ảnh JPEG, PNG hoặc WebP.');
  if (asset.fileSize && asset.fileSize > maxBytes) throw new Error('Ảnh phải nhỏ hơn 5 MB.');

  const signature = await adminOperationsService.getMediaSignature(fileName, contentType);
  const fields = signature.fields;
  const form = new FormData();
  for (const key of ['api_key', 'timestamp', 'folder', 'public_id', 'signature']) {
    form.append(key, String(fields[key]));
  }
  form.append('file', { uri: asset.uri, name: fileName, type: contentType } as unknown as Blob);

  const response = await fetch(String(fields.upload_url), { method: 'POST', body: form });
  const uploaded = await response.json() as {
    public_id?: string;
    secure_url?: string;
    width?: number;
    height?: number;
    bytes?: number;
    error?: { message?: string };
  };
  if (!response.ok || !uploaded.public_id || !uploaded.secure_url) {
    throw new Error(uploaded.error?.message || 'Cloudinary không thể tải ảnh lên.');
  }
  return adminOperationsService.registerMedia({
    publicId: uploaded.public_id,
    secureUrl: uploaded.secure_url,
    originalFileName: fileName,
    contentType,
    width: uploaded.width ?? asset.width,
    height: uploaded.height ?? asset.height,
    bytes: uploaded.bytes ?? asset.fileSize ?? 1,
  });
}

function mimeFromName(name: string): string {
  const lower = name.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

function extensionFor(contentType: string): string {
  if (contentType === 'image/png') return 'png';
  if (contentType === 'image/webp') return 'webp';
  return 'jpg';
}
