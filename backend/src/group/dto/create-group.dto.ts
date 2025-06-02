import { IsString, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGroupDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({
    type: Number,
    isArray: true,
    required: false,
  })
  @IsArray()
  @IsOptional()
  membersIds: number[];
}
