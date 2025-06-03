import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';
import { Group } from '../group/group.entity';

@Entity()
export class Message {
  @ApiProperty({ description: 'Unique identifier of the message', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Content of the message', example: 'Hello, how are you?' })
  @Column()
  content: string;

  @ApiProperty({ type: () => User, description: 'The user who sent the message' })
  @ManyToOne(() => User, (user) => user.sentMessages, { nullable: false })
  sender: User;

  @ApiProperty({ type: () => User, description: 'The recipient user of the message (for direct messages)', nullable: true, required: false })
  @ManyToOne(() => User, (user) => user.receivedMessages, { nullable: true })
  receiver: User | null;

  @ApiProperty({ type: () => Group, description: 'The group this message belongs to (for group messages)', nullable: true, required: false })
  @ManyToOne(() => Group, (group) => group.messages, { nullable: true })
  group: Group | null;

  @ApiProperty({ description: 'Name of the sender (can be denormalized for performance or derived)', example: 'john_doe' })
  @Column()
  senderName: string;  // optional: you can get this from sender.username, consider removing redundancy

  @ApiProperty({ description: 'Identifier for the chat room or conversation', example: 'user1_user2_dm' })
  @Column()
  roomId: string;  // this looks like a chat room identifier, fine as string

  @ApiProperty({ description: 'Timestamp when the message was sent', type: Date, example: '2024-06-04T10:30:00.000Z' })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

}
