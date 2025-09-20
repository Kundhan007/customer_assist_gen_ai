import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { setupTestDatabase, teardownTestDatabase } from '@test/database.setup';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/entities/user.entity';
import { Policy } from '@/entities/policy.entity';
import { Claim } from '@/entities/claim.entity';
import { Premium } from '@/entities/premium.entity';
import { AuthModule } from '@/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ConfigModule as AppConfigModule } from '@/config/config.module';
import { TEST_USERS } from '@test/test-data';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // Load test environment variables explicitly
    dotenv.config({ path: path.resolve(__dirname, '..', '.env.test') });
    process.env.NODE_ENV = 'test';
    
    console.log('🔧 Auth test using DB:', process.env.DB_URL);
    console.log('🔑 Auth test JWT_SECRET length:', process.env.JWT_SECRET?.length);
    
    await setupTestDatabase();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: path.resolve(__dirname, '..', '.env.test'),
        }),
        TypeOrmModule.forRoot({
          type: 'postgres',
          url: process.env.DB_URL!,
          entities: [User, Policy, Claim, Premium],
          synchronize: false,
          logging: false,
        }),
        AppConfigModule,
        AuthModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await teardownTestDatabase();
  });

  it('/auth/login (POST) - success', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: TEST_USERS.JOHN_DOE.email, password: TEST_USERS.JOHN_DOE.password })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('access_token');
      });
  });

  it('/auth/login (POST) - wrong password', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: TEST_USERS.JOHN_DOE.email, password: 'wrongpassword' })
      .expect(401);
  });

  it('/auth/login (POST) - user not found', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'notfound@example.com', password: TEST_USERS.JOHN_DOE.password })
      .expect(401);
  });
});
