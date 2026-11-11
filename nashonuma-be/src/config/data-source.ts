import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

loadEnv({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

/** Settings shared by the Nest app, the migration CLI and the seeders. */
export const baseDataSourceOptions = {
  type: 'postgres' as const,
  url: process.env.DATABASE_URL,
  namingStrategy: new SnakeNamingStrategy(),
  migrations: [join(__dirname, '..', 'migrations', '*.{ts,js}')],
  synchronize: false
};

/** Used outside Nest (migration CLI, seeders), so entities are found by glob. */
export const cliDataSourceOptions: DataSourceOptions = {
  ...baseDataSourceOptions,
  entities: [join(__dirname, '..', 'modules', '**', 'entities', '*.entity.{ts,js}')]
};

export default new DataSource(cliDataSourceOptions);
