import { IsIn } from 'class-validator';
import { WELLBEING_STATUSES } from './upsert-wellbeing.dto';

/** PATCH /wellbeing/:id */
export class UpdateWellbeingStatusDto {
  @IsIn(WELLBEING_STATUSES)
  status: string;
}
