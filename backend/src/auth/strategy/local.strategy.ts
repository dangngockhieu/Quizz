import { Strategy } from 'passport-local';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { UserAccount } from '../interface';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'code',
      passwordField: 'password',
    });
  }

  async validate(code: string, password: string): Promise<UserAccount> {
    return this.authService.validateUser(code, password);
  }
}
