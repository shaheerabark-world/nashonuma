import { EntityManager } from 'typeorm';
import { WellbeingReport } from '../../modules/wellbeing/entities/wellbeing-report.entity';
import wellbeingReports from '../data/wellbeingReports.json';
import { Seeder } from '../seeder';
import { parentUserId } from './helpers';

export class WellbeingSeeder implements Seeder {
  readonly name = 'wellbeing';

  async run(em: EntityManager): Promise<number> {
    const mother = await parentUserId(em);
    const rows = wellbeingReports.map(r => ({
      id: r.id,
      mother: r.mother,
      phone: r.phone ?? null,
      baby: r.baby ?? null,
      date: r.date,
      ans: r.ans,
      help: r.help ?? null,
      status: r.status ?? 'New',
      submittedById: mother.matches(r.phone) ? mother.id : null
    }));
    await em.getRepository(WellbeingReport).upsert(rows, { conflictPaths: ['id'] });
    return rows.length;
  }
}
