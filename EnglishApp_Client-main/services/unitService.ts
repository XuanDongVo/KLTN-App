import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;


const getToken = async () => {
  return await AsyncStorage.getItem('userToken');
};

export const unitService = {

  getDashboardStats: async () => {
    const token = await AsyncStorage.getItem('userToken');
    const res = await fetch(`${API_URL}admin/dashboard`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  getAllUnits: async () => {
    const token = await getToken();
    const res = await fetch(`${API_URL}admin/units`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  getCloudinarySignature: async (fileName: string) => {
    const token = await AsyncStorage.getItem('userToken');


    const res = await fetch(`${API_URL}upload/get-upload-url?folder=english_units&fileName=${fileName}&contentType=image/jpeg`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },


  uploadToCloudinary: async (imageUri: string, sigData: any, fileName: string, folderName: string) => {
    const response = await fetch(imageUri);
    const blob = await response.blob();

    const formData = new FormData();
    formData.append('file', blob);
    formData.append('api_key', sigData.api_key);
    formData.append('timestamp', sigData.timestamp.toString());
    formData.append('signature', sigData.signature);
    formData.append('folder', folderName);
    formData.append('public_id', fileName);
    formData.append('contentType', 'image/jpeg');

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    });
    return res.json();
  },


  createUnit: async (unitData: { title: string, description: string, imageUrl: string }) => {
    const token = await getToken();
    const res = await fetch(`${API_URL}admin/units`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(unitData)
    });
    return res.json();
  },

  addUnitContent: async (unitId: number, token: string, data: any) => {
    const res = await fetch(`${API_URL}admin/units/${unitId}/contents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  getUnitContents: async (unitId: number, token: string) => {
    const res = await fetch(`${API_URL}admin/units/${unitId}/contents`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return res.json();
  },
  getUnitContentById: async (contentId: number, token: string) => {
    const res = await fetch(`${API_URL}admin/contents/${contentId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return res.json();
  },


  updateUnitContent: async (contentId: number, token: string, payload: any) => {
    const res = await fetch(`${API_URL}admin/contents/${contentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  addQuestion: async (unitId: number, token: string, data: any) => {
    const res = await fetch(`${API_URL}admin/units/${unitId}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  getQuestionsByUnit: async (unitId: number, token: string) => {
    const res = await fetch(`${API_URL}admin/units/${unitId}/questions`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return res.json();
  },
  getQuestionById: async (questionId: number, token: string) => {
    const res = await fetch(`${API_URL}admin/questions/${questionId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return res.json();
  },

  updateQuestion: async (questionId: number, token: string, payload: any) => {
    const res = await fetch(`${API_URL}admin/questions/${questionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    });
    return res.json();
  },
};