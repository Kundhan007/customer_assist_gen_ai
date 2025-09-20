import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { LoggerService } from './utils/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = app.get(LoggerService);
  logger.log('Starting NestJS application...', 'Bootstrap');

  // Enable CORS for React frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor(app.get(LoggerService)));

  const config = new DocumentBuilder()
    .setTitle('Customer Assist Gen AI API')
    .setDescription('API documentation for Customer Assist Gen AI backend. This API provides endpoints for user authentication, policy management, claims processing, chat functionality, and admin operations.')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Enter JWT token (obtained from /auth/login endpoint)',
      name: 'Authorization',
      in: 'header'
    })
    .addTag('Authentication', 'User authentication and authorization')
    .addTag('User', 'User profile and management endpoints')
    .addTag('Policies', 'Insurance policy management')
    .addTag('Claims', 'Insurance claims management')
    .addTag('Chat', 'Chat and messaging functionality')
    .addTag('Admin', 'Administrative operations')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT || 3001);
}
bootstrap();
