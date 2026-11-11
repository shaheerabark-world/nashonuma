import { ForbiddenException } from '@nestjs/common';
import { Role } from '../../common/role.enum';
import { EventsService } from '../events/events.service';
import { WellbeingService } from './wellbeing.service';

const parent = { id: 'parent-1', email: 'p@x', name: 'Shazia Bibi', role: Role.Parent };
const supervisor = { id: 'sup-1', email: 's@x', name: 'Rukhsana Begum', role: Role.Supervisor };
const ans = Array.from({ length: 20 }, (_, i) => i % 2);

function setup(existing: object | null = null) {
  const repo = {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(existing),
    create: jest.fn((x: object) => x),
    save: jest.fn(async (x: object) => x)
  };
  const events = { emit: jest.fn() } as unknown as EventsService;
  return { repo, service: new WellbeingService(repo as never, events) };
}

describe('WellbeingService', () => {
  it('a mother only lists her own checks', async () => {
    const { repo, service } = setup();
    await service.findAll(parent);
    expect(repo.find).toHaveBeenCalledWith(expect.objectContaining({ where: { submittedById: 'parent-1' } }));
  });

  it('a mother creates a check as New, linked to her', async () => {
    const { repo, service } = setup(null);
    await service.upsert('MW-1', { mother: 'Shazia Bibi', date: '2026-11-05', ans, status: 'Contacted' }, parent);
    expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ status: 'New', submittedById: 'parent-1' }));
  });

  it('a mother cannot overwrite an existing check', async () => {
    const { service } = setup({ id: 'MW-1' });
    await expect(service.upsert('MW-1', { mother: 'X', date: '2026-11-05', ans }, parent)).rejects.toThrow(ForbiddenException);
  });

  it('staff can mark a check Contacted and keep the sender', async () => {
    const { repo, service } = setup({ id: 'MW-1', submittedById: 'parent-1' });
    await service.upsert('MW-1', { mother: 'Shazia Bibi', date: '2026-11-05', ans, status: 'Contacted' }, supervisor);
    expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ status: 'Contacted', submittedById: 'parent-1' }));
  });
});
