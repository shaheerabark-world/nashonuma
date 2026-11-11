import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { TimestampedEntity } from '../../../common/entities/timestamped.entity';
import { User } from '../../users/entities/user.entity';
import { MorbasAssessment } from './morbas-assessment.entity';

/** A child known to the clinic. The id is the registration number, e.g. CH-1021. */
@Entity('children')
export class Child extends TimestampedEntity {
  @PrimaryColumn({ type: 'varchar', length: 40 })
  id: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 20, default: '—' })
  sex: string;

  @Column({ type: 'date' })
  dob: string;

  @Column({ type: 'varchar', length: 100, default: '—' })
  area: string;

  @Column({ type: 'varchar', length: 4, nullable: true })
  country: string | null;

  /** The parent account this child belongs to, if the mother uses the app. */
  @Column({ type: 'uuid', nullable: true })
  motherUserId: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'mother_user_id' })
  motherUser?: User | null;

  @OneToMany(() => MorbasAssessment, a => a.child)
  assessments?: MorbasAssessment[];
}
