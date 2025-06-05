import { IsString, IsOptional, IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty({ description: 'The content of the message.', example: 'Hello there!', required: true })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'ID of the user sending the message.', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', format: 'uuid', required: true })
  @IsUUID()
  @IsNotEmpty()
  sender: {
    id: string,
    username: string,
  };

  @ApiProperty({ description: 'ID of the room (conversation or group) this message belongs to.', example: 'room-xyz-789', required: true })
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @ApiProperty({ description: 'ID of the direct message recipient user. Required for one-on-one messages.', example: 'b2c3d4e5-f6g7-8901-2345-678901abcdef', format: 'uuid', required: false })
  @IsOptional()
  @IsUUID() // Assuming receiverId is also a UUID if it's a user ID
  receiverId?: string;

  @ApiProperty({ description: 'ID of the group this message belongs to. Required for group messages.', example: 'g1h2i3j4-k5l6-7890-1234-567890mnopqr', format: 'uuid', required: false }) // Making it not strictly required, logic should handle one of receiverId or groupId
  @IsOptional()
  @IsUUID() // Assuming groupId is also a UUID
  groupId?: string;
}
