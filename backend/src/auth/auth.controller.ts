import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { LoginDto } from './login.dto'; // Import LoginDto
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}


@UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Log in a user and return a JWT token' })
  @ApiBody({ type: LoginDto, description: 'User credentials for login' })
  @ApiResponse({
    status: 201, // Or 200 if you prefer for login
    description: 'User logged in successfully. Returns user info and access token.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' },
            username: { type: 'string', example: 'john_doe' }
            // Add other user properties you return, ensure they are decorated in User entity
          }
        },
        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized (Invalid credentials).' })
  async login(@Request() req, @Body() _loginDto: LoginDto) { // _loginDto is for Swagger, req.user is used by the guard
    const userAuthInfo = await this.authService.login(req.user);
    return {
      success: true,
      user: userAuthInfo.user, // Assuming authService.login returns { user: UserProfile, access_token: string }
      token: userAuthInfo.access_token,
    };
  }
}
