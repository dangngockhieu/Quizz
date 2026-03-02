import { Module } from '@nestjs/common';
import { PrismaModule } from './help/prisma/prisma.module';
import { UserModule } from './modules/user/user.module';
import { ClassModule } from './modules/class/class.module';
import { QuizModule } from './modules/quiz/quiz.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    ClassModule,
    QuizModule
  ],
  providers: [],
})
export class AppModule {}
