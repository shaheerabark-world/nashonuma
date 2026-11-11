import { EntityManager } from 'typeorm';
import { Role } from '../../common/role.enum';
import { User } from '../../modules/users/entities/user.entity';
import { PARENT_PHONE } from '../seeder';

const digits = (s?: string | null) => (s ?? '').replace(/\D/g, '');

/** The demo parent account, and a phone matcher to link her sample records. Run the users seeder first. */
export async function parentUserId(em: EntityManager) {
  const parent = await em.getRepository(User).findOne({ where: { role: Role.Parent, phone: PARENT_PHONE } });
  return {
    id: parent?.id ?? null,
    matches: (phone?: string | null) => !!parent && digits(phone) === digits(PARENT_PHONE)
  };
}

/** Clinician user ids by name, to link past MORBAS assessments to an account. */
export async function userIdsByName(em: EntityManager) {
  const users = await em.getRepository(User).find();
  return new Map(users.map(u => [u.name, u.id]));
}
