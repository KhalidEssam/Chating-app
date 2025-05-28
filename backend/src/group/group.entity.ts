import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { User } from '../user/user.entity';
import { Message } from '../message/message.entity';

@Entity('groups')
export class Group {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ default: true })
    isActive: boolean;

    @ManyToMany(() => User, user => user.groups)
    @JoinTable()
    members: User[];

    @Column('timestamp')
    createdAt: Date;

    @Column('timestamp')
    updatedAt: Date;

    @OneToMany(() => Message, message => message.group)
    messages: Message[];
}
