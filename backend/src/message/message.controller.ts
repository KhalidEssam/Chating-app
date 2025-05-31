import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Message } from './message.entity';

@ApiTags('messages')
@Controller('messages')
// @UseGuards(JwtAuthGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

// message.controller.ts

@Post()
@ApiOperation({ summary: 'Create a new message' })
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
  @ApiResponse({ status: 200, description: 'Return the message.', type: Message })
  findOne(@Param('id') id: string) {
    return this.messageService.findOne(+id);
  }
  
  @Get('room/:roomId')
  @ApiOperation({ summary: 'Get messages by room ID' })
  @ApiParam({ name: 'roomId', type: String, description: 'Room ID to fetch messages for' })
  @ApiResponse({ status: 200, description: 'Messages for the specified room', type: [Message] })
  async findByRoomId(@Param('roomId') roomId: string): Promise<Message[]> {
    return this.messageService.findByRoomId(roomId);
  }
  

  @Put(':id')
  @ApiOperation({ summary: 'Update a message' })
  @ApiResponse({ status: 200, description: 'The message has been successfully updated.', type: Message })
  update(@Param('id') id: string, @Body() updateMessageDto: UpdateMessageDto) {
    return this.messageService.update(+id, updateMessageDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a message' })
  @ApiResponse({ status: 200, description: 'The message has been successfully deleted.' })
  remove(@Param('id') id: string) {
    return this.messageService.remove(id);
  }
}
