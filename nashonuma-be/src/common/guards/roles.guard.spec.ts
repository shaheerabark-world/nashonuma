import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../role.enum';
import { RolesGuard } from './roles.guard';

const ctxFor = (role?: Role) =>
  ({
    getHandler: () => null,
    getClass: () => null,
    switchToHttp: () => ({ getRequest: () => ({ user: role ? { id: 'u1', role } : undefined }) })
  }) as unknown as ExecutionContext;

describe('RolesGuard', () => {
  const reflector = new Reflector();
  const guard = new RolesGuard(reflector);

  it('allows any signed-in user when the route has no @Roles', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    expect(guard.canActivate(ctxFor(Role.Parent))).toBe(true);
  });

  it('allows a listed role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.Clinician, Role.Supervisor]);
    expect(guard.canActivate(ctxFor(Role.Clinician))).toBe(true);
  });

  it('rejects a role that is not listed', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.Admin]);
    expect(() => guard.canActivate(ctxFor(Role.Parent))).toThrow(ForbiddenException);
  });

  it('rejects when there is no user', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.Admin]);
    expect(() => guard.canActivate(ctxFor())).toThrow(ForbiddenException);
  });
});
