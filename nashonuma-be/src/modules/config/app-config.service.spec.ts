import { BadRequestException } from '@nestjs/common';
import { Role } from '../../common/role.enum';
import { EventsService } from '../events/events.service';
import { AppConfigService } from './app-config.service';

const admin = { id: 'a1', email: 'a@x', name: 'Faisal Ahmed', role: Role.Admin };
const items25 = Array.from({ length: 25 }, (_, i) => `Item ${i + 1}`);

function setup(rows: object[] = []) {
  const repo = { find: jest.fn().mockResolvedValue(rows), create: jest.fn((x: object) => x), save: jest.fn(async (x: object) => x) };
  const events = { emit: jest.fn() } as unknown as EventsService;
  return { repo, events, service: new AppConfigService(repo as never, events) };
}

describe('AppConfigService', () => {
  it('returns sdq: null before an admin saves it', async () => {
    const { service } = setup();
    await expect(service.findAll()).resolves.toEqual({ sdq: null });
  });

  it('saves languages that have exactly 25 items', async () => {
    const { repo, events, service } = setup();
    const value = await service.saveSdq({ items: { en: items25, ur: items25 } }, admin);
    expect(Object.keys(value.items)).toEqual(['en', 'ur']);
    expect(value.by).toBe('Faisal Ahmed');
    expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ key: 'sdq' }));
    expect(events.emit).toHaveBeenCalledWith({ collection: 'config', id: 'sdq' });
  });

  it('rejects a language with the wrong number of items', async () => {
    const { service } = setup();
    await expect(service.saveSdq({ items: { en: items25.slice(1) } }, admin)).rejects.toThrow(BadRequestException);
  });

  it('rejects an empty payload', async () => {
    const { service } = setup();
    await expect(service.saveSdq({ items: {} }, admin)).rejects.toThrow(BadRequestException);
  });
});
