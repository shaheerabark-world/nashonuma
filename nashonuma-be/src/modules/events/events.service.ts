import { Injectable, MessageEvent } from '@nestjs/common';
import { filter, map, Observable, Subject } from 'rxjs';
import { Role } from '../../common/role.enum';

/** The data sets the web app keeps in sync. */
export type Collection = 'reports' | 'wellbeing' | 'children' | 'config';

export interface ChangeEvent {
  collection: Collection;
  id?: string;
  /** Only users with these roles, or this user, hear about the change. Empty = everyone. */
  roles?: Role[];
  userId?: string | null;
}

/** In-process change feed. Services call emit() after a write; GET /events streams it (SSE). */
@Injectable()
export class EventsService {
  private readonly changes$ = new Subject<ChangeEvent>();

  emit(event: ChangeEvent): void {
    this.changes$.next(event);
  }

  streamFor(user: { id: string; role: Role }): Observable<MessageEvent> {
    return this.changes$.pipe(
      filter(e => !e.roles?.length || e.roles.includes(user.role) || (!!e.userId && e.userId === user.id)),
      map(e => ({ type: 'change', data: { collection: e.collection, id: e.id } }))
    );
  }
}
