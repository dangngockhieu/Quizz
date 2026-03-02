import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { UserAccount } from '../interface';
import { Role } from '../../help/constant';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: number; code: string; role: Role; fullName: string }): Promise<UserAccount> {
    return { id: payload.sub, code: payload.code, role: payload.role, fullName: payload.fullName };
  }
}