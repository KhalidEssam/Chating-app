import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { GroupService } from './group.service';
import { Group } from './group.entity';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../user/user.entity';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { ValidationPipe } from '@nestjs/common';

@ApiTags('Groups') // Capitalized for consistency
@ApiBearerAuth() // For JWT authentication
@Controller('groups')
@UseGuards(AuthGuard('jwt')) // ✅ Important!
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new group' })
  @ApiResponse({ status: 201, description: 'The group has been successfully created.', type: Group })
  @ApiResponse({ status: 400, description: 'Bad Request (e.g., validation error)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  // @ApiBody({ type: CreateGroupDto }) // Implicitly handled, but can be added for more detail
  async createGroup(@Body(ValidationPipe) createGroupDto: CreateGroupDto, @GetUser() user: User): Promise<Group> {
    return this.groupService.createGroup(createGroupDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all groups (user context might apply for filtering)' })
  @ApiResponse({ status: 200, description: 'List of all groups.', type: [Group] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAllGroups(@GetUser() user: User): Promise<Group[]> {
    return this.groupService.getAllGroups();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific group by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the group to retrieve', example: 1 })
  @ApiResponse({ status: 200, description: 'The group details.', type: Group })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  async getGroup(@Param('id') id: number, @GetUser() user: User): Promise<Group> {
    return this.groupService.getGroup(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a group by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the group to update', example: 1 })
  @ApiResponse({ status: 200, description: 'The group has been successfully updated.', type: Group })
  @ApiResponse({ status: 400, description: 'Bad Request (e.g., validation error)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden (User may not have permission to update)' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  // @ApiBody({ type: UpdateGroupDto }) // Implicitly handled
  async updateGroup(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateGroupDto: UpdateGroupDto,
    @GetUser() user: User
  ): Promise<Group> {
    return this.groupService.updateGroup(id, updateGroupDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a group by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the group to delete', example: 1 })
  @ApiResponse({ status: 200, description: 'The group has been successfully deleted (or 204 No Content).' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden (User may not have permission to delete)' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  async deleteGroup(@Param('id') id: number, @GetUser() user: User): Promise<void> {
    return this.groupService.deleteGroup(id);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Join an existing group' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the group to join', example: 1 })
  @ApiResponse({ status: 200, description: 'Successfully joined the group.', type: Group })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden (e.g., group is private and no invite)' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  @ApiResponse({ status: 409, description: 'Conflict (e.g., user already a member)' })
  async joinGroup(@Param('id') id: number, @GetUser() user: User): Promise<Group> {
    return this.groupService.joinGroup(id, user);
  }

  @Post(':id/leave')
  @ApiOperation({ summary: 'Leave a group' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the group to leave', example: 1 })
  @ApiResponse({ status: 200, description: 'Successfully left the group.', type: Group })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Group not found or user not a member' })
  async leaveGroup(@Param('id') id: number, @GetUser() user: User): Promise<Group> {
    return this.groupService.leaveGroup(id, user);
  }
}
