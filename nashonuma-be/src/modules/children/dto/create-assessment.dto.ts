import { ArrayMaxSize, ArrayMinSize, IsArray, IsDateString, IsIn, IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

/** POST /children/:id/assessments. The child is created from these details if the reg number is new. */
export class CreateAssessmentDto {
  @IsString()
  @Length(1, 200)
  name: string;

  @IsDateString({ strict: true })
  dob: string;

  @IsOptional()
  @IsIn(['Boy', 'Girl', '—'])
  sex?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  area?: string;

  @IsDateString({ strict: true })
  date: string;

  /** One score per MORBAS area. */
  @IsArray()
  @ArrayMinSize(7)
  @ArrayMaxSize(7)
  @IsInt({ each: true })
  @Min(1, { each: true })
  scores: number[];

  @IsOptional()
  marks?: unknown;
}
