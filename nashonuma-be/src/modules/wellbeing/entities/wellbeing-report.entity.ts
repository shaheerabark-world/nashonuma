import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { TimestampedEntity } from '../../../common/entities/timestamped.entity';
import { User } from '../../users/entities/user.entity';

/** A mother's SRQ-20 wellbeing check (MW-xxxx). */
@Entity('wellbeing_reports')
export class WellbeingReport extends TimestampedEntity {
  /** Generated on the phone, like parent reports. */
  @PrimaryColumn({ type: 'varchar', length: 40 })
  id: string;

  @Column({ type: 'varchar', length: 200 })
  mother: string;

  @Column({ type: 'varchar', length: 40, nullable: true })
  phone: string | null;

  /** Baby's date of birth. */
  @Column({ type: 'date', nullable: true })
  baby: string | null;

  @Index()
  @Column({ type: 'date' })
  date: string;

  /** 20 answers, 1 = yes, 0 = no. */
  @Column({ type: 'smallint', array: true })
  ans: number[];

  /** What help she asked for: call, visit or fine. */
  @Column({ type: 'varchar', length: 20, nullable: true })
  help: string | null;

  @Index()
  @Column({ type: 'varchar', length: 20, default: 'New' })
  status: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  submittedById: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'submitted_by_id' })
  submittedBy?: User | null;
}
