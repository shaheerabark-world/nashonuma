import { IsIn } from 'class-validator';
import { REPORT_STATUSES } from './upsert-report.dto';

/** PATCH /reports/:id */
export class UpdateReportStatusDto {
  @IsIn(REPORT_STATUSES)
  status: string;
}
