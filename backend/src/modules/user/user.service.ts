import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../help/prisma/prisma.service';
import { Role } from '../../help/constant';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}
    
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
              email: true,
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
          email: true,
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
              email: true,
            },
          },
        },
      });
    }


}
