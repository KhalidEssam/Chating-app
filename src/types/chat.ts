export interface Message {
  content: string;
  timestamp: string;
  isOwn: boolean;
  sender: {
    id: string;
    name: string;
    phoneNumber?: string;
  };
}
