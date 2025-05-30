import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { GroupService } from './group.service';
import { Group } from './group.entity';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../user/user.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('groups')
@Controller('groups')
@UseGuards(AuthGuard('jwt')) // ✅ Important!
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  async createGroup(@Body() createGroupDto: any, @GetUser() user: User): Promise<Group> {
    return this.groupService.createGroup(createGroupDto, user);
  }

  @Get()
  async getAllGroups(@GetUser() user: User): Promise<Group[]> {
    return this.groupService.getAllGroups();
  }

  @Get(':id')
  async getGroup(@Param('id') id: number, @GetUser() user: User): Promise<Group> {
    return this.groupService.getGroup(id);
  }

  @Put(':id')
  async updateGroup(
    @Param('id') id: number,
    @Body() updateGroupDto: any,
    @GetUser() user: User
  ): Promise<Group> {
    return this.groupService.updateGroup(id, updateGroupDto);
  }

  @Delete(':id')
  async deleteGroup(@Param('id') id: number, @GetUser() user: User): Promise<void> {
    return this.groupService.deleteGroup(id);
  }

  @Post(':id/join')
  async joinGroup(@Param('id') id: number, @GetUser() user: User): Promise<Group> {
    return this.groupService.joinGroup(id, user);
  }

  @Post(':id/leave')
  async leaveGroup(@Param('id') id: number, @GetUser() user: User): Promise<Group> {
    return this.groupService.leaveGroup(id, user);
  }
}
