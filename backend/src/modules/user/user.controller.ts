import { UserStatus } from '../../help/constant';
import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, DefaultValuePipe } from '@nestjs/common';
import { UserService } from './user.service';
import { ChangePasswordDTO, CreateUserDTO, UpdateUserDTO } from './dto';
import { Role } from '../../help/constant';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ADMIN: Lấy danh sách user với filter role / search code, fullName
  @Get("/paginate")
  async getAllUsersWithPaginate(
    @Query('role') role?: Role,
    @Query('search') search?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('pageSize', new DefaultValuePipe(5), ParseIntPipe) pageSize?: number,
  ) {
    const result = await this.userService.getAllUsersWithPaginate(role, search, page, pageSize);
    return {
      success: true,
      data: result.data,
      meta: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
      },
    };
  }

  @Get()
  async getAllUsers() {
    const users = await this.userService.getAllUsers();
    return {
      success: true,
      data: users,
    };
  }

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
  @Patch('/:id')
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
  @Patch('/:id/change-password')
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
  @Patch('/:id/reset-password')
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
  @Patch('/:id/status')
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
  @Get('/students')
  async getStudentByClass(@Query('classID', ParseIntPipe) classID: number) {
    const students = await this.userService.getStudentsByClass(classID);
    return {
      success: true,
      data: students,
    };
  }

  // ADMIN: Lấy tất cả thông tin Student
  @Get('/students/all')
  async getAllStudent(){
    const students = await this.userService.getAllStudents();
    return {
      success: true,
      data: students,
    };
  }

  // ADMIN: Lấy tất cả thông tin Teacher
  @Get('/teachers')
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
