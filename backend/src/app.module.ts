import { Module } from '@nestjs/common';
import { PrismaModule } from './help/prisma/prisma.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    PrismaModule,
    UserModule
  ],
  providers: [],
})
export class AppModule {}
