import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';
import { Group } from '../group/group.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @ManyToOne(() => User, (user) => user.sentMessages, { nullable: false })
  sender: User;

  @ManyToOne(() => User, (user) => user.receivedMessages, { nullable: true })
  receiver: User | null;

  @ManyToOne(() => Group, (group) => group.messages, { nullable: true })
  group: Group | null;

  @Column()
  senderName: string;  // optional: you can get this from sender.username, consider removing redundancy

  @Column()
  roomId: string;  // this looks like a chat room identifier, fine as string

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

}
