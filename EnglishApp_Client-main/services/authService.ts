const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const loginApi = async (email: string, password: string) => {
  try {
    const response = await fetch(`${API_URL}auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    // Trả về dữ liệu JSON để file UI tự xử lý tiếp
    return await response.json(); 
    
  } catch (error) {
    console.error("Login API Error: ", error);
    // Ném lỗi ra ngoài để màn hình Login bắt được
    throw new Error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại IP.");
  }
};

export const registerApi = async (username: string, email: string, password: string) => {
  try {
    const response = await fetch(`${API_URL}auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    
    return await response.json(); 
    
  } catch (error) {
    console.error("Register API Error: ", error);
    throw new Error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại IP.");
  }
};