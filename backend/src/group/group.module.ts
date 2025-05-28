import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { Group } from './group.entity';
import { User } from '../user/user.entity';
import { Message } from '../message/message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Group, User, Message])
  ],
  controllers: [GroupController],
  providers: [GroupService],
  exports: [TypeOrmModule] // Export so other modules can use it if needed
})
export class GroupModule {}
