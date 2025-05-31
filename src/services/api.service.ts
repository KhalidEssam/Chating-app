import axios from 'axios';

// Create API instance
const api = axios.create({
  baseURL: 'http://localhost:3002',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add request interceptor to include JWT token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
});

// Add response interceptor for token handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

interface Message {
  id?: string;
  content: string;
  senderId: string;
  roomId: number;
  createdAt?: string;
  isOwn?: boolean;
}

interface User {
  id: string;
  name: string;
  phoneNumber: string;
}

// Export types for use in other files
export type { Message, User };

// Export the API instance
export { api };

// Export API service functions
export const apiService = {
  async createGroup(groupData: { name: string; isActive: boolean; members: number[] }) {
    try {
      const response = await api.post('/groups', groupData);
      return response.data;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  },

  async getAllGroups() {
    try {
      const response = await api.get('/groups');
      return response.data;
    } catch (error) {
      console.error('Error retrieving groups:', error);
      throw error;
    }
  },

  async login(credentials: { username: string; password: string }) {
    // Avoid logging passwords in production
    console.log('Logging in with username:', credentials.username);
    const response = await api.post('/auth/login', credentials);
    // After login, store token and user externally (not here)
    return response.data;
  },

  async getMessages(roomId: number) {
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
      console.log(message);
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

export default apiService;
