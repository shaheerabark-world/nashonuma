import { EntityManager } from 'typeorm';
import { MorbasAssessment } from '../../modules/children/entities/morbas-assessment.entity';
import children from '../data/children.json';
import { Seeder } from '../seeder';
import { userIdsByName } from './helpers';

/** Past MORBAS assessments: the hist[] of every child in children.json. Run after the children seeder. */
export class MorbasSeeder implements Seeder {
  readonly name = 'morbas';

  async run(em: EntityManager): Promise<number> {
    const byName = await userIdsByName(em);
    const rows = children.flatMap(c =>
      c.hist.map(h => ({
        id: h.id,
        childId: c.id,
        date: h.date,
        by: h.by,
        byUserId: byName.get(h.by) ?? null,
        scores: h.scores,
        marks: null
      }))
    );
    if (rows.length) await em.getRepository(MorbasAssessment).upsert(rows, { conflictPaths: ['id'] });
    return rows.length;
  }
}
