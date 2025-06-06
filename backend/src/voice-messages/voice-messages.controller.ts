import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  UseGuards,
  Req,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Logger,
  Get,
  Param,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VoiceMessagesService } from './voice-messages.service';
import { CreateVoiceMessageDto } from './dto/create-voice-message.dto';
import { VoiceMessage } from './voice-message.entity'; // Import for ApiResponse type
import {
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger'; // If you use Swagger
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Corrected path
import { User } from '../user/user.entity'; // Corrected User entity path
import { Response } from 'express';
// import { StorageService } from '../storage/storage.service'; // If you have a generic storage service

@ApiTags('Voice Messages')
@Controller('voice-messages')
export class VoiceMessagesController {
  private readonly logger = new Logger(VoiceMessagesController.name);

  constructor(
    private readonly voiceMessagesService: VoiceMessagesService,
    // private readonly storageService: StorageService, // Inject if you have a storage service
  ) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a new voice message' })
  @ApiResponse({
    status: 201,
    description: 'Voice message uploaded successfully.',
    type: VoiceMessage,
  }) // Assuming VoiceMessage entity is the response type
  @ApiResponse({
    status: 400,
    description: 'Bad Request (e.g., validation error, missing file).',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized (JWT token missing or invalid).',
  })
  @ApiResponse({
    status: 413,
    description: 'Payload Too Large (file exceeds size limit).',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  @ApiBearerAuth() // If using JWT
  @UseGuards(JwtAuthGuard) // Protect this route
  @UseInterceptors(FileInterceptor('voiceFile')) // 'voiceFile' is the field name in form-data
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description:
      'Upload a voice message. The voice file should be in the `voiceFile` field. Other details in `CreateVoiceMessageDto` format as a JSON string in a field named `data` or individually.',
    schema: {
      type: 'object',
      properties: {
        voiceFile: {
          type: 'string',
          format: 'binary',
        },
        conversationId: {
          type: 'string',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
        duration: { type: 'number', example: '10.5' },
        mimeType: { type: 'string', example: 'audio/webm' },
      },
    },
  })
  async uploadVoiceMessage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB max file size
        ],
      }),
    )
    file: Express.Multer.File,

    @Body('duration') duration: string,
    @Body('conversationId') conversationId: string,
    @Body('mimeType') mimeType: string,
    @Body() createVoiceMessageDto: CreateVoiceMessageDto, // Multer will populate this if fields are not part of file
    @Req() req: any, // To get the authenticated user
  ) {
    const user = req.user as User; // Assumes JWT strategy attaches user to request
    this.logger.log(
      `Received voice message upload request from user ${user.id} for conversation ${createVoiceMessageDto.conversationId}`,
    );
    const voiceMessage = await this.voiceMessagesService.create(
      createVoiceMessageDto,
      user,
      file,
    );
    // TODO: After saving, you'll likely want to emit an event via Socket.IO to relevant clients
    // For example: this.chatGateway.server.to(conversationId).emit('newVoiceMessage', voiceMessageDto);
    return voiceMessage; // Or a VoiceMessageDto
  }
  @Get('getAllVoiceMessages')
  @ApiOperation({ summary: 'Get all voice messages' })
  @ApiResponse({
    status: 201,
    description: 'Voice messages fetched successfully.',
    type: VoiceMessage,
  }) // Assuming VoiceMessage entity is the response type
  @ApiResponse({
    status: 400,
    description: 'Bad Request  (e.g., validation error on DTO).',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized (JWT token missing or invalid).',
  })
  @ApiResponse({
    status: 413,
    description: 'Payload Too Large (file exceeds size limit).',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  @ApiBearerAuth() // If using JWT
  async getAllVoiceMessages() {
    return this.voiceMessagesService.findALL();
  }
}

// Example: GET endpoint for specific voice message (e.g., for streaming or direct download if needed)
// This requires a proper StorageService to stream files.
// @Get(':id/file')
// @UseGuards(JwtAuthGuard)
// async getVoiceMessageFile(@Param('id') id: string, @Res() res: Response, @Req() req: any) {
//   const voiceMessage = await this.voiceMessagesService.findOne(id);
//   const user = req.user as User;

//   // TODO: Add permission check: does 'user' have access to 'voiceMessage.conversationId'?
//   this.logger.log(`User ${user.id} requested voice file ${id}`);

//   // This is a placeholder for file streaming. You need to implement this with your storage solution.
//   // For local storage, you might use something like:
//   // import * as fs from 'fs';
//   // import { join } from 'path';
//   // const filePath = join(process.cwd(), voiceMessage.filePath); // Adjust path as per your storage structure
//   // if (fs.existsSync(filePath)) {
//   //   res.set({
//   //     'Content-Type': voiceMessage.mimeType,
//   //     // 'Content-Disposition': `attachment; filename="voice_message_${voiceMessage.id}"`, // For download
//   //   });
//   //   const fileStream = fs.createReadStream(filePath);
//   //   fileStream.pipe(res);
//   // } else {
//   //   throw new NotFoundException('Voice file not found on server.');
//   // }

//   // If using a cloud storage service (S3, GCS, etc.):
//   // const fileStream = await this.storageService.getFileStream(voiceMessage.filePath);
//   // res.set({ 'Content-Type': voiceMessage.mimeType });
//   // fileStream.pipe(res);
//   res.status(501).send('File streaming not implemented yet.');
// }
