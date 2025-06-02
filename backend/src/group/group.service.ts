import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from './group.entity';
import { User } from '../user/user.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async createGroup(createGroupDto: CreateGroupDto, creator: User): Promise<Group> {
    const { name, membersIds } = createGroupDto;
    
    const group = this.groupRepository.create({
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
      members: [creator]
    });

    if (membersIds) {
      const members = await this.userRepository.findByIds(membersIds);
      group.members = [...group.members, ...members];
    }

    return this.groupRepository.save(group);
  }
  async getAllGroups(): Promise<Group[]> {
    return this.groupRepository.find({
      relations: ['members', 'messages']
    });
  }

  async getGroup(id: number): Promise<Group> {
    const group = await this.groupRepository.findOne({
      where: { id },
      relations: ['members', 'messages']
    });
    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }
    return group;
  }

  async updateGroup(id: number, updateGroupDto: UpdateGroupDto): Promise<Group> {
    const group = await this.getGroup(id);
    Object.assign(group, updateGroupDto);
    return this.groupRepository.save(group);
  }

  async deleteGroup(id: number): Promise<void> {
    const result = await this.groupRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }
  }

  async joinGroup(groupId: number, user: User): Promise<Group> {
    const group = await this.getGroup(groupId);
    if (!group.members.includes(user)) {
      group.members = [...group.members, user];
      return this.groupRepository.save(group);
    }
    throw new NotFoundException(`User is already a member of this group`);
  }

  async leaveGroup(groupId: number, user: User): Promise<Group> {
    const group = await this.getGroup(groupId);
    const index = group.members.findIndex(member => member.id === user.id);
    if (index !== -1) {
      group.members.splice(index, 1);
      return this.groupRepository.save(group);
    }
    throw new NotFoundException(`User is not a member of this group`);
  }
}
