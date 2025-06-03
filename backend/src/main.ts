import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'; // Import Swagger
import { INestApplication } from '@nestjs/common';

async function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Chating App API')
    .setDescription('The API documentation for the Chating App')
    .setVersion('1.0')
    .addBearerAuth() // If you use Bearer token authentication (JWT)
    // .addTag('chats') // You can add tags for grouping endpoints
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // Swagger UI will be available at /api
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.FRONTEND_URL , // frontend origin
    credentials: true,
  });

  // Setup Swagger
  setupSwagger(app);

  await app.listen(process.env.PORT ?? 3002);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Swagger documentation is available at: ${await app.getUrl()}/api`); // Log Swagger URL
}
bootstrap();