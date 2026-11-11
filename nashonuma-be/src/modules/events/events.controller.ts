import { Controller, MessageEvent, Sse } from '@nestjs/common';
import { interval, map, merge, Observable } from 'rxjs';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/role.enum';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly events: EventsService) {}

  /**
   * Server-sent events. EventSource cannot set headers, so the JWT comes as ?token=
   * (JwtStrategy accepts the query token on this route only). A ping every 25s keeps proxies from closing it.
   */
  @Sse()
  stream(@CurrentUser() user: AuthUser): Observable<MessageEvent> {
    const ping = interval(25_000).pipe(map(() => ({ type: 'ping', data: {} }) as MessageEvent));
    return merge(this.events.streamFor(user), ping);
  }
}
