import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../help/prisma/prisma.service';
import { Role, UserStatus } from '../../help/constant';
import * as argon from 'argon2';
import { BadRequestException, NotFoundException } from '../../help/exception';
@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

    // Tự động tạo mã định danh theo Role
    private async generateCode(role: Role): Promise<string> {
      const prefix = role === Role.STUDENT ? 'SV' : 'GV';
      const year = role === Role.STUDENT ? new Date().getFullYear().toString() : '';
      const pattern = `${prefix}${year}`;

      // Tìm code lớn nhất hiện tại có cùng prefix
      const lastUser = await this.prisma.user.findFirst({
        where: { code: { startsWith: pattern } },
        orderBy: { code: 'desc' },
        select: { code: true },
      });

      let nextNumber = 1;
      if (lastUser?.code) {
        const numPart = lastUser.code.replace(pattern, '');
        nextNumber = parseInt(numPart, 10) + 1;
      }

      // Pad số thứ tự: SV2026001, GV001
      const padLength = role === Role.STUDENT ? 3 : 3;
      return `${pattern}${nextNumber.toString().padStart(padLength, '0')}`;
    }

    // Lấy thông tin User theo code
    async findUserByCode(code: string) {
      return await this.prisma.user.findUnique({
        where: { code },
        select: {
          id: true,
          code: true,
          fullName: true,
          password: true,
          refreshToken: true,
          role: true,
          status: true,
        },
      });
    }
    // ADMIN: Thêm mới một User (code tự động tạo)
    async createUser(fullName: string, role: Role) {
      const code = await this.generateCode(role);
      const password = await argon.hash(code); // Default password là mã định danh đã tạo
      return await this.prisma.user.create({
        data: {
          code,
          password,
          fullName,
          role,
          status: UserStatus.ACTIVE,
        },
      });
    }

    // ADMIN: Update thông tin một User
    async updateUser(id: number, fullName?: string, role?: Role) {
      return await this.prisma.user.update({
        where: { id },
        data: {
          fullName,
          role,
        },
      });
    }

    // User tự đổi mật khẩu
    async changePasswordUser(id: number, oldPassword: string, newPassword: string) {
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) {
        throw new NotFoundException('User không tồn tại');
      }
      const isMatch = await argon.verify(user.password, oldPassword);
      if (!isMatch) {
        throw new BadRequestException('Mật khẩu cũ không đúng');
      }
      const hashedPassword = await argon.hash(newPassword);
      return await this.prisma.user.update({
        where: { id },
        data: {
          password: hashedPassword,
        },
      });
    }

    // ADMIN: Update Đổi Mật khẩu một User nếu họ quên và yêu cầu reset mật khẩu
    async updatePasswordUserForAdmin(id: number, newPassword: string) {
      const password = await argon.hash(newPassword);
      return await this.prisma.user.update({
        where: { id },
        data: {
          password,
        },
      });
    }

    // ADMIN: Update status một User
    async updateStatusUser(id: number, status: UserStatus) {
      return await this.prisma.user.update({
        where: { id },
        data: {
          status,
        },
      });
    }

    // ADMIN và Teacher: Lấy tất cả thông tin Student theo Class
    async getStudentsByClass(classID: number){
      return await this.prisma.userClass.findMany({
        where: {
          classID,
          user: { role: Role.STUDENT },
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              code: true,
            },
          },
        },
      });
    }

    // ADMIN: Lấy tất cả thông tin Teacher
    async getAllTeachers(){
      return await this.prisma.user.findMany({
        where: { role: Role.TEACHER },
        select: {
          id: true,
          fullName: true,
          code: true,
        },
      });
    }

    // ADMIN và Teacher: Lấy tất cả thông tin Teacher theo Class
    async getTeachersByClass(classID: number){
      return await this.prisma.userClass.findMany({
        where: {
          classID,
          user: { role: Role.TEACHER },
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              code: true,
            },
          },
        },
      });
    }


}
