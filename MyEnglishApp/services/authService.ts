const API_URL = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/$/, '') ?? '';

export type ServerResponse<T> = {
  code: number;
  message: string;
  data: T;
};

export type AuthDto = {
  id: string;
  email: string;
  username: string;
  displayName: string;
  role: string;
  jwtToken: string;
  refreshToken: string;
};

async function post<T>(path: string, payload: object | string): Promise<ServerResponse<T>> {
  if (!API_URL) throw new Error('Chưa cấu hình địa chỉ máy chủ.');
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': typeof payload === 'string' ? 'text/plain' : 'application/json' },
      body: typeof payload === 'string' ? payload : JSON.stringify(payload),
    });
  } catch {
    throw new Error('Không thể kết nối máy chủ. Hãy kiểm tra địa chỉ API.');
  }
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Yêu cầu không thành công.');
  return data;
}

export const loginApi = (email: string, password: string) => post<AuthDto>('/api/auth/login', { email, password });
export const registerApi = (username: string, email: string, password: string) => post<any>('/api/auth/register', { username, email, password });
export const sendVerifyAccountApi = (email: string) => post<any>('/api/verify/send/account', email);
export const verifyAccountApi = (email: string, code: string) => post<any>('/api/verify/account', { email, code });
export const refreshTokenApi = (refreshToken: string) => post<AuthDto>('/api/auth/refresh', { refreshToken });
export const logoutApi = (refreshToken: string) => post<any>('/api/auth/logout', { refreshToken });
export const logoutAllApi = (email: string) => post<any>('/api/auth/logout-all', { email });

