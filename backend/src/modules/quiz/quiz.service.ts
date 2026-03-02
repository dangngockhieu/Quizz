import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../help/prisma/prisma.service';
import { CreateQuestionData, CreateQuizData, CreateOptionData, CreateQuestionWithOptionsData } from './interface';


@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService) {}

  
  // Escape string để tránh SQL injection khi dùng $executeRawUnsafe
  private escape(value: string): string {
    return `'${value.replace(/'/g, "''")}'`;
  }

  // Teacher: Tạo Quiz mới
  async createQuiz(data: CreateQuizData) {
    return await this.prisma.quiz.create({ data });
  }

  // Teacher: Update Quiz
  async updateQuiz(id: number, data: CreateQuizData) {
    return await this.prisma.quiz.update({
      where: { id },
      data,
    });
  }

  // Teacher: Create Question cho Quiz
  async createQuestion(quizID: number, question: CreateQuestionWithOptionsData) {
    return await this.prisma.$transaction(async (tx) => {
        //  Insert question bằng raw SQL
        await tx.$executeRaw`
          INSERT INTO questions (quizID, content, type)
          VALUES (${quizID}, ${question.content}, ${question.type})
        `;

        //  Lấy ID của question vừa tạo
        const [{ id: questionID }] = await tx.$queryRaw<[{ id: number }]>`
          SELECT LAST_INSERT_ID() as id
        `;

        //  Bulk insert options bằng raw SQL
        if (question.options.length > 0) {
          const values = question.options
            .map(o => `(${questionID}, ${this.escape(o.content)}, ${o.isCorrect ? 1 : 0})`)
            .join(', ');

          await tx.$executeRawUnsafe(
            `INSERT INTO options (questionID, content, isCorrect) VALUES ${values}`
          );
        }

      // Trả về question + options vừa tạo
      return await tx.question.findUnique({
        where: { id: questionID },
        include: { options: true },
      });
    });
  }

  // Teacher: Tạo nhiều Question kèm Options cho Quiz (Raw SQL + Transaction)
  async createQuestionsWithOptions(quizID: number, questions: CreateQuestionWithOptionsData[]) {
    return await this.prisma.$transaction(async (tx) => {
      for (const q of questions) {
        //  Insert question bằng raw SQL
        await tx.$executeRaw`
          INSERT INTO questions (quizID, content, type)
          VALUES (${quizID}, ${q.content}, ${q.type})
        `;

        //  Lấy ID của question vừa tạo
        const [{ id: questionID }] = await tx.$queryRaw<[{ id: number }]>`
          SELECT LAST_INSERT_ID() as id
        `;

        //  Bulk insert options bằng raw SQL
        if (q.options.length > 0) {
          const values = q.options
            .map(o => `(${questionID}, ${this.escape(o.content)}, ${o.isCorrect ? 1 : 0})`)
            .join(', ');

          await tx.$executeRawUnsafe(
            `INSERT INTO options (questionID, content, isCorrect) VALUES ${values}`
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


  // Teacher: Update Question
  async updateQuestion(id: number, questionData: CreateQuestionData) {
    return await this.prisma.question.update({
      where: { id },
      data: {
        ...questionData,
      },
     });
  }

  // Teacher: Tao Option cho Question
  async createOption(questionID: number, createOptionData: CreateOptionData) {
    return await this.prisma.option.create({
      data: {
        ...createOptionData,
        questionID,
      },
    });
  }

  async createOptionsForQuestion(questionID: number, options: CreateOptionData[]) {
    const createdOptions = [];
    for (const optionData of options) {
      const createdOption = await this.prisma.option.create({
        data: {
          ...optionData,
          questionID,
        },
      });
      createdOptions.push(createdOption);
    }
    return createdOptions;
  }

  // Teacher: Update Option
  async updateOption(id: number, createOptionData: CreateOptionData) {
    return await this.prisma.option.update({
      where: { id },
      data: {
        ...createOptionData
        },
      });
  }
}
