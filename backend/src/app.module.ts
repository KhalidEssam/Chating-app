// src/app.module.ts
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RateLimiterMiddleware } from './middleware/rate-limiter.middleware'; // Import rate limiter middleware

import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';

import { MessageModule } from './message/message.module';
import { UserModule } from './user/user.module';
import { GroupModule } from './group/group.module';
import { VoiceMessagesModule } from './voice-messages/voice-messages.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module'; // Added CloudinaryModule import
import { SocketsModule } from './sockets/sockets.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      logging: true,
    }),
    AuthModule,
    MessageModule,
    UserModule,
    GroupModule,
    VoiceMessagesModule,
    CloudinaryModule,
    SocketsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RateLimiterMiddleware)
      .forRoutes('*');
  }
}
