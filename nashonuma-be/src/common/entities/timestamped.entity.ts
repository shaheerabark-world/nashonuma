import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

/** Shared audit columns. Extended by every entity. */
export abstract class TimestampedEntity {
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
