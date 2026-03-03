import { Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { ClassService } from './class.service';
import { CreateClassDTO } from './dto/class.dto';

@Controller('classes')
export class ClassController {
    constructor(private readonly classService: ClassService){}

    // ADMIN: Tạo khóa học mới
    @Post()
    async createClass(@Body() payload: CreateClassDTO){
      const classes = await this.classService.createClass(payload);
      return {
        success: true,
        message: 'Tạo lớp học thành công',
        data: classes,
      };
    }

    // ADMIN: Lấy tất cả khóa học (có search + paginate)
    @Get()
    async getAllClasses(
      @Query('search') search?: string,
      @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
      @Query('pageSize', new DefaultValuePipe(5), ParseIntPipe) pageSize?: number,
    ){
      const result = await this.classService.getAllClassesWithPaginate(search, page, pageSize);
      return {
        success: true,
        message: 'Lấy danh sách lớp học thành công',
        data: result.data,
        meta: { total: result.total, page: result.page, pageSize: result.pageSize },
      };
    }

    // ADMIN: Lấy khóa học theo ID
    @Get('/:id')
    async getClassByID(@Param('id', ParseIntPipe) id: number){
      const classes = await this.classService.getClassByID(id);
      return {
        success: true,
        message: 'Lấy thông tin lớp học thành công',
        data: classes,
      };
    }

    // ADMIN: Cập nhật thông tin khóa học
    @Put('/:id')
    async updateClass(
      @Param('id', ParseIntPipe) id: number,
      @Body() payload: CreateClassDTO,
    ){
      const classes = await this.classService.updateClass(id, payload);
      return {
        success: true,
        message: 'Cập nhật lớp học thành công',
        data: classes,
      };
     }

     // ADMIN: Thêm Student/Teacher vào khóa học
     @Post('/:id/add-user')
     async addUserToClass(
      @Param('id', ParseIntPipe) classID: number,
      @Body('userID', ParseIntPipe) userID: number,
     ){
      const result = await this.classService.addUserToClass(classID, userID);
      return {
        success: true,
        message: 'Thêm người dùng vào lớp học thành công',
        data: result,
       };
     }

       // ADMIN: Xóa Student/Teacher khỏi khóa học
       @Delete('/:classID/users/:userID')
       async removeUserFromClass(
        @Param('classID', ParseIntPipe) classID: number,
        @Param('userID', ParseIntPipe) userID: number,
       ) {
        const result = await this.classService.removeUserFromClass(classID, userID);
        return {
          success: true,
          message: 'Xóa người dùng khỏi lớp học thành công',
          data: result,
        };
       }

}
