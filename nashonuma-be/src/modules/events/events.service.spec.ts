import { firstValueFrom, take, toArray } from 'rxjs';
import { Role, STAFF_ROLES } from '../../common/role.enum';
import { EventsService } from './events.service';

describe('EventsService', () => {
  it('sends staff changes to staff, and a parent only her own', async () => {
    const events = new EventsService();
    const clinician = firstValueFrom(events.streamFor({ id: 'c1', role: Role.Clinician }).pipe(take(2), toArray()));
    const parent = firstValueFrom(events.streamFor({ id: 'p1', role: Role.Parent }).pipe(take(1), toArray()));

    events.emit({ collection: 'reports', id: 'PR-1', roles: STAFF_ROLES, userId: 'p2' }); // another mother's
    events.emit({ collection: 'reports', id: 'PR-2', roles: STAFF_ROLES, userId: 'p1' }); // hers

    expect((await clinician).map(e => (e.data as { id: string }).id)).toEqual(['PR-1', 'PR-2']);
    expect((await parent).map(e => (e.data as { id: string }).id)).toEqual(['PR-2']);
  });
});
