import { IsObject } from 'class-validator';

export const SDQ_LANGS = ['en', 'ur', 'mn'] as const;
export const SDQ_ITEM_COUNT = 25;

/** PUT /config/sdq: { items: { en: [25 strings], ur: [...], mn: [...] } }. At least one language. */
export class SdqConfigDto {
  @IsObject()
  items: Partial<Record<(typeof SDQ_LANGS)[number], string[]>>;
}
