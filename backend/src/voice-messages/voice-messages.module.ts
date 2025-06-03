import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VoiceMessage } from './entities/voice-message.entity';
import { VoiceMessagesService } from './voice-messages.service';
import { VoiceMessagesController } from './voice-messages.controller';
import { UserModule } from '../user/user.module'; // Corrected path
import { CloudinaryModule } from '../cloudinary/cloudinary.module'; // Added CloudinaryModule import
// import { ConversationsModule } from '../conversations/conversations.module';
// import { StorageModule } from '../storage/storage.module'; // If you create a dedicated StorageModule
// import { AuthModule } from '../auth/auth.module'; // Often needed for JwtAuthGuard

@Module({
  imports: [
    TypeOrmModule.forFeature([VoiceMessage]),
    UserModule, // Provides User entity/service if needed for relations or validation
    CloudinaryModule, // Added CloudinaryModule for file uploads
    // forwardRef(() => ConversationsModule), // Use forwardRef if ConversationsModule might depend on VoiceMessagesModule
    // AuthModule, // Import if JwtAuthGuard or other auth components are directly used here and not globally provided
    // StorageModule, // Import if you have a shared storage module for file operations
  ],
  controllers: [VoiceMessagesController],
  providers: [VoiceMessagesService],
  exports: [VoiceMessagesService], // Export if other modules (e.g., a ChatGateway) need to use this service
})
export class VoiceMessagesModule {}
