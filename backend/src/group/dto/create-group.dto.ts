import { IsString, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGroupDto {
  @ApiProperty({ description: 'Name of the group', example: 'Project Alpha Team', required: true, minLength: 3, maxLength: 50 })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Array of user IDs to be added as members to the group. The creating user is typically added automatically.',
    type: [String], // Changed from Number to String to match UUID format of User ID
    format: 'uuid',
    isArray: true,
    required: false,
    example: ['a1b2c3d4-e5f6-7890-1234-567890abcdef', 'b2c3d4e5-f6g7-8901-2345-678901ghijkl']
  })
  @IsArray()
  @IsOptional()
  // Consider adding @IsUUID({ each: true }) if you want to validate each string as a UUID
  membersIds?: string[]; // Changed from number[] to string[]
}
