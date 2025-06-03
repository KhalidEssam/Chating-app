import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { Message } from './message.entity';

@ApiTags('Messages') // Capitalized for consistency
@ApiBearerAuth() // Add BearerAuth as JWT guard is enabled
@UseGuards(JwtAuthGuard) // Uncomment to enable JWT authentication for all routes in this controller
@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

// message.controller.ts

@Post()
@ApiOperation({ summary: 'Create a new message' })
@ApiResponse({ status: 400, description: 'Bad Request (e.g., validation error on DTO)' })
@ApiResponse({ status: 401, description: 'Unauthorized (JWT token missing or invalid)' })
@ApiResponse({
  status: 201,
  description: 'The message has been successfully created.',
  type: Message,
})
async create(@Body() createMessageDto: CreateMessageDto) {
  return this.messageService.create(createMessageDto);
}


  @Get()
  @ApiOperation({ summary: 'Get all messages' })
  @ApiResponse({ status: 200, description: 'Return all messages.', type: [Message] })
  findAll() {
    return this.messageService.findAll();
  }
  @Get('id/:id')
  @ApiOperation({ summary: 'Get a message by ID' })
  @ApiParam({ name: 'id', type: String, description: 'ID of the message to retrieve', example: '1' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 200, description: 'Return the message.', type: Message })
  findOne(@Param('id') id: string) {
    return this.messageService.findOne(+id);
  }
  
  @Get('room/:roomId')
  @ApiOperation({ summary: 'Get messages by room ID' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Room not found or no messages in room' }) // Added 404 for room context
  @ApiParam({ name: 'roomId', type: String, description: 'Room ID to fetch messages for' })
  @ApiResponse({ status: 200, description: 'Messages for the specified room', type: [Message] })
  async findByRoomId(@Param('roomId') roomId: string): Promise<Message[]> {
    return this.messageService.findByRoomId(roomId);
  }
  

  @Put(':id')
  @ApiOperation({ summary: 'Update a message' })
  @ApiParam({ name: 'id', type: String, description: 'ID of the message to update', example: '1' })
  @ApiResponse({ status: 400, description: 'Bad Request (e.g., validation error on DTO)' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden (User not allowed to update this message)' }) // Added 403
  @ApiResponse({ status: 200, description: 'The message has been successfully updated.', type: Message })
  update(@Param('id') id: string, @Body() updateMessageDto: UpdateMessageDto) {
    return this.messageService.update(+id, updateMessageDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a message' })
  @ApiParam({ name: 'id', type: String, description: 'ID of the message to delete', example: '1' })
  @ApiResponse({ status: 200, description: 'The message has been successfully deleted.', schema: { type: 'object', properties: { success: {type: 'boolean', example: true}, message: {type: 'string', example: 'Message deleted successfully'} } } })
  @ApiResponse({ status: 404, description: 'Message not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden (User not allowed to delete this message)' }) // Added 403
  remove(@Param('id') id: string) {
    return this.messageService.remove(id);
  }
}
