import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import {
  ILoginDto,
  IRegisterDto,
  ITokenPayload,
  ITokens,
  IUserSession,
} from '../interfaces/auth.interface';
import { JWT_CONSTANTS } from '@common/constants';
import { IUser } from '@modules/users/interfaces/user.interface';
import { CustomApiResponse } from 'src/common/utils/api-response.util';
import { IApiResponse } from '@common/interfaces/api-response.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { objectId } from '@utils';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async register(registerDto: IRegisterDto): Promise<IApiResponse<ITokens>> {
    // Check if the user already exists
    const existingUser = await this.prisma.users.findFirst({
      where: { phone: registerDto.phone, isDeleted: false },
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    return this.prisma.$transaction(async (trx: PrismaService) => {
      // Create the user
      const user = await trx.users.create({
        data: {
          ...registerDto,
          password: hashedPassword,
          id: objectId(),
        },
      });

      // Generate tokens
      const tokens = await this.generateTokens(user.id, user.phone, trx);
      return CustomApiResponse.success({ ...tokens, user });
    });
  }

  async login(loginDto: ILoginDto): Promise<IApiResponse<ITokens>> {
    const user = await this.prisma.users.findFirst({
      where: { phone: loginDto.phone, isDeleted: false },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.prisma.$transaction(async (trx: PrismaService) => {
      // Deactivate all existing sessions for this user
      await trx.userSessions.updateMany({
        where: { userId: user.id, isDeleted: false },
        data: {
          isActive: false,
          updatedAt: new Date(),
          updatedBy: user.id,
        },
      });

      const tokens = await this.generateTokens(user.id, user.phone, trx);
      return CustomApiResponse.success({ ...tokens, user });
    });
  }

  async refreshTokens(
    refresh_token: string,
    user: IUserSession | IUser,
  ): Promise<IApiResponse<ITokens>> {
    try {
      const payload = await this.jwtService.verifyAsync<ITokenPayload>(refresh_token, {
        secret: JWT_CONSTANTS.REFRESH_TOKEN_SECRET,
      });

      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token: refresh_token, isDeleted: false },
      });

      if (!storedToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Verify session is still active
      const session = await this.prisma.userSessions.findFirst({
        where: {
          sessionId: payload.sessionId,
          isActive: true,
          isDeleted: false,
        },
      });

      if (!session) {
        throw new UnauthorizedException('Session has been terminated');
      }

      return this.prisma.$transaction(async (trx: PrismaService) => {
        // Deactivate all existing sessions for this user
        await trx.userSessions.updateMany({
          where: { userId: payload.sessionId, isDeleted: false },
          data: {
            id: objectId(),
            isActive: false,
            updatedAt: new Date(),
            updatedBy: user.id,
          },
        });

        const tokens = await this.generateTokens(payload.id, payload.phone, trx);
        return CustomApiResponse.success({ ...tokens, user });
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  logout(userId: string, user: IUserSession): Promise<IApiResponse<null>> {
    return this.prisma.$transaction(async (trx: PrismaService) => {
      await trx.refreshToken.updateMany({
        where: { userId, isDeleted: false },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: user.id,
        },
      });

      trx.userSessions.update({
        where: { id: user.sessionId, isDeleted: false },
        data: {
          isActive: false,
          updatedAt: new Date(),
          updatedBy: user.id,
        },
      });
      return CustomApiResponse.success(null);
    });
  }

  async validateSession(sessionId: string): Promise<boolean> {
    try {
      const session = await this.prisma.userSessions.findFirst({
        where: { sessionId: sessionId, isActive: true, isDeleted: false },
      });

      return true;
      return !!session?.isActive;
    } catch (error) {
      return false;
    }
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      const payload = await this.jwtService.verifyAsync<ITokenPayload>(token, {
        secret: JWT_CONSTANTS.ACCESS_TOKEN_SECRET,
      });

      if (!payload || !payload.sessionId) {
        return false;
      }

      return this.validateSession(payload.sessionId);
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  async parseToken(token: string): Promise<ITokenPayload | null> {
    try {
      const payload = await this.jwtService.verifyAsync<ITokenPayload>(token, {
        secret: JWT_CONSTANTS.ACCESS_TOKEN_SECRET,
      });

      return payload;
    } catch (error) {
      return null;
    }
  }

  private async generateTokens(
    userId: string,
    phone: string,
    trx: PrismaService = this.prisma,
  ): Promise<ITokens> {
    const sessionId = uuidv4();
    const payload: ITokenPayload = { id: userId, phone, sessionId };

    // Create new session
    await trx.userSessions.create({
      data: {
        id: objectId(),
        userId: userId,
        sessionId: sessionId,
        isActive: true,
        lastActivity: new Date(),
      },
    });

    // Generate access and refresh tokens
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: JWT_CONSTANTS.ACCESS_TOKEN_SECRET,
        // expiresIn: JWT_CONSTANTS.ACCESS_TOKEN_EXPIRATION,
      }),
      this.jwtService.signAsync(payload, {
        secret: JWT_CONSTANTS.REFRESH_TOKEN_SECRET,
        // expiresIn: JWT_CONSTANTS.REFRESH_TOKEN_EXPIRATION,
      }),
    ]);

    // Save refresh token
    await trx.refreshToken.create({
      data: {
        id: objectId(),
        userId: userId,
        token: accessToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
