import { QuestionType, QuizTypeResult } from '../../../help/constant';
// Payload nhận từ client (không chứa teacherID)
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
    id: string;
    content: string;
    type: QuestionType;
}

export interface CreateOptionData {
    id: string;
    content: string;
    isCorrect: boolean;
}

export interface CreateQuestionWithOptionsData {
    id: string;
    content: string;
    type: QuestionType;
    options: CreateOptionData[];
}