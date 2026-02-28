import { Module } from '@nestjs/common';
import { PrismaModule } from './help/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule
  ],
  providers: [],
})
export class AppModule {}
