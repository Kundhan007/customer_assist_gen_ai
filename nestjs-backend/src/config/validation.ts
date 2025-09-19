import { plainToInstance, Transform } from 'class-transformer';
import { IsString, IsUrl, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsString()
  DB_URL: string;

  @IsString()
  JWT_SECRET: string;

  @IsUrl()
  ORCH_URL: string;

  @Transform(({ value }) => parseInt(value, 10))
  PORT: number;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(
    EnvironmentVariables,
    config,
    { enableImplicitConversion: true },
  );
  const errors = validateSync(validatedConfig, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
