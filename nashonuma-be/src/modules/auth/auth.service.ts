import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthUser } from '../../common/role.enum';
import { PublicUser, UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  role: AuthUser['role'];
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService
  ) {}

  async login(dto: LoginDto): Promise<{ token: string; user: PublicUser }> {
    const user = await this.users.findByEmailWithPassword(dto.email);
    // Same message for an unknown email and a wrong password.
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Email or password is wrong');
    }
    const payload: JwtPayload = { sub: user.id, email: user.email, name: user.name, role: user.role };
    return { token: await this.jwt.signAsync(payload), user: UsersService.toPublic(user) };
  }

  static hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, 10);
  }
}
