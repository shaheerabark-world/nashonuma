import { EntityManager } from 'typeorm';
import { Role } from '../../common/role.enum';
import { AuthService } from '../../modules/auth/auth.service';
import { User } from '../../modules/users/entities/user.entity';
import { PARENT_PHONE, Seeder } from '../seeder';

/** One demo user per role, from USERS in the web app's src/data/mock/app.ts. */
const USERS: { role: Role; initials: string; name: string; job: string; phone?: string }[] = [
  { role: Role.Supervisor, initials: 'RB', name: 'Rukhsana Begum', job: 'Supervisor' },
  { role: Role.Clinician, initials: 'SI', name: 'Dr Sana Iqbal', job: 'Paediatrician' },
  { role: Role.Programme, initials: 'IK', name: 'Imran Khattak', job: 'Programme manager' },
  { role: Role.Researcher, initials: 'HM', name: 'Dr Hira Malik', job: 'Research lead' },
  { role: Role.Admin, initials: 'FA', name: 'Faisal Ahmed', job: 'System admin' },
  { role: Role.Parent, initials: 'SB', name: 'Shazia Bibi', job: 'Mother', phone: PARENT_PHONE }
];

export const seedEmail = (role: Role) => `${role}@nashonuma.test`;

export class UsersSeeder implements Seeder {
  readonly name = 'users';

  async run(em: EntityManager): Promise<number> {
    const password = process.env.SEED_PASSWORD || 'Password123!';
    const passwordHash = await AuthService.hashPassword(password);
    const rows = USERS.map(u => ({
      email: seedEmail(u.role),
      name: u.name,
      initials: u.initials,
      job: u.job,
      role: u.role,
      phone: u.phone ?? null,
      passwordHash
    }));
    // Upsert on email keeps each user's id stable across runs.
    await em.getRepository(User).upsert(rows, { conflictPaths: ['email'] });
    return rows.length;
  }
}
