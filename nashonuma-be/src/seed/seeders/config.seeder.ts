import { EntityManager } from 'typeorm';
import { AppConfig } from '../../modules/config/entities/app-config.entity';
import { Seeder } from '../seeder';

/** Creates the empty "sdq" row. Never overwrites licensed text an admin has already saved. */
export class ConfigSeeder implements Seeder {
  readonly name = 'config';

  async run(em: EntityManager): Promise<number> {
    const result = await em
      .createQueryBuilder()
      .insert()
      .into(AppConfig)
      .values({ key: 'sdq', value: null, updatedBy: null })
      .orIgnore()
      .execute();
    return result.identifiers.filter(Boolean).length;
  }
}
