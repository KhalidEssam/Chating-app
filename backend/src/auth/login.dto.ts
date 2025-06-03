import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Username of the user',
    example: 'john_doe',
    required: true,
  })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({
    description: 'Password for the user account',
    example: 'P@$$wOrd123',
    minLength: 6,
    required: true,
    format: 'password',
  })
  @IsString()
  @MinLength(6)
  password: string;
}
