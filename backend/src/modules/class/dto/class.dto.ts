import { IsNotEmpty, IsString } from "class-validator";

export class CreateClassDTO {
    @IsString()
    @IsNotEmpty({ message: 'Tên không được để trống' })
    name: string;
    @IsString()
    @IsNotEmpty({ message: 'Mô tả không được để trống' })
    description: string;
}
