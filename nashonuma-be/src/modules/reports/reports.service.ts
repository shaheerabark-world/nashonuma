import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { toRecord } from '../../common/records';
import { AuthUser, Role, STAFF_ROLES } from '../../common/role.enum';
import { EventsService } from '../events/events.service';
import { UpsertReportDto } from './dto/upsert-report.dto';
import { ParentReport } from './entities/parent-report.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(ParentReport) private readonly reports: Repository<ParentReport>,
    private readonly events: EventsService
  ) {}

  /** Newest first. A parent sees only the checks she sent. */
  async findAll(user: AuthUser) {
    const rows = await this.reports.find({
      where: user.role === Role.Parent ? { submittedById: user.id } : {},
      order: { date: 'DESC', createdAt: 'DESC' }
    });
    return rows.map(r => toRecord(r));
  }

  /**
   * Insert or replace by id.
   * Parent: may only send a new check (it is always saved as New and linked to her).
   * Clinician / supervisor: may replace a report, e.g. to mark it Seen.
   */
  async upsert(id: string, dto: UpsertReportDto, user: AuthUser) {
    if (dto.id && dto.id !== id) throw new BadRequestException('The id in the body does not match the URL');
    const existing = await this.reports.findOne({ where: { id } });

    let entity: ParentReport;
    if (user.role === Role.Parent) {
      if (existing) throw new ForbiddenException('This check was already sent');
      entity = this.reports.create({ ...ReportsService.fields(dto), id, status: 'New', submittedById: user.id });
    } else {
      entity = this.reports.create({ ...ReportsService.fields(dto), id, submittedById: existing?.submittedById ?? null });
    }

    const saved = await this.reports.save(entity);
    this.notify(saved);
    return toRecord(saved);
  }

  async updateStatus(id: string, status: string) {
    const report = await this.reports.findOne({ where: { id } });
    if (!report) throw new NotFoundException(`Report ${id} not found`);
    report.status = status;
    const saved = await this.reports.save(report);
    this.notify(saved);
    return toRecord(saved);
  }

  private notify(r: ParentReport) {
    this.events.emit({ collection: 'reports', id: r.id, roles: STAFF_ROLES, userId: r.submittedById });
  }

  /** DTO -> columns, with defaults for the optional ones. */
  private static fields(dto: UpsertReportDto): Partial<ParentReport> {
    return {
      kid: dto.kid ?? '',
      name: dto.name,
      dob: dto.dob ?? null,
      sex: dto.sex ?? null,
      mother: dto.mother ?? null,
      phone: dto.phone ?? null,
      date: dto.date,
      concerns: dto.concerns ?? [],
      note: dto.note ?? '',
      worry: dto.worry ?? 0,
      status: dto.status ?? 'New',
      instr: dto.instr ?? null,
      country: dto.country ?? null,
      ans: dto.ans ?? {}
    };
  }
}
