import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}


@UseGuards(LocalAuthGuard)
@Post('login')
async login(@Request() req) {
  const user = await this.authService.login(req.user);
  return {
    success: true,
    user: user.user,
    token: user.access_token,
  };
}
}
