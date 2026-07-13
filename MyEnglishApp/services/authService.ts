const API_URL = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/$/, '') ?? '';

async function post<T>(path: string, payload: object): Promise<T> {
  if (!API_URL) throw new Error('Chưa cấu hình địa chỉ máy chủ.');
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error('Không thể kết nối máy chủ. Hãy kiểm tra địa chỉ API.');
  }
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Yêu cầu không thành công.');
  return data;
}

export const loginApi = (email: string, password: string) => post<any>('/auth/login', { email, password });
export const registerApi = (username: string, email: string, password: string) => post<any>('/auth/register', { username, email, password });
