import { EntityManager } from 'typeorm';
import { Child } from '../../modules/children/entities/child.entity';
import children from '../data/children.json';
import parentReports from '../data/parentReports.json';
import { parentUserId } from './helpers';
import { Seeder } from '../seeder';

export class ChildrenSeeder implements Seeder {
  readonly name = 'children';

  async run(em: EntityManager): Promise<number> {
    const motherId = await parentUserId(em);
    // The demo mother's children are the ones she has sent checks for.
    const hers = new Set(parentReports.filter(r => motherId.matches(r.phone)).map(r => r.kid));

    const rows = children.map(c => ({
      id: c.id,
      name: c.name,
      sex: c.sex,
      dob: c.dob,
      area: c.area,
      country: (c as { country?: string }).country ?? null,
      motherUserId: hers.has(c.id) ? motherId.id : null
    }));
    await em.getRepository(Child).upsert(rows, { conflictPaths: ['id'] });
    return rows.length;
  }
}
