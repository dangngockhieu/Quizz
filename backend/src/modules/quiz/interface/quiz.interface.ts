import { QuestionType, QuizTypeResult } from '../../../help/constant';
export interface CreateQuizData {
  title: string;
  description?: string;
  timeStart: Date;
  timeEnd: Date;
  timeLimit: number;
  typeResult: QuizTypeResult;
  countAttempt: number;
}

export interface CreateQuestionData{
    content: string;
    type: QuestionType;
}

export interface CreateOptionData {
    content: string;
    isCorrect: boolean;
}

export interface CreateQuestionWithOptionsData {
    content: string;
    type: QuestionType;
    options: CreateOptionData[];
}