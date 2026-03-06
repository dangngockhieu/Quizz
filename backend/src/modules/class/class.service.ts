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
          description
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

    // TEACHER: Lấy tất cả khóa học của teacher hiện tại (có phân trang + search + đếm teacher/student/quiz)
    async getAllClassesforTeacherWithPaginate(teacherID: number, search?: string, page = 1, pageSize = 5){
      const safePage = Math.max(1, page || 1);
      const safePageSize = Math.max(1, Math.min(pageSize || 5, 100));

      const where = {
        users: {
          some: { userID: teacherID }, 
        },
        ...(search ? { name: { contains: search } } : {}),
      };

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

    // STUDENT: Lấy tất cả khóa học của student hiện tại 
    async getAllClassesforStudent(studentID: number){
      const where = {
        users: {
          some: { userID: studentID }, 
        }
      };

      const classes = await this.prisma.class.findMany({
          where,
          orderBy: { id: 'desc' }
        })

      return {
        data: classes
        }
      };

    // ADMIN: Lấy khóa học theo ID (kèm thành viên và bài thi)
    async getClassByID(id: number){
      const classData = await this.prisma.class.findUnique({
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

      if (!classData) return null;

      const memberIds = classData.users.map((u) => u.userID);
      const attemptCounts = new Map<number, number>();

      await Promise.all(
        classData.classQuizzes.map(async (cq) => {
          const count = await this.prisma.attempt.count({
            where: {
              quizID: cq.quizID,
              userID: { in: memberIds },
            },
          });
          attemptCounts.set(cq.quizID, count);
        })
      );

      const now = new Date();

      return {
        ...classData,
        classQuizzes: classData.classQuizzes.map((cq) => ({
          ...cq,
          stats: {
            attemptCount: attemptCounts.get(cq.quizID) ?? 0,
            isClosed: cq.quiz.timeEnd ? new Date(cq.quiz.timeEnd) < now : false,
          },
        })),
      };
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

    async addQuizToClass(classID: number, quizID: number){
      const cls = await this.prisma.class.findUnique({ where: { id: classID } });
      if (!cls) throw new Error('Class không tồn tại');

      const studentCount = await this.prisma.userClass.count({
        where: { classID, user: { role: 'STUDENT' } },
      });
      if (studentCount === 0) {
        throw new Error('Lớp chưa có học sinh, không thể gán bài thi');
      }

      await this.prisma.classQuiz.deleteMany({ where: { classID, quizID } });

      return await this.prisma.classQuiz.create({
        data: {
          classID,
          quizID,
        },
      });
    }

    // ADMIN: Number of classes
    async countClasses() {
      return await this.prisma.class.count();
    }

    // Teacher: Number of classes of teacher
    async countClassesOfUser(userID: number) {
      return await this.prisma.class.count({
        where: {
          users: {
            some: { userID: userID},
          },
        },
      });
    }
}
