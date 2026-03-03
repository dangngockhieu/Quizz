import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../help/prisma/prisma.service';
import { CreateClassDTO } from './dto/class.dto';

@Injectable()
export class ClassService {
    constructor(private prisma: PrismaService) {}

    // ADMIN: Tạo khóa học mới
    async createClass(payload: CreateClassDTO){
      const { name, description } = payload;
      return await this.prisma.class.create({
        data: {
          name,
          description,
        },
      });
    }

    // ADMIN: Lấy tất cả khóa học (có phân trang + search + đếm teacher/student/quiz)
    async getAllClassesWithPaginate(search?: string, page = 1, pageSize = 5){
      const safePage = Math.max(1, page || 1);
      const safePageSize = Math.max(1, Math.min(pageSize || 5, 100));

      const where = search ? { name: { contains: search } } : {};

      const [total, classes] = await this.prisma.$transaction([
        this.prisma.class.count({ where }),
        this.prisma.class.findMany({
          where,
          skip: (safePage - 1) * safePageSize,
          take: safePageSize,
          orderBy: { id: 'asc' },
          include: {
            _count: { select: { classQuizzes: true } },
            users: {
              include: { user: { select: { role: true } } },
            },
          },
        }),
      ]);

      return {
        data: classes.map(c => ({
          id: c.id,
          name: c.name,
          description: c.description,
          teacherCount: c.users.filter(u => u.user.role === 'TEACHER').length,
          studentCount: c.users.filter(u => u.user.role === 'STUDENT').length,
          quizCount: c._count.classQuizzes,
        })),
        total,
        page: safePage,
        pageSize: safePageSize,
      };
    }

    // ADMIN: Lấy khóa học theo ID (kèm thành viên và bài thi)
    async getClassByID(id: number){
      return await this.prisma.class.findUnique({
        where: { id },
        include: {
          users: {
            include: {
              user: {
                select: { id: true, code: true, fullName: true, role: true, status: true },
              },
            },
            orderBy: [
              { user: { role: 'desc' } }, // TEACHER trước STUDENT
              { user: { fullName: 'asc' } },
            ],
          },
          classQuizzes: {
            include: {
              quiz: true,
            },
          },
        },
      });
    }

    // ADMIN: Cập nhật thông tin khóa học
    async updateClass(id: number, payload: CreateClassDTO){
      const { name, description } = payload;
      return await this.prisma.class.update({
        where: { id },
        data: {
          name,
          description,
        },
      });
    }

    // ADMIN: Thêm Student/Teacher vào khóa học
    async addUserToClass(classID: number, userID: number){
      return await this.prisma.userClass.create({
        data: {
          userID: userID,
          classID: classID,
        },
      });
    }

    // ADMIN: Xóa Student/Teacher khỏi khóa học
    async removeUserFromClass(classID: number, userID: number){
      return await this.prisma.userClass.deleteMany({
        where: { classID, userID },
      });
    }
}
