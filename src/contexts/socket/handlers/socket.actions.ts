// src/contexts/socket/handlers/SocketActions.ts
import { Message, User } from "@/services/api.service";
import { Socket } from "socket.io-client";
import apiService from "@/services/api.service";
import { handleMessage } from "./handleMessage";

export class SocketActions {
  public socket: Socket;
  public currentRoom: number | null = null;
  public user: User | null = null;
  public userRef: React.MutableRefObject<User | null>;
  
  // State setters (to be injected from the provider)
  public setIsIdentified: React.Dispatch<React.SetStateAction<boolean>>;
  public setUser: React.Dispatch<React.SetStateAction<User | null>>;
  public setCurrentRoom: React.Dispatch<React.SetStateAction<number | null>>;
  public setMessagesMap: React.Dispatch<React.SetStateAction<Record<number, Message[]>>>;
  public setLastMessages: React.Dispatch<React.SetStateAction<Record<number, { message: string; time: string }>>>;
  public setError: React.Dispatch<React.SetStateAction<string | null>>;
  public setInitialized: React.Dispatch<React.SetStateAction<boolean>>;

  constructor(
    socket: Socket,
    setters: {
      setIsIdentified: React.Dispatch<React.SetStateAction<boolean>>;
      setUser: React.Dispatch<React.SetStateAction<User | null>>;
      setCurrentRoom: React.Dispatch<React.SetStateAction<number | null>>;
      setMessagesMap: React.Dispatch<React.SetStateAction<Record<number, Message[]>>>;
      setLastMessages: React.Dispatch<React.SetStateAction<Record<number, { message: string; time: string }>>>;
      setError: React.Dispatch<React.SetStateAction<string | null>>;
      setInitialized: React.Dispatch<React.SetStateAction<boolean>>;
    },
    userRef: React.MutableRefObject<User | null>
  ) {
    this.socket = socket;
    this.setIsIdentified = setters.setIsIdentified;
    this.setUser = setters.setUser;
    this.setCurrentRoom = setters.setCurrentRoom;
    this.setMessagesMap = setters.setMessagesMap;
    this.setLastMessages = setters.setLastMessages;
    this.setError = setters.setError;
    this.setInitialized = setters.setInitialized;
    this.userRef = userRef;
  }

  // Message handler
  public handleNewMessage = (msg: Message) => {
    handleMessage(
      msg,
      this.setMessagesMap,
      this.setLastMessages,
      this.userRef.current?.id
    );
  };

  // Public methods
  public async sendMessage(content: string) {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;
    const sender = JSON.parse(storedUser) as User;

    if (!this.socket?.connected || !sender || !this.currentRoom) return;

    try {
      const createdAt = new Date().toISOString();
      const message = {
        content,
        sender: {
          id: sender.id,
          username: sender.username,
        },
        roomId: this.currentRoom,
        createdAt,
      };
      await apiService.createMessage(message);
      this.socket.emit("message", message);
      this.handleNewMessage(message);
    } catch (err) {
      console.error("Error sending message:", err);
      this.setError("Failed to send message");
    }
  }

  public async createGroup(groupName: string) {
    if (!this.socket?.connected || !this.userRef.current) return;

    const storedUser = localStorage.getItem("user");
    let user: User | null = null;

    try {
      if (storedUser) {
        user = JSON.parse(storedUser) as User;
        const group = await apiService.createGroup({
          name: groupName,
          creator: user,
        });
        this.joinRoom(group.id.toString());
      }
    } catch (err) {
      console.error("Error creating group:", err);
      this.setError("Failed to create group");
    }
  }

  public joinRoom(roomId: string) {
    const token = localStorage.getItem("token");
    if (!this.socket?.connected || roomId === this.currentRoom?.toString())
      return;
      
    // Clear existing messages for this room before joining
    this.setMessagesMap(prev => {
      const newMap = { ...prev };
      newMap[Number(roomId)] = [];
      return newMap;
    });
    
    this.socket.emit("join-room", roomId, token);
  }

  public async saveVoiceRecord(
    file: File,
    duration: number,
    mimeType: string,
    conversationId?: string
  ) {
    try {
      if (!file || !duration || !conversationId) {
        throw new Error("Missing required parameters");
      }

      const formData = new FormData();
      formData.append("voiceFile", file);
      formData.append("duration", duration.toString());
      formData.append(
        "conversationId",
        this.currentRoom ? this.currentRoom.toString() : conversationId
      );
      formData.append("mimeType", mimeType);

      const result = await apiService.uploadVoiceMessage(formData);
      return result;
    } catch (error) {
      console.error("Failed to save voice record:", error);
      throw error;
    }
  }

  // Event handlers
  public setupEventHandlers() {
    this.socket.on("connect", async () => {
      console.log("Socket connected:", this.socket.id);
      const token = localStorage.getItem("token");
      if (!token) {
        this.setError("No token found");
        this.setInitialized(true);
        return;
      }

      try {
        await apiService.getUsers();
        this.setError(null);
        this.setIsIdentified(true);
        this.setInitialized(true);
        this.socket.emit("identify", {
          name: this.userRef.current?.username,
          phoneNumber: this.userRef.current?.phoneNumber,
        });
      } catch (err) {
        console.error("Authentication failed:", err);
        this.setError("Authentication failed");
        this.setIsIdentified(false);
        this.setInitialized(true);
      }
    });

    // Add other event handlers here...
  }
}