import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TimestampedEntity } from '../../../common/entities/timestamped.entity';
import { Role } from '../../../common/role.enum';

@Entity('users')
export class User extends TimestampedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 4 })
  initials: string;

  @Column({ type: 'varchar', length: 100 })
  job: string;

  @Column({ type: 'enum', enum: Role, enumName: 'user_role' })
  role: Role;

  @Column({ type: 'varchar', length: 40, nullable: true })
  phone: string | null;

  /** Never returned unless asked for with addSelect (login only). */
  @Column({ type: 'varchar', length: 100, select: false })
  passwordHash: string;
}
