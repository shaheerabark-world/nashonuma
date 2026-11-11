import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Json, toRecord } from '../../common/records';
import { AuthUser, Role, STAFF_ROLES } from '../../common/role.enum';
import { EventsService } from '../events/events.service';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { Child } from './entities/child.entity';
import { MorbasAssessment } from './entities/morbas-assessment.entity';

/** New numbers continue after the prototype's MB-3xxx sample range. */
const FIRST_MB_NUMBER = 3200;

@Injectable()
export class ChildrenService {
  constructor(
    @InjectRepository(Child) private readonly children: Repository<Child>,
    @InjectDataSource() private readonly db: DataSource,
    private readonly events: EventsService
  ) {}

  /** Children with their MORBAS history, the same shape as children.json in the web app. */
  async findAll(user: AuthUser) {
    const rows = await this.children.find({
      where: user.role === Role.Parent ? { motherUserId: user.id } : {},
      relations: { assessments: true },
      order: { id: 'ASC', assessments: { date: 'ASC', id: 'ASC' } }
    });
    return rows.map(ChildrenService.toRecord);
  }

  async addAssessment(childId: string, dto: CreateAssessmentDto, user: AuthUser) {
    const id = childId.trim();

    const result = await this.db.transaction(async em => {
      // One writer at a time hands out MB- numbers.
      await em.query(`SELECT pg_advisory_xact_lock(hashtext('morbas_assessment_id'))`);
      const [{ next }] = await em.query(
        `SELECT COALESCE(MAX(CAST(SUBSTRING(id FROM 4) AS INT)) + 1, $1) AS next
           FROM morbas_assessments WHERE id ~ '^MB-[0-9]+$'`,
        [FIRST_MB_NUMBER]
      );
      const repoChild = em.getRepository(Child);
      const repoMb = em.getRepository(MorbasAssessment);

      // Case-insensitive match on the reg number, as the web app did.
      let child = await repoChild.createQueryBuilder('c').where('LOWER(c.id) = LOWER(:id)', { id }).getOne();
      if (!child) {
        child = await repoChild.save(
          repoChild.create({ id, name: dto.name.trim(), dob: dto.dob, sex: dto.sex ?? '—', area: dto.area ?? '—' })
        );
      }

      const assessment = await repoMb.save(
        repoMb.create({
          id: `MB-${Math.max(Number(next), FIRST_MB_NUMBER)}`,
          childId: child.id,
          date: dto.date,
          by: user.name,
          byUserId: user.id,
          scores: dto.scores,
          marks: (dto.marks ?? null) as Json
        })
      );
      return { childId: child.id, assessmentId: assessment.id };
    });

    this.events.emit({ collection: 'children', id: result.childId, roles: STAFF_ROLES });
    const child = await this.children.findOneOrFail({
      where: { id: result.childId },
      relations: { assessments: true },
      order: { assessments: { date: 'ASC', id: 'ASC' } }
    });
    return { child: ChildrenService.toRecord(child), assessmentId: result.assessmentId };
  }

  static toRecord(c: Child) {
    const hist = (c.assessments ?? []).map(a => {
      const { childId, ...rest } = toRecord(a);
      return rest;
    });
    return { ...toRecord(c), hist };
  }
}
