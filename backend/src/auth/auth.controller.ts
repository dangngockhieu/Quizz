import { Controller, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards';
import { UserAccount } from './interface';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { UnauthorizedException } from '../help/exception';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,
              private readonly config: ConfigService
  ) {}

  // Login
  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req.user as UserAccount;
    const data = await this.authService.login(user);
      const isProd = this.config.get<string>('NODE_ENV') === 'production';
      if (req.cookies?.refreshToken) {
        res.clearCookie('refreshToken', {
          httpOnly: true,
          secure: isProd,
          sameSite: isProd ? 'none' : 'lax',
          path: '/',
          domain: isProd ? '.quizmanagement.vn' : undefined
        });
      }
      res.cookie('refreshToken', data.refreshToken, {
        httpOnly: true,      
        secure: isProd,
        sameSite: isProd ? 'strict' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, 
        path: '/',
        domain: isProd ? '.quizmanagement.vn' : undefined 
      });

      return {
        success: true,
        message: 'Login successful',
        data: {
          accessToken: data.accessToken,
          user: data.user
        }
      };
  }

  // LOGOUT 
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const code = (req.user as UserAccount)?.code;
    if (!code) {
      throw new UnauthorizedException('No authenticated user found');
    }
    await this.authService.logout(code);
    const isProd = this.config.get<string>('NODE_ENV') === 'production';
    if (req.cookies?.refreshToken) {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        path: '/',
        domain: isProd ? '.quizmanagement.vn' : undefined  
      });
    }
    return {
      success: true,
      message: 'Logout successful',
      data:{}
    }
  }

  // RefreshToken
  @Post('refresh-token')
  async refreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }
    const data = await this.authService.postrefreshToken(refreshToken);
      
    // Set lại refresh token vào cookie để đảm bảo cookie luôn fresh
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });
      
    return {
      success: true,
      message: 'RefreshToken successful',
      data: {
        accessToken: data.accessToken,
        user: data.user,
      }
    };
  }

  @Patch('reset-password')
  async resetPassword(@Req() req: Request) {
    const code= req.body.code;
    const newPassword = req.body.newPassword;
    await this.authService.resetPassword(code, newPassword);
    return {
      success: true,
      message: 'Reset password successful',
      data: {}
    };
  }

  
}
