import { User } from '../user/user.entity'; // Corrected User entity path
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Group } from 'src/group/group.entity';
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
  @ApiProperty({ description: 'Unique identifier for the voice message', example: '123e4567-e89b-12d3-a456-426614174000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID of the user who sent the voice message', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  @Column()
  senderId: string;

  @ManyToOne(() => User, (user) => user.sentVoiceMessages, { onDelete: 'CASCADE' }) // Assuming User entity has 'sentVoiceMessages' relation
  @JoinColumn({ name: 'senderId' })
  @ApiProperty({ type: () => User, description: 'The user entity who sent the message' }) // Assuming User entity also has ApiProperty decorators
  sender: User;

  @Column({ nullable: false })
  @IsString()
  conversationId: string | "Solo_project";

  @ManyToOne(() => Group, (group) => group.messages, { onDelete: 'CASCADE' }) // Assuming Conversation entity has 'voiceMessages' relation
  @JoinColumn({ name: 'name' })
  group?: Group | "Solo_project";;

  @ApiProperty({ description: 'URL or path to the stored voice file', example: 'https://res.cloudinary.com/your_cloud_name/video/upload/v1234567890/voice_messages/your_file_name.webm' })
  @Column()
  filePath: string; // Path to the stored audio file (e.g., S3 key or local path)

  @ApiProperty({ description: 'Duration of the voice message in seconds', example: 15.7 })
  @Column({ type: 'float' })
  duration: number; // Duration in seconds

  @ApiProperty({ description: 'MIME type of the voice file', example: 'audio/webm' })
  @Column()
  mimeType: string; // e.g., 'audio/ogg', 'audio/wav', 'audio/mpeg'

  @ApiProperty({ description: 'Indicates if the voice message has been read by the recipient(s)', example: false, default: false })
  @Column({ default: false })
  isRead: boolean;

  @ApiProperty({ description: 'Timestamp of when the voice message was created', type: Date, example: '2024-06-04T12:00:00.000Z' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Timestamp of when the voice message was last updated', type: Date, example: '2024-06-04T12:00:00.000Z' })
  @UpdateDateColumn()
  updatedAt: Date;
}
