import { IsArray, IsDateString, IsIn, IsInt, IsObject, IsOptional, IsString, Length, Max, MaxLength, Min } from 'class-validator';

export const REPORT_STATUSES = ['New', 'Seen'] as const;

/** PUT /reports/:id. The same record the web app builds in checkMyChild.ts. */
export class UpsertReportDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  kid?: string;

  @IsString()
  @Length(1, 200)
  name: string;

  @IsOptional()
  @IsDateString({ strict: true })
  dob?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  sex?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  mother?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @IsDateString({ strict: true })
  date: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  concerns?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  worry?: number;

  @IsOptional()
  @IsIn(REPORT_STATUSES)
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  instr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4)
  country?: string;

  @IsOptional()
  @IsObject()
  ans?: Record<string, unknown>;
}
