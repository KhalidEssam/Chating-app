import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Message } from '../message/message.entity'; // adjust path as needed
import { Group } from '../group/group.entity'; // if you have a Group entity
import { VoiceMessage } from '../voice-messages/voice-message.entity'; // Added for voice messages

export enum UserStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  BUSY = 'busy',
}

@Entity()
export class User {
  @ApiProperty({ description: 'Unique identifier of the user', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', format: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Username of the user', example: 'john_doe', uniqueItems: true })
  @Column({ unique: true })
  username: string;

  @ApiProperty({ description: 'Email address of the user', example: 'john.doe@example.com', uniqueItems: true, required: false })
  @Column({ unique: true, nullable: true })
  email?: string;

  @ApiProperty({ description: 'Phone number of the user', example: '+1234567890', uniqueItems: true, required: false })
  @Column({ unique: true, nullable: true })
  phoneNumber?: string;

  // Password is intentionally not exposed via ApiProperty for security
  @Column({ select: false })
  password: string; // store hashed password only

  @ApiProperty({ description: 'URL of the user\'s avatar image', example: 'https://example.com/avatar.jpg', required: false })
  @Column({ nullable: true })
  avatarUrl?: string;

  @ApiProperty({ description: 'Current status of the user', enum: UserStatus, default: UserStatus.OFFLINE, example: UserStatus.ONLINE })
  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.OFFLINE })
  status: UserStatus;

  @ApiProperty({ description: 'Short biography of the user', example: 'Software developer and coffee enthusiast.', required: false })
  @Column({ nullable: true })
  bio?: string;

  @ApiProperty({ description: 'User\'s location', example: 'San Francisco, CA', required: false })
  @Column({ nullable: true })
  location?: string;

  @ApiProperty({ description: 'User\'s timezone', example: 'America/Los_Angeles', required: false })
  @Column({ nullable: true })
  timezone?: string;

  // Relations

  // Messages sent by this user
  @ApiProperty({ type: () => [Message], description: 'Messages sent by this user', required: false })
  @OneToMany(() => Message, (message) => message.sender)
  sentMessages: Message[];

  // Messages received by this user
  @ApiProperty({ type: () => [Message], description: 'Messages received by this user', required: false })
  @OneToMany(() => Message, (message) => message.receiver)
  receivedMessages: Message[];

  // Groups user is part of - assuming Group entity with ManyToMany relationship
  @ApiProperty({ type: () => [Group], description: 'Groups this user is a member of', required: false })
  @ManyToMany(() => Group, (group) => group.members)
  groups: Group[];

  // Voice messages sent by this user
  @ApiProperty({ type: () => [VoiceMessage], description: 'Voice messages sent by this user', required: false })
  @OneToMany(() => VoiceMessage, (voiceMessage) => voiceMessage.sender)
  sentVoiceMessages: VoiceMessage[];

  @ApiProperty({ description: 'Timestamp of when the user account was created', type: Date, example: '2024-06-01T10:00:00.000Z' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Timestamp of when the user account was last updated', type: Date, example: '2024-06-04T14:30:00.000Z' })
  @UpdateDateColumn()
  updatedAt: Date;
}
