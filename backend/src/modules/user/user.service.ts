import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../help/prisma/prisma.service';
import { Role, UserStatus } from '../../help/constant';
import * as argon from 'argon2';
import { BadRequestException, NotFoundException } from '../../help/exception';
@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

    // ADMIN: Lấy tất cả user (raw SQL) với filter + paginate
    async getAllUsersWithPaginate(role?: Role, search?: string, page = 1, pageSize = 5) {
      type UserRow = { id: number; code: string; fullName: string; role: Role; status: UserStatus };

      const safePage = Math.max(1, page || 1);
      const safePageSize = Math.max(1, Math.min(pageSize || 5, 100));
      const offset = (safePage - 1) * safePageSize;

      let baseSql = `FROM users`;
      const whereParts: string[] = [];
      const params: any[] = [];

      if (role) {
        whereParts.push(`role = ?`);
        params.push(role);
      }

      if (search) {
        whereParts.push(`(code LIKE ? OR fullName LIKE ?)`);
        params.push(`%${search}%`, `%${search}%`);
      }

      if (whereParts.length) {
        baseSql += ` WHERE ${whereParts.join(' AND ')}`;
      }

      const countSql = `SELECT COUNT(*) as total ${baseSql}`;
      const rowsSql = `SELECT id, code, fullName, role, status ${baseSql} ORDER BY role DESC, id DESC LIMIT ? OFFSET ?`;

      const [data, countRows] = await this.prisma.$transaction([
        this.prisma.$queryRawUnsafe<UserRow[]>(rowsSql, ...params, safePageSize, offset),
        this.prisma.$queryRawUnsafe<{ total: bigint }[]>(countSql, ...params),
      ]);

      const total = Number(countRows[0]?.total ?? 0);

      return {
        data,
        total,
        page: safePage,
        pageSize: safePageSize,
      };
    }

    // Lấy tất cả User
    async getAllUsers() {
      return await this.prisma.user.findMany({
        where: {
          role: { in: [Role.STUDENT, Role.TEACHER] },
        },
        select: {
          id: true,
          code: true,
          fullName: true,
          role: true,
          status: true,
        },
        orderBy: { id: 'asc' },
      });
    }

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
      const password = await argon.hash("123456"); // Default password là 123456
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

    // ADMIN và Teacher: Lấy tất cả thông tin Student theo Class
    async getAllStudents(){
      return await this.prisma.userClass.findMany({
        where: {
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
