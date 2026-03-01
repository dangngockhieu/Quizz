import { IsEnum, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { Role } from '../../../help/constant';

export class CreateUserDTO {
    @IsString()
    @IsNotEmpty({ message: 'Tên không được để trống' })
    fullName: string;
    @IsEnum(Role, { message: 'Role phải là STUDENT, TEACHER hoặc ADMIN' })
    @IsNotEmpty({ message: 'Role không được để trống' })
    role: Role;
}

export class UpdateUserDTO {
    @IsString()
    @IsNotEmpty({ message: 'Tên không được để trống' })
    fullName?: string;
    @IsEnum(Role, { message: 'Role phải là STUDENT, TEACHER hoặc ADMIN' })
    role?: Role;
}

export class ChangePasswordDTO {
    @IsString()
    @IsNotEmpty({ message: 'Old Password không được để trống' })
    @MinLength(6)
    @MaxLength(30)
    oldPassword: string;
    @IsString()
    @IsNotEmpty({ message: 'New Password không được để trống' })
    @MinLength(6)
    @MaxLength(30)
    newPassword: string;
}