import AsyncStorage from '@react-native-async-storage/async-storage';
const BASE_URL = process.env.EXPO_PUBLIC_API_URL?.trim() || 'http://10.0.2.2:8080';

export type CloudinarySignature = {
  result: boolean;
  signature?: string;
  timestamp?: number;
  folder?: string;
  public_id?: string;
  api_key?: string;
  cloud_name?: string;
  upload_url?: string;
};

export const getUploadSignature = async (userId: string, extension: string): Promise<CloudinarySignature> => {
  const token = await AsyncStorage.getItem('userToken');
  const filename = `photo_${Date.now()}.${extension}`;
  
  const response = await fetch(`${BASE_URL}/upload/get-upload-url?folder=users/${userId}&fileName=${filename}&contentType=image/${extension}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get upload signature');
  }

  return response.json();
};

export const uploadToCloudinary = async (imageUri: string, signatureData: CloudinarySignature): Promise<string> => {
  if (!signatureData.signature) {
    throw new Error('Invalid signature data');
  }

  const cloudName = 'doqfquxtc';
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'photo.jpg',
  } as any);

  formData.append('api_key', signatureData.api_key!);
  formData.append('timestamp', signatureData.timestamp!.toString());
  formData.append('signature', signatureData.signature);
  formData.append('folder', signatureData.folder!);
  formData.append('public_id', signatureData.public_id!);

  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to upload image to Cloudinary');
  }

  const result = await response.json();
  return result.secure_url;
};
