import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3002',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add request interceptor to include JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // Simple way to add Authorization header
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for token handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface Message {
  id?: string;
  content: string;
  senderId: string;
  roomId: string;
  createdAt?: string;
  isOwn?: boolean;
  sender?: User;
}

export interface User {
  id: string;
  name: string;
  phoneNumber: string;
}

export const apiService = {
  async login(credentials: { username: string; password: string }) {
    // Avoid logging passwords in production
    console.log('Logging in with username:', credentials.username);
    const response = await api.post('/auth/login', credentials);
    console.log(response.data);
    return response.data;
  },

  async getMessages(roomId: string) {
    try {
      const response = await api.get(`/messages?roomId=${roomId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  async createMessage(message: Message) {
    try {
      const response = await api.post('/messages', message);
      return response.data;
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  },

  async getUsers() {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },
};
