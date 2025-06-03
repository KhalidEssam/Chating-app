import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'The username for the new user. Must be unique.', example: 'john_doe', minLength: 3, required: true })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({ description: 'The email address for the new user. Must be unique.', example: 'john.doe@example.com', required: true })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'The password for the new user.', example: 'P@$$wOrd123', minLength: 6, required: true, format: 'password' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'The first name of the new user.', example: 'John', minLength: 3, required: true })
  @IsString()
  @MinLength(3)
  firstName: string;

  @ApiProperty({ description: 'The last name of the new user.', example: 'Doe', minLength: 3, required: true })
  @IsString()
  @MinLength(3)
  lastName: string;
}
