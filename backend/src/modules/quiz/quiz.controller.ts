import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Req, UnauthorizedException } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizDTO } from './dto';
import { CreateQuestionWithOptionsData } from './interface';
import { Request } from 'express';
import { Roles } from 'src/auth/decorator/roles';

@Controller('quizzes')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  @Roles('TEACHER')
  async createQuiz(@Body() body: CreateQuizDTO, @Req() req: Request) {
    const teacherID = Number((req as any)?.user?.id);
    if (!teacherID) throw new UnauthorizedException();

    const quiz = await this.quizService.createQuiz(body, teacherID);
    return {
      success: true,
      message: 'Tạo quiz thành công',
      data: quiz
    };
  }

  @Put('/:id')
  @Roles('TEACHER')
  async updateQuiz(@Param('id', ParseIntPipe) id: number, @Body() body: CreateQuizDTO, @Req() req: Request) {
    const teacherID = Number((req as any)?.user?.id);
    if (!teacherID) throw new UnauthorizedException();

    const quiz = await this.quizService.updateQuiz(id, body, teacherID);
    return {
      success: true,
      message: 'Cập nhật quiz thành công',
      data: quiz
    };
  }

  @Get('/forTeacher')
  @Roles('TEACHER')
  async getMyQuizzes(@Req() req: Request) {
    const teacherID = Number((req as any)?.user?.id);
    if (!teacherID) throw new UnauthorizedException();

    const quizzes = await this.quizService.getMyQuizzes(teacherID);
    return {
      success: true,
      message: 'Lấy danh sách quiz thành công',
      data: quizzes
    };
  }

  @Get('/:id')
  @Roles('TEACHER')
  async getQuizDetail(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const teacherID = Number((req as any)?.user?.id);
    if (!teacherID) throw new UnauthorizedException();

    const quiz = await this.quizService.getQuizDetailForTeacher(id, teacherID);
    return {
      success: true,
      message: 'Lấy chi tiết quiz thành công',
      data: quiz
    };
  }

  @Post('/:quizID/questions')
  @Roles('TEACHER')
  async createQuestionWithOptions(@Param('quizID') quizID: number, @Body() questions: CreateQuestionWithOptionsData[]) {
    const result = await this.quizService.createQuestionsWithOptions(quizID, questions);
    return {
      success: true,
      message: 'Tạo câu hỏi và options thành công',
      data: result
    };
  }

  @Put('/:quizID/questions/sync')
  @Roles('TEACHER')
  async syncQuestions(
    @Param('quizID', ParseIntPipe) quizID: number,
    @Body() questions: CreateQuestionWithOptionsData[],
    @Req() req: Request,
  ) {
    const teacherID = Number((req as any)?.user?.id);
    if (!teacherID) throw new UnauthorizedException();

    const result = await this.quizService.syncQuestionsForQuiz(quizID, teacherID, questions);
    return {
      success: true,
      message: 'Đồng bộ câu hỏi thành công',
      data: result
    };
  }

  @Get('/class/:classID')
  @Roles('STUDENT')
  async getQuizForClass(@Param('classID', ParseIntPipe) classID: number, @Req() req: Request) {
    const studentID = Number((req as any)?.user?.id);
    if (!studentID) throw new UnauthorizedException();

    const quizzes = await this.quizService.getQuizForClass(classID, studentID);
    return {
      success: true,
      message: 'Lấy danh sách quiz cho lớp thành công',
      data: quizzes
    };
  }
}
