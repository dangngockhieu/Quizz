import { IsNotEmpty, IsString } from "class-validator";
import { QuestionType, QuizTypeResult } from '../../../help/constant';
export class QuizDTO {
    @IsString()
    @IsNotEmpty({ message: 'Tên không được để trống' })
    name: string;
    @IsString()
    @IsNotEmpty({ message: 'Mô tả không được để trống' })
    description: string;
}

export class CreateQuizDTO {
    @IsString()
    @IsNotEmpty({ message: 'Title không được để trống' })
    title: string;
    @IsString()
    description: string;
    @IsNotEmpty({ message: 'TimeStart không được để trống' })
    timeStart: Date;
    @IsNotEmpty({ message: 'TimeEnd không được để trống' })
    timeEnd: Date;
    @IsNotEmpty({ message: 'TimeLimit không được để trống' })
    timeLimit: number;
    @IsNotEmpty({ message: 'TypeResult không được để trống' })
    typeResult: QuizTypeResult;
    countAttempt: number;
}