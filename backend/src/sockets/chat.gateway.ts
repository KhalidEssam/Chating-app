import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from '../message/message.service';
import { VoiceMessagesService } from '../voice-messages/voice-messages.service';
import { Inject, Injectable } from '@nestjs/common';
import { VoiceMessage } from '../voice-messages/voice-message.entity';
import { CreateMessageDto } from '../message/dto/create-message.dto';

interface ConnectedUser {
  id: string;
  name: string;
  phoneNumber?: string;
}

interface Message {
  content: string;
  roomId: string;
  timestamp: string;
  sender: ConnectedUser;
  conversationId?: string;
}

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
})
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers: ConnectedUser[] = [];
  private roomMessages: Record<string, Message[]> = {};

  constructor(
    @Inject(MessageService) private readonly messageService: MessageService,
    @Inject(VoiceMessagesService) private readonly voiceMessagesService: VoiceMessagesService,
  ) {}

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
    this.connectedUsers = this.connectedUsers.filter((u) => u.id === client.id);
  }

  @SubscribeMessage('identify')
  handleIdentify(
    @ConnectedSocket() client: Socket,
    @MessageBody() userData: { name: string; phoneNumber?: string },
  ) {
    const user: ConnectedUser = {
      id: client.id,
      name: userData.name,
      phoneNumber: userData.phoneNumber,
    };

    if (!this.connectedUsers.some((u) => u.id === client.id)) {
      this.connectedUsers.push(user);
    }

    client.emit('identification-confirmed', user);
  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; token: string },
  ) {
    const roomId = data[0];

    console.log("hiiiiiii",roomId)
    if (!roomId ) return;



    client.join(roomId);
    client.emit('room-joined', roomId);

    try {
      // Fetch messages using services instead of axios
      const textMessages = await this.messageService.findByRoomId(roomId);
      const allVoiceMessages = await this.voiceMessagesService.findALL();

      // Filter voice messages by room
      const voiceRecords = allVoiceMessages.filter(
        (msg) => msg.senderId === roomId || msg.conversationId === roomId,
      ) as VoiceMessage[];

      // Combine and sort messages
      const filteredMessages = [...voiceRecords, ...textMessages]
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      if (filteredMessages.length) {
        client.emit('room-history', filteredMessages, roomId);
      }
    } catch (error) {
      console.error('Error fetching room history:', error.message);
      client.emit('room-history', [], roomId);
    }
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() msg: { content: string; room: string },
  ) {
    const sender = this.connectedUsers.find((u) => u.id === client.id);
    if (!sender || !msg.room) return;

    const fullMessage: Message = {
      content: msg.content,
      roomId: msg.room,
      timestamp: new Date().toISOString(),
      sender,
    };

    if (!this.roomMessages[msg.room]) {
      this.roomMessages[msg.room] = [];
    }
    this.roomMessages[msg.room].push(fullMessage);

    // Save message to database
    await this.messageService.create({
      content: msg.content,
      sender: { id: sender.id, username: sender.name },
      roomId: msg.room,
    } as CreateMessageDto);

    client.to(msg.room).emit('message', fullMessage);
    client.emit('message', fullMessage);
  }
}