import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthUser } from '../../common/role.enum';
import { EventsService } from '../events/events.service';
import { SDQ_ITEM_COUNT, SDQ_LANGS, SdqConfigDto } from './dto/sdq-config.dto';
import { AppConfig } from './entities/app-config.entity';

export const CONFIG_KEYS = ['sdq'] as const;

@Injectable()
export class AppConfigService {
  constructor(
    @InjectRepository(AppConfig) private readonly config: Repository<AppConfig>,
    private readonly events: EventsService
  ) {}

  /** Every config document, e.g. { sdq: {...} | null }. */
  async findAll(): Promise<Record<string, unknown>> {
    const rows = await this.config.find();
    const out: Record<string, unknown> = Object.fromEntries(CONFIG_KEYS.map(k => [k, null]));
    for (const r of rows) out[r.key] = r.value ?? null;
    return out;
  }

  /** Saves the licensed SDQ wording. Same checks as the admin screen: exactly 25 items per language. */
  async saveSdq(dto: SdqConfigDto, user: AuthUser) {
    const items: Record<string, string[]> = {};
    for (const lang of SDQ_LANGS) {
      const list = dto.items[lang];
      if (list === undefined) continue;
      if (!Array.isArray(list) || list.length !== SDQ_ITEM_COUNT) {
        throw new BadRequestException(`${lang.toUpperCase()} needs exactly ${SDQ_ITEM_COUNT} items`);
      }
      items[lang] = list.map(String);
    }
    if (Object.keys(items).length === 0) throw new BadRequestException('Each language needs exactly 25 items');

    const value = { items, by: user.name, at: new Date().toISOString().slice(0, 10) };
    await this.config.save(this.config.create({ key: 'sdq', value, updatedBy: user.name }));
    this.events.emit({ collection: 'config', id: 'sdq' });
    return value;
  }
}
