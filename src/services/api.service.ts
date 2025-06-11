import { Token } from "@mui/icons-material";
import axios from "axios";

// Create API instance
const api = axios.create({
  baseURL: "http://localhost:3002",
  withCredentials: true,
});

// Add request interceptor to include JWT token
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return config;
});

// Add response interceptor for token handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

interface Message {
  id?: string;
  content: string;
  sender: {
    id: string;
    username: string;
  };
  roomId: number;
  createdAt?: string;
  isOwn?: boolean;
  filePath?: string;
  duration?: number
  conversationId?: number
}

interface VoiceMessage {
  file: File;
  duration: number; // Duration in seconds as number (e.g., 15.5)
  conversationId: string;
}

interface User {
  id: string;
  username: string;
  phoneNumber: string;
}

// Export types for use in other files
export type { Message, User };

// Export the API instance
export { api };

// Export API service functions
export const apiService = {
  async createGroup(groupData: { name: string; creator: User }) {
    try {
      const response = await api.post("/groups", groupData);
      return response.data;
    } catch (error) {
      console.error("Error creating group:", error);
      throw error;
    }
  },

  async getAllGroups() {
    try {
      const response = await api.get("/groups");
      return response.data;
    } catch (error) {
      console.error("Error retrieving groups:", error);
      throw error;
    }
  },

  async login(credentials: { username: string; password: string }) {
    // Avoid logging passwords in production
    console.log("Logging in with username:", credentials.username);
    const response = await api.post("/auth/login", credentials);
    // After login, store token and user externally (not here)
    return response.data;
  },

  async getMessages(roomId: number) {
    try {
      const response = await api.get(`/messages?roomId=${roomId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw error;
    }
  },

  async createMessage(message: Message) {
    try {
      // console.log('api.service message', message)

      const response = await api.post("/messages", message);
      return response.data;
    } catch (error) {
      console.error("Error creating message:", error);
      throw error;
    }
  },

  async getUsers() {
    try {
      const response = await api.get("/users");
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  async uploadVoiceMessage(formData: FormData) {
    const token = localStorage.getItem("token");
    console.log(token);
    try {
      const response = await api.post('/voice-messages/upload', formData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Server responded with:', error.response?.data);
      } else {
        console.error('Unexpected error:', error);
      }
      throw error;
    }
  },
  async getAllVoiceMessages(conversationId: string) {
    try {
      const response = await api.get('/voice-messages/getAllVoiceMessages');
      return response.data;
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw error;
    }
  },
};
export default apiService;
