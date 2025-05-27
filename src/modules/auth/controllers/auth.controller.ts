import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginDto, RefreshTokenDto, RegisterDto, TokensResponseDto } from '../dto/auth.dto';
import { IUserSession } from '../interfaces/auth.interface';
import { AuthService } from '../services/auth.service';
import { IApiResponse } from '@common/interfaces/api-response.interface';
import { User } from '@common/decorators/user.decorator';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { IUser } from '@modules/users/interfaces/user.interface';
import { RESOURCES } from '@common/constants';

@ApiTags('Auth')
@Controller({
  path: RESOURCES.AUTH,
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register new user',
    description: 'Creates a new user account and returns access and refresh tokens',
  })
  @ApiBody({ type: RegisterDto })
  register(@Body() registerDto: RegisterDto): Promise<IApiResponse<TokensResponseDto>> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticates user credentials and returns access and refresh tokens',
  })
  @ApiBody({ type: LoginDto })
  login(@Body() loginDto: LoginDto): Promise<IApiResponse<TokensResponseDto>> {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('authorization')
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh tokens',
    description: 'Uses a valid refresh token to generate new access and refresh tokens',
  })
  @ApiBody({ type: RefreshTokenDto })
  refreshTokens(
    @Body() refreshTokenDto: RefreshTokenDto,
    @User() user: IUserSession | IUser,
  ): Promise<IApiResponse<TokensResponseDto>> {
    return this.authService.refreshTokens(refreshTokenDto.refresh_token, user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('authorization')
  @ApiOperation({
    summary: 'User logout',
    description: 'Invalidates the current session and refresh tokens',
  })
  logout(@User() user: IUserSession): Promise<IApiResponse<null>> {
    return this.authService.logout(user.id, user);
  }
}
