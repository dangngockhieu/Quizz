import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../modules/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy/jwt.strategy';
import { LocalStrategy } from './strategy';
import { RolesGuard } from './guards';

@Module({
  imports: [
    JwtModule.register({}),
    PassportModule,
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LocalStrategy, RolesGuard],
  exports: [JwtStrategy, LocalStrategy, PassportModule, RolesGuard]
})
export class AuthModule {}
