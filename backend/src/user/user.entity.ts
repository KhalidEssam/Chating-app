import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Message } from '../message/message.entity'; // adjust path as needed
import { Group } from '../group/group.entity'; // if you have a Group entity
import { VoiceMessage } from '../voice-messages/entities/voice-message.entity'; // Added for voice messages

export enum UserStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  BUSY = 'busy',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true, nullable: true })
  email?: string;

  @Column({ unique: true, nullable: true })
  phoneNumber?: string;

  @Column({ select: false })
  password: string; // store hashed password only

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.OFFLINE })
  status: UserStatus;

  @Column({ nullable: true })
  bio?: string;

  @Column({ nullable: true })
  location?: string;

  @Column({ nullable: true })
  timezone?: string;

  // Relations

  // Messages sent by this user
  @OneToMany(() => Message, (message) => message.sender)
  sentMessages: Message[];

  // Messages received by this user
  @OneToMany(() => Message, (message) => message.receiver)
  receivedMessages: Message[];

  // Groups user is part of - assuming Group entity with ManyToMany relationship
  @ManyToMany(() => Group, (group) => group.members)
  groups: Group[];

  // Voice messages sent by this user
  @OneToMany(() => VoiceMessage, (voiceMessage) => voiceMessage.sender)
  sentVoiceMessages: VoiceMessage[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
