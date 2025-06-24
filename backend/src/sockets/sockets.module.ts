import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { MessageModule } from '../message/message.module';
import { VoiceMessagesModule } from '../voice-messages/voice-messages.module';

@Module({
  imports: [
    MessageModule,
    VoiceMessagesModule,
  ],
  providers: [ChatGateway],
})
export class SocketsModule {}
