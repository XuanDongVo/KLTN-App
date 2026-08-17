import { request } from './apiClient';

export const sendPushTokenApi = (expoPushToken: string) => 
  request<void>('/api/notifications/push-token', { 
    method: 'POST', 
    body: JSON.stringify({ expoPushToken }) 
  });
