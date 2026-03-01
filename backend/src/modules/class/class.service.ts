import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/help/prisma/prisma.service';

@Injectable()
export class ClassService {
    constructor(private prisma: PrismaService) {}

    // ADMIN: Lấy tất cả khóa học
    async getAllClasses(){
      return await this.prisma.class.findMany();
    }

    // ADMIN: Tạo khóa học mới
    async createClass(name: string, description: string){
      return await this.prisma.class.create({
        data: {
          name,
          description,
        },
      });
    }

    // ADMIN: Cập nhật thông tin khóa học
    async updateClass(id: number, name: string, description: string){
      return await this.prisma.class.update({
        where: { id },
        data: {
          name,
          description,
        },
      });
    }
}
