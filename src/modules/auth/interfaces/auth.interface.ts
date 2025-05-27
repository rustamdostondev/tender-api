export interface ILoginDto {
  phone: string;
  password: string;
}

export interface IRegisterDto {
  phone: string;
  password: string;
  name: string;
}

export interface ITokenPayload {
  id: string;
  phone: string;
  sessionId: string;
}

export interface ITokens {
  accessToken: string;
  refreshToken: string;
}

export interface IRefreshToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserSession {
  id: string;
  userId: string;
  sessionId: string;
  isActive: boolean;
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
}
