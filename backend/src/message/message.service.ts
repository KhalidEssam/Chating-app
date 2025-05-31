import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { User } from '../user/user.entity';
import { Group } from '../group/group.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Group)
    private groupsRepository: Repository<Group>,
  ) {}

async create(createMessageDto: CreateMessageDto): Promise<Message> {
  const { content, senderId, receiverId, groupId } = createMessageDto;

  // Fetch sender
  const sender = await this.usersRepository.findOne({ where: { id: senderId } });
  if (!sender) {
    throw new NotFoundException('Sender not found');
  }

  const message = this.messagesRepository.create({
    content,
    sender,
    senderName: sender.username,
    roomId: createMessageDto.roomId,
    receiver: receiverId ? await this.usersRepository.findOne({ where: { id: receiverId } }) : null
  });

  // If it's a group message, set the receiver to null
  if (groupId) {
    message.receiver = null;
  }

  // Optional: Assign receiver
  if (receiverId) {
    const receiver = await this.usersRepository.findOne({ where: { id: receiverId } });
    if (!receiver) {
      throw new NotFoundException('Receiver not found');
    }
    message.receiver = receiver;
  }

  // Optional: Assign group
  if (groupId) {
    const group = await this.groupsRepository.findOne({ where: { id: +groupId } });
    if (!group) {
      throw new NotFoundException('Group not found');
    }
    message.group = group;
  }

  // message.roomId = groupId || 'friends_chat';


  return this.messagesRepository.save(message);
}

  async findAll(): Promise<Message[]> {
    return this.messagesRepository.find({
      relations: ['sender', 'receiver', 'group'],
      order: { timestamp: 'DESC' },
    });
  }
  async findByRoomId(roomId: string): Promise<Message[]> {
    return this.messagesRepository.find({
      where: { roomId: roomId },
      relations: ['sender', 'receiver', 'group'],
      order: { timestamp: 'DESC' },
    });
  }
  

  async findOne(id: number): Promise<Message | null> {
    return this.messagesRepository.findOne({
      where: { id },
      relations: ['sender', 'receiver', 'group'],
    });
  }

  

  async update(id: number, updateMessageDto: UpdateMessageDto): Promise<Message> {
    const message = await this.messagesRepository.findOne({ where: { id } });
    if (!message) {
      throw new Error('Message not found');
    }

    Object.assign(message, updateMessageDto);
    return this.messagesRepository.save(message);
  }

  async remove(id: string): Promise<void> {
    await this.messagesRepository.delete(id);
  }
}
