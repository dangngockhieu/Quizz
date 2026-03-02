import { Module } from '@nestjs/common';
import { PrismaModule } from './help/prisma/prisma.module';
import { UserModule } from './modules/user/user.module';
import { ClassModule } from './modules/class/class.module';
import { QuizModule } from './modules/quiz/quiz.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    ClassModule,
    QuizModule,
    AuthModule
  ],
  providers: [],
})
export class AppModule {}
