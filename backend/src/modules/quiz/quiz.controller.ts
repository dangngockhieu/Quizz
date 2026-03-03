import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizDTO } from './dto';
import { CreateOptionData, CreateQuestionWithOptionsData } from './interface';

@Controller('quizzes')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  async createQuiz(@Body() body: CreateQuizDTO) {
    const quiz = await this.quizService.createQuiz(body);
    return {
      success: true,
      message: 'Tạo quiz thành công',
      data: quiz,
    };
  }

  @Put('/:id')
  async updateQuiz(@Param('id') id: number, @Body() body: CreateQuizDTO) {
    const quiz = await this.quizService.updateQuiz(id, body);
    return {
      success: true,
      message: 'Cập nhật quiz thành công',
      data: quiz,
    };
  }

  @Post('/:quizID/questions')
  async createQuestion(@Param('quizID') quizID: number, @Body() question: CreateQuestionWithOptionsData) {
    const result = await this.quizService.createQuestion(quizID, question);
    return {
      success: true,
      message: 'Tạo câu hỏi thành công',
      data: result,
    };
  }

  @Post('/:quizID/questions/bulk')
  async createQuestionWithOptions(@Param('quizID') quizID: number, @Body() questions: CreateQuestionWithOptionsData[]) {
    const result = await this.quizService.createQuestionsWithOptions(quizID, questions);
    return {
      success: true,
      message: 'Tạo câu hỏi và options thành công',
      data: result,
    };
  }

  @Put('/questions/:id')
  async updateQuestion(@Param('id') id: number, @Body() question: CreateQuestionWithOptionsData) {
    const result = await this.quizService.updateQuestion(id, question);
    return {
      success: true,
      message: 'Cập nhật câu hỏi và options thành công',
      data: result,
    };
  }

  @Post('/questions/:questionID/options')
  async createOption(@Param('questionID') questionID: number, @Body() body: CreateOptionData) {
    const result = await this.quizService.createOption(questionID, body);
    return {
      success: true,
      message: 'Tạo option thành công',
      data: result,
    };
  }

  @Post('/questions/:questionID/options/bulk')
  async createOptionsForQuestion(@Param('questionID') questionID: number, @Body() body: CreateOptionData[]) {
    const result = await this.quizService.createOptionsForQuestion(questionID, body);
    return {
      success: true,
      message: 'Tạo option thành công',
      data: result,
    };
  }

  @Put('/options/:id')
  async updateOption(@Param('id') id: number, @Body() body: CreateOptionData) {
    const result = await this.quizService.updateOption(id, body);
    return {
      success: true,
      message: 'Cập nhật option thành công',
      data: result,
    };
  }

}
