import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        @InjectRepository(User)
        private userRepository: Repository<User>
      ) {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET must be set');
        }
      
        super({
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
          secretOrKey: secret,
          ignoreExpiration: false,
          algorithms: ['HS256'],
        });
      }
      

  async validate(payload: any): Promise<User> {
    const { userId } = payload;
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'username', 'email'] // Only select necessary fields for security
    });

    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
