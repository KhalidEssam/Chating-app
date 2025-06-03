import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { User } from '../user/user.entity';
import { Message } from '../message/message.entity';

@Entity('groups')
export class Group {
    @ApiProperty({ description: 'Unique identifier of the group', example: 1 })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ description: 'Name of the group', example: 'Developers Chat' })
    @Column()
    name: string;

    @ApiProperty({ description: 'Indicates if the group is active', example: true, default: true })
    @Column({ default: true })
    isActive: boolean;

    @ApiProperty({ type: () => [User], description: 'List of users who are members of this group' })
    @ManyToMany(() => User, user => user.groups)
    @JoinTable()
    members: User[];

    @ApiProperty({ description: 'Timestamp when the group was created', type: Date, example: '2024-06-01T12:00:00.000Z' })
    @Column('timestamp')
    createdAt: Date;

    @ApiProperty({ description: 'Timestamp when the group was last updated', type: Date, example: '2024-06-02T15:30:00.000Z' })
    @Column('timestamp')
    updatedAt: Date;

    @ApiProperty({ type: () => [Message], description: 'List of messages sent in this group', required: false })
    @OneToMany(() => Message, message => message.group)
    messages: Message[];
}
