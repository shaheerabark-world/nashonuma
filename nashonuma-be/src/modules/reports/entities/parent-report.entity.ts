import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { TimestampedEntity } from '../../../common/entities/timestamped.entity';
import { User } from '../../users/entities/user.entity';

/** A "Check my child" report sent from the mother's phone (PR-xxxx). */
@Entity('parent_reports')
export class ParentReport extends TimestampedEntity {
  /** Generated on the phone (newId('PR')), so a check made offline keeps its id. */
  @PrimaryColumn({ type: 'varchar', length: 40 })
  id: string;

  /** Child reg number, or '' for a child the clinic does not know yet. Not a foreign key on purpose. */
  @Column({ type: 'varchar', length: 40, default: '' })
  kid: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'date', nullable: true })
  dob: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  sex: string | null;

  /** Mother's name as typed on the phone. */
  @Column({ type: 'varchar', length: 200, nullable: true })
  mother: string | null;

  @Column({ type: 'varchar', length: 40, nullable: true })
  phone: string | null;

  @Index()
  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  concerns: string[];

  @Column({ type: 'text', default: '' })
  note: string;

  @Column({ type: 'int', default: 0 })
  worry: number;

  @Index()
  @Column({ type: 'varchar', length: 20, default: 'New' })
  status: string;

  /** Which questionnaire: undefined = milestones, 'tq' = Ten Questions, 'sdq' = SDQ. */
  @Column({ type: 'varchar', length: 10, nullable: true })
  instr: string | null;

  @Column({ type: 'varchar', length: 4, nullable: true })
  country: string | null;

  /** Answers keyed by question, e.g. { "tq-1": "y" }. */
  @Column({ type: 'jsonb', default: () => "'{}'" })
  ans: Record<string, unknown>;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  submittedById: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'submitted_by_id' })
  submittedBy?: User | null;
}
