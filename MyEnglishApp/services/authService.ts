const API_URL = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/$/, '') ?? '';

async function post<T>(path: string, payload: object): Promise<T> {
  if (!API_URL) throw new Error('Chua cau hinh dia chi may chu.');
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error('Khong the ket noi may chu. Hay kiem tra dia chi API.');
  }
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Yeu cau khong thanh cong.');
  return data;
}

export const loginApi = (email: string, password: string) => post<any>('/auth/login', { email, password });
export const registerApi = (username: string, email: string, password: string) => post<any>('/auth/register', { username, email, password });
