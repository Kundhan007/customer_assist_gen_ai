import { plainToInstance, Transform } from 'class-transformer';
import { IsString, IsEnum, IsNumber, IsOptional, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsString()
  @Transform(({ value }) => value?.trim())
  DB_URL!: string;

  @IsString()
  @IsOptional()
  DB_HOST!: string;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  DB_PORT!: number;

  @IsString()
  @IsOptional()
  DB_USER!: string;

  @IsString()
  @IsOptional()
  DB_PASSWORD!: string;

  @IsString()
  @IsOptional()
  DB_NAME!: string;

  @IsString()
  @Transform(({ value }) => {
    if (!value || value === 'your_super_secret_jwt_key_for_testing') {
      throw new Error('JWT_SECRET must be set to a secure value');
    }
    if (value.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters long');
    }
    return value;
  })
  JWT_SECRET!: string;

  @IsString()
  @IsOptional()
  ORCH_URL!: string;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  PORT!: number;

  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV!: Environment;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
