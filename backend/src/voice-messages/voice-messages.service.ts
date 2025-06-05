import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VoiceMessage } from './entities/voice-message.entity';
import { CreateVoiceMessageDto } from './dto/create-voice-message.dto';
import { User } from '../user/user.entity'; // Corrected User entity path
import { CloudinaryService } from '../cloudinary/cloudinary.service'; // Added CloudinaryService import
// import { StorageService } from '../storage/storage.service'; // If you have a generic storage service

@Injectable()
export class VoiceMessagesService {
  private readonly logger = new Logger(VoiceMessagesService.name);

  constructor(
    @InjectRepository(VoiceMessage)
    private readonly voiceMessageRepository: Repository<VoiceMessage>,
    private readonly cloudinaryService: CloudinaryService, // Injected CloudinaryService
    // @Inject(StorageService) private readonly storageService: StorageService, // Example for a dedicated storage service
  ) {}

  async create(
    createVoiceMessageDto: CreateVoiceMessageDto,
    sender: User, // Assuming sender is a User entity instance passed from controller
    file: Express.Multer.File,
  )
  : Promise<VoiceMessage> 
  
  {
    console.log("createVoiceMessageDto", createVoiceMessageDto)

    console.log("file", file)
    if (!file) {
      throw new InternalServerErrorException('Voice file is missing.');
    }

    console.log("createVoiceMessageDto", createVoiceMessageDto);
    console.log("sender",sender)
    console.log("file",file)


    // 1. Upload the file to Cloudinary
    let fileUrl: string;
    try {
      this.logger.log(`Uploading voice file to Cloudinary for sender ${sender.id}...`);
      const uploadResult = await this.cloudinaryService.uploadFile(file);
      fileUrl = uploadResult.secure_url;
      this.logger.log(`File uploaded to Cloudinary, URL: ${fileUrl}`);
    } catch (error) {
      this.logger.error(`Cloudinary upload failed: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to upload voice file.');
    }


    // 2. Create and save the voice message entity
    const voiceMessage = this.voiceMessageRepository.create({
      ...createVoiceMessageDto,
      senderId: sender.id,
      filePath: fileUrl, // Store the Cloudinary URL
      // duration and mimeType are from DTO, file.mimetype could also be used if preferred
    });

    try {
      await this.voiceMessageRepository.save(voiceMessage);
      this.logger.log(`Voice message metadata saved for sender ${sender.id} in conversation ${createVoiceMessageDto.conversationId}`);
      return voiceMessage;
    } catch (error) {
      this.logger.error(`Failed to save voice message: ${error.message}`, error.stack);
      // TODO: If entity save fails, consider deleting the uploaded file to prevent orphans
      throw new InternalServerErrorException('Failed to save voice message metadata.');
    }
  }

  async findOne(id: string): Promise<VoiceMessage> {
    const voiceMessage = await this.voiceMessageRepository.findOne({ where: { id } });
    if (!voiceMessage) {
      throw new NotFoundException(`VoiceMessage with ID "${id}" not found`);
    }
    return voiceMessage;
  }

  // Add other methods as needed, e.g., findAllForConversation, markAsRead, etc.
}


