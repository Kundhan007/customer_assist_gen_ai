import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  validateUser(email: string, password: string): any {
    // In a real app, you would check the user against a database
    if (email === 'test@example.com' && password === 'password') {
      return { userId: 1, email: 'test@example.com' };
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    const payload = { email: user.email, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  generateToken(user: any): string {
    const payload = { email: user.email, sub: user.userId };
    return this.jwtService.sign(payload);
  }
}
