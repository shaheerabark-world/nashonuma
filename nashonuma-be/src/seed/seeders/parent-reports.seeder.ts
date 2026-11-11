import { EntityManager } from 'typeorm';
import { ParentReport } from '../../modules/reports/entities/parent-report.entity';
import parentReports from '../data/parentReports.json';
import { Seeder } from '../seeder';
import { parentUserId } from './helpers';

type RawReport = (typeof parentReports)[number] & { instr?: string; country?: string };

export class ParentReportsSeeder implements Seeder {
  readonly name = 'reports';

  async run(em: EntityManager): Promise<number> {
    const mother = await parentUserId(em);
    const rows = (parentReports as RawReport[]).map(r => ({
      id: r.id,
      kid: r.kid ?? '',
      name: r.name,
      dob: r.dob ?? null,
      sex: r.sex ?? null,
      mother: r.mother ?? null,
      phone: r.phone ?? null,
      date: r.date,
      concerns: r.concerns ?? [],
      note: r.note ?? '',
      worry: r.worry ?? 0,
      status: r.status ?? 'New',
      instr: r.instr ?? null,
      country: r.country ?? null,
      ans: r.ans ?? {},
      submittedById: mother.matches(r.phone) ? mother.id : null
    }));
    await em.getRepository(ParentReport).upsert(rows, { conflictPaths: ['id'] });
    return rows.length;
  }
}
