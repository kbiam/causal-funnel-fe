const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class ApiService {
  static async startQuiz(email) {
    const response = await fetch(`${API_BASE_URL}/quiz/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to start quiz');
    }
    return response.json();
  }

  static async getQuizSession(sessionId) {
    const response = await fetch(`${API_BASE_URL}/quiz/${sessionId}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get quiz session');
    }
    return response.json();
  }

  static async submitAnswer(sessionId, questionId, answer) {
    const response = await fetch(`${API_BASE_URL}/quiz/${sessionId}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId, answer })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save answer');
    }
    return response.json();
  }

  static async getQuizResults(sessionId) {
    const response = await fetch(`${API_BASE_URL}/quiz/${sessionId}/results`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get results');
    }
    return response.json();
  }

  static async getUserStatus(email) {
    const response = await fetch(`${API_BASE_URL}/user/${email}/current`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get user status');
    }
    return response.json();
  }

  static async getUserHistory(email) {
    const response = await fetch(`${API_BASE_URL}/user/${email}/history`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get user history');
    }
    return response.json();
  }

  static async getDetailedReport(email, sessionId) {
    const response = await fetch(`${API_BASE_URL}/user/${email}/report/${sessionId}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get detailed report');
    }
    return response.json();
  }
}

export default ApiService;
