import { Controller, Get, Post, Put } from '@nestjs/common';
import { ClassService } from './class.service';

@Controller('classes')
export class ClassController {
    constructor(private readonly classService: ClassService){}

    // ADMIN: Tạo khóa học mới
    @Post()
    async createClass(name: string, description: string){
      const classes = await this.classService.createClass(name, description);
      return {
        success: true,
        message: 'Tạo lớp học thành công',
        data: classes,
      };
    }

    // ADMIN: Lấy tất cả khóa học
    @Get()
    async getAllClasses(){
      const classes = await this.classService.getAllClasses();
      return {
        success: true,
        message: 'Lấy danh sách lớp học thành công',
        data: classes,
      };
    }

    // ADMIN: Cập nhật thông tin khóa học
    @Put(':id')
    async updateClass(id: number, name: string, description: string){
      const classes = await this.classService.updateClass(id, name, description);
      return {
        success: true,
        message: 'Cập nhật lớp học thành công',
        data: classes,
      };
     }

     // ADMIN: Thêm Student/Teacher vào khóa học
     @Post(':id/add-user')
     async addUserToClass(classID: number, userID: number){
      const result = await this.classService.addUserToClass(classID, userID);
      return {
        success: true,
        message: 'Thêm người dùng vào lớp học thành công',
        data: result,
       };
     }

}
