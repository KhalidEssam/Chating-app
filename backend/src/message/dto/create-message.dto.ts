import { IsString, IsOptional, IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @IsString()
  @ApiProperty()
  content: string;

  @ApiProperty()
  @IsUUID()
  senderId: string;

  @IsString()
  roomId: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  receiverId?: string;

  // @IsOptional()
  @IsString()
  @ApiProperty({ required: true })
  groupId?: string;
}
