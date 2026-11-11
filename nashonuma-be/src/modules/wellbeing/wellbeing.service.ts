import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { toRecord } from '../../common/records';
import { AuthUser, Role, STAFF_ROLES } from '../../common/role.enum';
import { EventsService } from '../events/events.service';
import { UpsertWellbeingDto } from './dto/upsert-wellbeing.dto';
import { WellbeingReport } from './entities/wellbeing-report.entity';

@Injectable()
export class WellbeingService {
  constructor(
    @InjectRepository(WellbeingReport) private readonly wellbeing: Repository<WellbeingReport>,
    private readonly events: EventsService
  ) {}

  /** Newest first. A mother sees only her own checks. */
  async findAll(user: AuthUser) {
    const rows = await this.wellbeing.find({
      where: user.role === Role.Parent ? { submittedById: user.id } : {},
      order: { date: 'DESC', createdAt: 'DESC' }
    });
    return rows.map(r => toRecord(r));
  }

  /** Same rules as parent reports: a mother only creates; clinician / supervisor may replace. */
  async upsert(id: string, dto: UpsertWellbeingDto, user: AuthUser) {
    if (dto.id && dto.id !== id) throw new BadRequestException('The id in the body does not match the URL');
    const existing = await this.wellbeing.findOne({ where: { id } });

    const fields: Partial<WellbeingReport> = {
      id,
      mother: dto.mother,
      phone: dto.phone ?? null,
      baby: dto.baby ?? null,
      date: dto.date,
      ans: dto.ans,
      help: dto.help ?? null,
      status: dto.status ?? 'New'
    };

    let entity: WellbeingReport;
    if (user.role === Role.Parent) {
      if (existing) throw new ForbiddenException('This check was already sent');
      entity = this.wellbeing.create({ ...fields, status: 'New', submittedById: user.id });
    } else {
      entity = this.wellbeing.create({ ...fields, submittedById: existing?.submittedById ?? null });
    }

    const saved = await this.wellbeing.save(entity);
    this.notify(saved);
    return toRecord(saved);
  }

  async updateStatus(id: string, status: string) {
    const row = await this.wellbeing.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`Wellbeing check ${id} not found`);
    row.status = status;
    const saved = await this.wellbeing.save(row);
    this.notify(saved);
    return toRecord(saved);
  }

  private notify(r: WellbeingReport) {
    this.events.emit({ collection: 'wellbeing', id: r.id, roles: STAFF_ROLES, userId: r.submittedById });
  }
}
