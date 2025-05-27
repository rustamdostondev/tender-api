export interface IUser {
  id: string;
  phone: string;
  password?: string;
  name: string;
  isVerified?: boolean;
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateUserDto {
  phone: string;
  password: string;
  name: string;
}

export interface IUpdateUserDto {
  phone?: string;
  password?: string;
  name?: string;
  is_active?: boolean;
  is_verified?: boolean;
}
