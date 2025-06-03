import { ApiProperty } from '@nestjs/swagger'; // If you use Swagger

export class VoiceMessageDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  senderId: string;

  @ApiProperty()
  conversationId: string;

  @ApiProperty()
  filePath: string;

  @ApiProperty()
  duration: number;

  @ApiProperty()
  mimeType: string;

  @ApiProperty()
  isRead: boolean;

  @ApiProperty()
  createdAt: Date;

  constructor(partial: Partial<VoiceMessageDto>) {
    Object.assign(this, partial);
  }
}
