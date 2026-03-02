import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PassportModule } from '@nestjs/passport/dist/passport.module';
import { JwtModule } from '@nestjs/jwt/dist/jwt.module';
import { LocalStrategy } from 'src/auth/local/local.strategy';

@Module({
  imports: [
    JwtModule.register({}),
    PassportModule,
    UserModule
  ],
  controllers: [UserController],
  providers: [UserService, LocalStrategy],
  exports: [UserService, LocalStrategy]
})
export class UserModule {}
