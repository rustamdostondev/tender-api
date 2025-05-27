import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../services/auth.service';
import { ITokenPayload } from '../interfaces/auth.interface';
import { JWT_CONSTANTS } from '@common/constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_CONSTANTS.ACCESS_TOKEN_SECRET,
      passReqToCallback: false,
    });
  }

  async validate(payload: ITokenPayload) {
    try {
      if (!payload.sessionId) {
        throw new UnauthorizedException('Invalid token payload');
      }

      const isSessionValid = await this.authService.validateSession(payload.sessionId);

      if (!isSessionValid) {
        throw new UnauthorizedException('Session has expired or been terminated');
      }

      return {
        id: payload.id,
        phone: payload.phone,
        sessionId: payload.sessionId,
      };
    } catch (error) {
      console.log(error);

      throw new UnauthorizedException('Invalid token');
    }
  }
}
