const API_URL = process.env.EXPO_PUBLIC_API_URL;
export const learnerService = {

  getDashboard: async (token: string) => {
    const res = await fetch(`${API_URL}learner/dashboard`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Lỗi tải dashboard");
    return res.json();
  },


  getQuiz: async (unitId: number, token: string) => {
    const res = await fetch(`${API_URL}learner/units/${unitId}/quiz`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Lỗi tải câu hỏi");
    return res.json();
  },

  submitQuiz: async (payload: { unitId: number, correctCount: number, wrongCount: number }, token: string) => {
    const res = await fetch(`${API_URL}learner/quiz/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Lỗi nộp bài");
    return res.json();
  }
};