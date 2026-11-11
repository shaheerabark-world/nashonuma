import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Role } from '../../common/role.enum';
import { EventsService } from '../events/events.service';
import { UpsertReportDto } from './dto/upsert-report.dto';
import { ParentReport } from './entities/parent-report.entity';
import { ReportsService } from './reports.service';

const parent = { id: 'parent-1', email: 'p@x', name: 'Shazia Bibi', role: Role.Parent };
const clinician = { id: 'clin-1', email: 'c@x', name: 'Dr Sana Iqbal', role: Role.Clinician };

const dto = (over: Partial<UpsertReportDto> = {}): UpsertReportDto => ({ name: 'Bilal Ahmed', date: '2026-11-03', ...over });

function setup(existing: Partial<ParentReport> | null = null) {
  const repo = {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(existing),
    create: jest.fn((x: object) => x),
    save: jest.fn(async (x: object) => ({ createdAt: new Date(), updatedAt: new Date(), ...x }))
  };
  const events = { emit: jest.fn() } as unknown as EventsService;
  const service = new ReportsService(repo as never, events);
  return { repo, events, service };
}

describe('ReportsService', () => {
  it('a parent only lists her own reports', async () => {
    const { repo, service } = setup();
    await service.findAll(parent);
    expect(repo.find).toHaveBeenCalledWith(expect.objectContaining({ where: { submittedById: 'parent-1' } }));
  });

  it('staff list every report', async () => {
    const { repo, service } = setup();
    await service.findAll(clinician);
    expect(repo.find).toHaveBeenCalledWith(expect.objectContaining({ where: {} }));
  });

  it('a new check from a parent is saved as New and linked to her, whatever status she sends', async () => {
    const { repo, events, service } = setup(null);
    const out = await service.upsert('PR-1', dto({ status: 'Seen' }), parent);
    expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ id: 'PR-1', status: 'New', submittedById: 'parent-1' }));
    expect(out).not.toHaveProperty('submittedById');
    expect(events.emit).toHaveBeenCalledWith(expect.objectContaining({ collection: 'reports', userId: 'parent-1' }));
  });

  it('a parent cannot overwrite a check that exists', async () => {
    const { service } = setup({ id: 'PR-1', submittedById: 'parent-1' });
    await expect(service.upsert('PR-1', dto(), parent)).rejects.toThrow(ForbiddenException);
  });

  it('a clinician replacing a report keeps the original sender', async () => {
    const { repo, service } = setup({ id: 'PR-1', submittedById: 'parent-1' });
    await service.upsert('PR-1', dto({ status: 'Seen' }), clinician);
    expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ status: 'Seen', submittedById: 'parent-1' }));
  });

  it('rejects a body id that differs from the URL', async () => {
    const { service } = setup();
    await expect(service.upsert('PR-1', dto({ id: 'PR-2' }), clinician)).rejects.toThrow(BadRequestException);
  });

  it('returns records without null fields, like the mock JSON', async () => {
    const { service } = setup(null);
    const out = await service.upsert('PR-1', dto(), parent);
    expect(out).not.toHaveProperty('instr');
    expect(out).toMatchObject({ id: 'PR-1', kid: '', note: '', concerns: [], ans: {} });
  });

  it('updateStatus 404s for an unknown id', async () => {
    const { service } = setup(null);
    await expect(service.updateStatus('PR-X', 'Seen')).rejects.toThrow(NotFoundException);
  });
});
