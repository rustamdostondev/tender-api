import { JWT_CONSTANTS } from '@common/constants';
import { UsersModule } from '@modules/users/users.module';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { AuthGuard } from '../../guards/auth.guard';
import { AuthController } from './controllers/auth.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [
    JwtModule.register({
      secret: JWT_CONSTANTS.ACCESS_TOKEN_SECRET,
      // signOptions: {
      //   expiresIn: JWT_CONSTANTS.ACCESS_TOKEN_EXPIRATION,
      // },
    }),
    PassportModule.register({ defaultStrategy: JWT_CONSTANTS.ACCESS_TOKEN_SECRET }),
    PrismaModule,
    UsersModule,
  ],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, AuthGuard],
  controllers: [AuthController],
  exports: [AuthService, JwtAuthGuard, AuthGuard],
})
export class AuthModule {}
