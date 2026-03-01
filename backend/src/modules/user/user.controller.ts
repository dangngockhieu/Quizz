import { UserStatus } from '../../help/constant';
import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { ChangePasswordDTO, CreateUserDTO, UpdateUserDTO } from './dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ADMIN: Thêm mới một User 
  @Post()
  async createUser(@Body() body: CreateUserDTO) {
    const { fullName, role } = body;
    await this.userService.createUser(fullName, role);
    return {
      success: true,
      message: 'Tạo người dùng thành công',
    };
  }

  // ADMIN: Update thông tin một User
  @Patch(':id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateUserDTO,
  ) {
    const { fullName, role } = body;
    await this.userService.updateUser(id, fullName, role);
    return {
      success: true,
      message: 'Cập nhật người dùng thành công',
    };
  }

  // User tự đổi mật khẩu
  @Patch(':id/change-password')
  async changePasswordUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: ChangePasswordDTO,
  ) {
    const { oldPassword, newPassword } = body;
    await this.userService.changePasswordUser(id, oldPassword, newPassword);
    return {
      success: true,
      message: 'Đổi mật khẩu thành công',
    };
  }

  // ADMIN: Update Đổi Mật khẩu một User nếu họ quên và yêu cầu reset mật khẩu
  @Patch(':id/reset-password')
  async updatePasswordUserForAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Body('newPassword') newPassword: string,
  ) {
    await this.userService.updatePasswordUserForAdmin(id, newPassword);
    return {
      success: true,
      message: 'Reset mật khẩu thành công',
    };
  }

  // ADMIN: Update status một User
  @Patch(':id/status')
  async updateStatusUser(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: UserStatus,
  ) {
    await this.userService.updateStatusUser(id, status);
    return {
      success: true,
      message: 'Cập nhật trạng thái người dùng thành công',
    };
  }

  // ADMIN và Teacher: Lấy tất cả thông tin Student theo Class
  @Get('students')
  async getStudentByClass(@Query('classID', ParseIntPipe) classID: number) {
    const students = await this.userService.getStudentsByClass(classID);
    return {
      success: true,
      data: students,
    };
  }

  // ADMIN: Lấy tất cả thông tin Teacher
  @Get('teachers')
  async getAllTeacher(){
    const teachers = await this.userService.getAllTeachers();
    return {
      success: true,
      data: teachers,
    };
  }


  async getTeachersByClass(@Query('classID', ParseIntPipe) classID: number) {
    const teachers = await this.userService.getTeachersByClass(classID);
    return {
      success: true,
      data: teachers,
    };
  }

}
