import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//     constructor(
//         private configService: ConfigService,
//         @InjectRepository(User)
//         private userRepository: Repository<User>
//       ) {
//         const secret = configService.get<string>('JWT_SECRET');
//         if (!secret) {
//           throw new Error('JWT_SECRET must be set');
//         }
      
//         super({
//           jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//           secretOrKey: secret,
//           ignoreExpiration: false,
//           algorithms: ['HS256'],
//           passReqToCallback: true
//         });
//       }

//   async validate(req: any, payload: any): Promise<User> {
//     const { userId } = payload;    const user = await this.userRepository.findOne({
//       where: { id: userId },
//       select: ['id', 'username', 'email'] // Only select necessary fields for security
//     });

//     if (!user) {
//       throw new UnauthorizedException();
//     }
//     return user;
//   }
// }

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
      ignoreExpiration: false,
    });
  }

  async validate(payload: { userId: string }): Promise<User> {
    const user = await this.userRepository.findOneBy({ id: payload.userId });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}