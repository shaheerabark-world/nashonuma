/**
 * npm run seed                   all seeders, in order
 * npm run seed -- --only=users   one seeder (users, children, morbas, reports, wellbeing, config)
 * npm run db:reset               drop everything, run migrations, then seed (not in production)
 */
import dataSource from '../config/data-source';
import { Seeder } from './seeder';
import { ChildrenSeeder } from './seeders/children.seeder';
import { ConfigSeeder } from './seeders/config.seeder';
import { MorbasSeeder } from './seeders/morbas.seeder';
import { ParentReportsSeeder } from './seeders/parent-reports.seeder';
import { UsersSeeder } from './seeders/users.seeder';
import { WellbeingSeeder } from './seeders/wellbeing.seeder';

/** Order matters: users first (others link to them), children before their assessments. */
export const SEEDERS: Seeder[] = [
  new UsersSeeder(),
  new ChildrenSeeder(),
  new MorbasSeeder(),
  new ParentReportsSeeder(),
  new WellbeingSeeder(),
  new ConfigSeeder()
];

export async function runSeeders(only?: string) {
  const list = only ? SEEDERS.filter(s => s.name === only) : SEEDERS;
  if (only && list.length === 0) throw new Error(`Unknown seeder "${only}". Use one of: ${SEEDERS.map(s => s.name).join(', ')}`);
  await dataSource.transaction(async em => {
    for (const s of list) {
      const n = await s.run(em);
      console.log(`  ${s.name.padEnd(10)} ${n} rows`);
    }
  });
}

async function main() {
  const args = process.argv.slice(2);
  const reset = args.includes('--reset');
  const only = args.find(a => a.startsWith('--only='))?.split('=')[1];

  if (reset && process.env.NODE_ENV === 'production') throw new Error('db:reset is blocked when NODE_ENV=production');

  await dataSource.initialize();
  try {
    if (reset) {
      console.log('Dropping all tables...');
      await dataSource.dropDatabase();
      const ran = await dataSource.runMigrations();
      console.log(`Ran ${ran.length} migration(s)`);
    }
    console.log('Seeding:');
    await runSeeders(only);
    console.log('Done.');
  } finally {
    await dataSource.destroy();
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
