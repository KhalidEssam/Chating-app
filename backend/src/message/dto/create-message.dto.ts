import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  content: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  senderId: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  receiverId?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  groupId?: string;
}
