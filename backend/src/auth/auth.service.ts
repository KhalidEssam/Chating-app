import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { username },
      select: ['id', 'username', 'password'] // Only select necessary fields
    });

    if (user && (await this.comparePasswords(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { userId: user.id, username: user.username };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  private async comparePasswords(plainTextPassword: string, hashedPassword: string): Promise<boolean> {
    // You should implement your password hashing comparison logic here
    // For example, if you're using bcrypt:
    // return await bcrypt.compare(plainTextPassword, hashedPassword);
    // For now, we'll just return true for testing purposes
    return true;
  }
}
