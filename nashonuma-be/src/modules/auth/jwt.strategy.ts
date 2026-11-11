import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthUser } from '../../common/role.enum';
import { JwtPayload } from './auth.service';

/** ?token= is accepted only on the SSE route, because EventSource cannot send headers. */
const fromEventsQuery = (req: Request): string | null =>
  req.path.endsWith('/events') && typeof req.query.token === 'string' ? req.query.token : null;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([ExtractJwt.fromAuthHeaderAsBearerToken(), fromEventsQuery]),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET')
    });
  }

  validate(payload: JwtPayload): AuthUser {
    return { id: payload.sub, email: payload.email, name: payload.name, role: payload.role };
  }
}
