import { ArrayMaxSize, ArrayMinSize, IsArray, IsDateString, IsIn, IsInt, IsOptional, IsString, Length, Max, MaxLength, Min } from 'class-validator';

export const WELLBEING_STATUSES = ['New', 'Contacted'] as const;

/** PUT /wellbeing/:id. The same record the web app builds in wellbeing.ts. */
export class UpsertWellbeingDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  @Length(1, 200)
  mother: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @IsOptional()
  @IsDateString({ strict: true })
  baby?: string;

  @IsDateString({ strict: true })
  date: string;

  /** SRQ-20: 20 answers, 0 or 1. */
  @IsArray()
  @ArrayMinSize(20)
  @ArrayMaxSize(20)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(1, { each: true })
  ans: number[];

  @IsOptional()
  @IsIn(['call', 'visit', 'fine'])
  help?: string;

  @IsOptional()
  @IsIn(WELLBEING_STATUSES)
  status?: string;
}
