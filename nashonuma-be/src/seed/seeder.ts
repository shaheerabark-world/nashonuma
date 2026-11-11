import { EntityManager } from 'typeorm';

/** Demo accounts. The parent is Shazia Bibi, who sent most of the sample checks. */
export const PARENT_PHONE = '+92 312 448 2210';

export interface Seeder {
  /** Used with --only=<name>. */
  readonly name: string;
  /** Must be idempotent: upsert by primary key, never duplicate. Returns the number of rows written. */
  run(em: EntityManager): Promise<number>;
}
