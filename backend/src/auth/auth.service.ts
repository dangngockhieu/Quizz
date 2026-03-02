import { Injectable, Inject} from '@nestjs/common';
import { PrismaService } from '../help/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../modules/user/user.service';
import { BadRequestException, NotFoundException, UnauthorizedException } from '../help/exception';
import { UserAccount } from './interface';

@Injectable()
export class AuthService {
    constructor(
        @Inject('DATABASE_POOL')  
        private jwt: JwtService, 
        private config: ConfigService,
        private prisma: PrismaService,
        private readonly userService: UserService           
    ) {}

    // TẠO TOKEN 
    private async generateToken(user: UserAccount): Promise<{ accessToken: string; refreshToken: string }> {
        const payload = { sub: user.id, code: user.code, name: user.fullName, role: user.role };

        const accessToken = await this.jwt.signAsync(payload, {
            secret: this.config.get<string>('JWT_SECRET'),
            expiresIn: this.config.get<string>('JWT_EXPIRED') as any,
        });

        const refreshToken = await this.jwt.signAsync(payload, {
            secret: this.config.get<string>('JWT_REFRESH_SECRET'),
            expiresIn: this.config.get<string>('REFRESH_EXPIRED') as any,
        });

        return { accessToken, refreshToken };
    }

    // XÁC THỰC USER 
    async validateUser(code: string, password: string) : Promise<UserAccount> {
        const user = await this.userService.findUserByCode(code);
        if (!user || !user.password || user.status !== 'ACTIVE') 
            throw new BadRequestException('Tài khoản không tồn tại hoặc không hợp lệ');
        const ok = await argon.verify(user.password, password);
        if (!ok) throw new BadRequestException('Sai mật khẩu');
        return { id: user.id, code: user.code, fullName: user.fullName, role: user.role };
    }

    // ĐĂNG NHẬP 
    async login(user: UserAccount) : Promise<{ accessToken: string; refreshToken: string; user: UserAccount }> {
        const { accessToken, refreshToken } = await this.generateToken(user);
        const hashed = await argon.hash(refreshToken);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: hashed },
        });
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                fullName: user.fullName,
                role: user.role,
                code: user.code,
            },
        };
    }

    // LOGOUT 
    async logout(code: string) : Promise<void> {
        const user = await this.userService.findUserByCode(code);
        if (!user) throw new NotFoundException('User not found');
    
        await this.prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: null },
        });
    }

    // REFRESH TOKEN 
    async postrefreshToken(refreshToken: string) : Promise<{ accessToken: string; user: UserAccount }> {
        let payload: any;
        try {
            payload = this.jwt.verify(refreshToken, {
                secret: this.config.get<string>('JWT_REFRESH_SECRET'),
            });
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        const user = await this.userService.findUserByCode(payload.code);
    
        if (!user || !user.refreshToken)
            throw new UnauthorizedException('User not found or refresh token revoked');

        const isValid = await argon.verify(user.refreshToken, refreshToken);
        if (!isValid) throw new UnauthorizedException('Invalid refresh token');
        const payloadNew = { sub: user.id, code: user.code, name: user.fullName, role: user.role };
        const accessToken = await this.jwt.signAsync(payloadNew, {
            secret: this.config.get<string>('JWT_SECRET'),
            expiresIn: this.config.get<string>('JWT_EXPIRED') as any,
        });

        return {
            accessToken,
            user: {
                id: user.id,
                fullName: user.fullName,
                role: user.role,
                code: user.code,
            },
        };
    }

    // RESET MẬT KHẨU 
    async resetPassword(code: string, newPassword: string) : Promise<void> {
        const user = await this.userService.findUserByCode(code)
        if (!user) throw new NotFoundException('User not found or invalid code');
        const hashPassword = await argon.hash(newPassword);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { password: hashPassword, refreshToken: null },
        });
    }
}