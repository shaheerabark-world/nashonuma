import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../../common/role.enum';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const jwt = new JwtService({ secret: 'test' });

  async function setup(found: boolean) {
    const passwordHash = await AuthService.hashPassword('right');
    const user = { id: 'u1', email: 'clinician@nashonuma.test', name: 'Dr Sana Iqbal', initials: 'SI', job: 'Paediatrician', role: Role.Clinician, phone: null, passwordHash };
    const users = { findByEmailWithPassword: jest.fn().mockResolvedValue(found ? user : null) } as unknown as UsersService;
    return new AuthService(users, jwt);
  }

  it('returns a token carrying the role, and never the hash', async () => {
    const auth = await setup(true);
    const out = await auth.login({ email: 'clinician@nashonuma.test', password: 'right' });
    expect(jwt.verify(out.token)).toMatchObject({ sub: 'u1', role: 'clinician' });
    expect(out.user).not.toHaveProperty('passwordHash');
  });

  it('rejects a wrong password', async () => {
    const auth = await setup(true);
    await expect(auth.login({ email: 'clinician@nashonuma.test', password: 'wrong' })).rejects.toThrow(UnauthorizedException);
  });

  it('rejects an unknown email with the same error', async () => {
    const auth = await setup(false);
    await expect(auth.login({ email: 'nobody@x.test', password: 'right' })).rejects.toThrow('Email or password is wrong');
  });
});
