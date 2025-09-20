import { IsEmail, IsNotEmpty } from 'class-validator';

export class UpdateUserEmailDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}
