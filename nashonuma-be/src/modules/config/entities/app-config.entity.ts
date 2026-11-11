import { Column, Entity, PrimaryColumn } from 'typeorm';
import { Json } from '../../../common/records';
import { TimestampedEntity } from '../../../common/entities/timestamped.entity';

/** Small key/value settings documents. Today only "sdq" (the licensed SDQ wording). */
@Entity('app_config')
export class AppConfig extends TimestampedEntity {
  @PrimaryColumn({ type: 'varchar', length: 40 })
  key: string;

  /** null until an admin saves it. */
  @Column({ type: 'jsonb', nullable: true })
  value: Json;

  @Column({ type: 'varchar', length: 200, nullable: true })
  updatedBy: string | null;
}
