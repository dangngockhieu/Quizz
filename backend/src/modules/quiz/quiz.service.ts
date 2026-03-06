import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../help/prisma/prisma.service';
import { CreateQuizData, CreateQuestionWithOptionsData } from './interface';


@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService) {}

  
  // Escape string để tránh SQL injection khi dùng $executeRawUnsafe
  private escape(value: string): string {
    return `'${value.replace(/'/g, "''")}'`;
  }

  // Teacher: Tạo Quiz mới
  async createQuiz(data: CreateQuizData, teacherID: number) {
    const teacher = await this.prisma.user.findUnique({ where: { id: teacherID } });
    if (!teacher || teacher.role !== 'TEACHER') {
      throw new BadRequestException('Teacher không hợp lệ');
    }

    return await this.prisma.quiz.create({ data: { ...data, teacherID } });

    
  }

  // Teacher: Update Quiz
  async updateQuiz(id: number, data: CreateQuizData, teacherID: number) {
    const quiz = await this.prisma.quiz.findUnique({ where: { id } });
    if (!quiz || quiz.teacherID !== teacherID) {
      throw new ForbiddenException('Không có quyền cập nhật quiz này');
    }

    return await this.prisma.quiz.update({
      where: { id },
      data: { ...data, teacherID },
    });
  }

  // Teacher: Lấy quiz của chính mình
  async getMyQuizzes(teacherID: number) {
    return await this.prisma.quiz.findMany({
      where: { teacherID },
      orderBy: { id: 'asc' },
    });
  }

  async getQuizDetailForTeacher(quizID: number, teacherID: number) {
    const quiz = await this.prisma.quiz.findFirst({
      where: { id: quizID, teacherID },
      include: {
        questions: {
          include: { options: true },
          orderBy: { id: 'asc' },
        },
      },
    });

    if (!quiz) throw new NotFoundException('Quiz không tồn tại hoặc không thuộc quyền sở hữu');
    return quiz;
  }

  // Teacher: Tạo nhiều Question kèm Options cho Quiz (Raw SQL + Transaction)
  async createQuestionsWithOptions(quizID: number, questions: CreateQuestionWithOptionsData[]) {
    return await this.prisma.$transaction(async (tx) => {
      for (const q of questions) {
        //  Insert question bằng raw SQL
        await tx.$executeRaw`
          INSERT INTO questions (quizID, id, content, type)
          VALUES (${quizID}, ${q.id}, ${q.content}, ${q.type})
        `;

        //  Bulk insert options bằng raw SQL
        if (q.options.length > 0) {
          const values = q.options
            .map(o => `(${q.id}, ${o.id}, ${this.escape(o.content)}, ${o.isCorrect ? 1 : 0})`)
            .join(', ');

          await tx.$executeRawUnsafe(
            `INSERT INTO options (questionID, id, content, isCorrect) VALUES ${values}`
          );
        }
      }

      // Trả về tất cả questions + options vừa tạo
      return await tx.question.findMany({
        where: { quizID },
        include: { options: true },
        orderBy: { id: 'asc' },
      });
    });
  }

  async syncQuestionsForQuiz(quizID: number, teacherID: number, questions: CreateQuestionWithOptionsData[]) {
    const quiz = await this.prisma.quiz.findFirst({ where: { id: quizID, teacherID } });
    if (!quiz) throw new ForbiddenException('Không có quyền cập nhật quiz này');

    if (!questions || questions.length === 0) {
      throw new BadRequestException('Quiz cần ít nhất 1 câu hỏi');
    }

    for (const q of questions) {
      if (!q.content?.trim()) throw new BadRequestException('Câu hỏi thiếu nội dung');
      if (!q.options || q.options.length < 1) throw new BadRequestException('Mỗi câu hỏi cần ít nhất 1 đáp án');
      if (!q.options.some(o => o.isCorrect)) throw new BadRequestException('Mỗi câu hỏi phải có ít nhất 1 đáp án đúng');
    }

    return await this.prisma.$transaction(async (tx) => {
      const existing = await tx.question.findMany({ where: { quizID }, select: { id: true } });
      const existingIds = existing.map(q => q.id);

      if (existingIds.length > 0) {
        await tx.option.deleteMany({ where: { questionID: { in: existingIds } } });
        await tx.question.deleteMany({ where: { quizID } });
      }

      await tx.question.createMany({
        data: questions.map(q => ({
          id: q.id,
          quizID,
          content: q.content,
          type: q.type,
        })),
      });

      const optionData = questions.flatMap(q =>
        q.options.map(o => ({
          id: o.id,
          questionID: q.id,
          content: o.content,
          isCorrect: o.isCorrect,
        }))
      );

      if (optionData.length > 0) {
        await tx.option.createMany({ data: optionData });
      }

      return tx.quiz.findUnique({
        where: { id: quizID },
        include: {
          questions: {
            include: { options: true },
            orderBy: { id: 'asc' },
          },
        },
      });
    });
  }

}
