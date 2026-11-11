import { SetMetadata } from '@nestjs/common';
import { Role } from '../role.enum';

export const ROLES_KEY = 'roles';
/** Limits a route to these roles. Routes without @Roles are open to any signed-in user. */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
