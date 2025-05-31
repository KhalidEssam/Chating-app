import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';   // <-- import your controller
import { AuthService } from './auth.service';         // <-- import your service
import { LocalStrategy } from './local.strategy';     // <-- if you have this

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }), // ✅ Set default here
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRATION') },
      }),
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AuthController],     // <--- Add your controller here!
  providers: [
    AuthService,                     // <--- Add your AuthService here!
    JwtStrategy,
    LocalStrategy,                   // <--- Add your LocalStrategy if used by LocalAuthGuard
  ],
  exports: [JwtModule],
})
export class AuthModule {}
