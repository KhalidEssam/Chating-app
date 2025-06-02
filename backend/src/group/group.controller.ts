import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { GroupService } from './group.service';
import { Group } from './group.entity';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../user/user.entity';
import { ApiTags } from '@nestjs/swagger';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { ValidationPipe } from '@nestjs/common';

@ApiTags('groups')
@Controller('groups')
@UseGuards(AuthGuard('jwt')) // ✅ Important!
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  async createGroup(@Body(ValidationPipe) createGroupDto: CreateGroupDto, @GetUser() user: User): Promise<Group> {
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
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateGroupDto: UpdateGroupDto,
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
