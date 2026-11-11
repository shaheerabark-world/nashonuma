import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { TimestampedEntity } from '../../../common/entities/timestamped.entity';
import { Json } from '../../../common/records';
import { User } from '../../users/entities/user.entity';
import { Child } from './child.entity';

/** One MORBAS assessment: 7 area scores (and the item marks when entered in the app). */
@Entity('morbas_assessments')
export class MorbasAssessment extends TimestampedEntity {
  /** MB-xxxx, assigned by the server. */
  @PrimaryColumn({ type: 'varchar', length: 40 })
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 40 })
  childId: string;

  @ManyToOne(() => Child, c => c.assessments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'child_id' })
  child?: Child;

  @Column({ type: 'date' })
  date: string;

  /** Name of the clinician, as shown in the history. */
  @Column({ type: 'varchar', length: 200 })
  by: string;

  @Column({ type: 'uuid', nullable: true })
  byUserId: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'by_user_id' })
  byUser?: User | null;

  @Column({ type: 'int', array: true })
  scores: number[];

  @Column({ type: 'jsonb', nullable: true })
  marks: Json;
}
