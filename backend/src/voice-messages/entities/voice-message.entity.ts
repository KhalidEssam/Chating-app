import { User } from '../../user/user.entity'; // Corrected User entity path
// import { Conversation } from '../../conversations/entities/conversation.entity'; // Assuming you have a Conversation entity
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';

@Entity('voice_messages')
export class VoiceMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  senderId: string;

  @ManyToOne(() => User, (user) => user.sentVoiceMessages, { onDelete: 'CASCADE' }) // Assuming User entity has 'sentVoiceMessages' relation
  @JoinColumn({ name: 'senderId' })
  sender: User;

  // @Column()
  // conversationId: string;

  // @ManyToOne(() => Conversation, (conversation) => conversation.voiceMessages, { onDelete: 'CASCADE' }) // Assuming Conversation entity has 'voiceMessages' relation
  // @JoinColumn({ name: 'conversationId' })
  // conversation: Conversation;

  @Column()
  filePath: string; // Path to the stored audio file (e.g., S3 key or local path)

  @Column({ type: 'float' })
  duration: number; // Duration in seconds

  @Column()
  mimeType: string; // e.g., 'audio/ogg', 'audio/wav', 'audio/mpeg'

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
