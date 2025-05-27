import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { ICreateUserDto, IUpdateUserDto, IUser } from '../interfaces/user.interface';
import { IPagination } from '@common/interfaces/pagination.interface';
import { IApiResponse } from '@common/interfaces/api-response.interface';
import { CustomApiResponse } from '@common/utils/api-response.util';
import { PrismaService } from 'src/prisma/prisma.service';
import { objectId } from '@utils';
import { Prisma } from '@prisma/client';
import { IUserSession } from '@modules/auth/interfaces/auth.interface';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(payload: IPagination): Promise<IApiResponse<IUser[]>> {
    const { limit, page, search, sortBy, order } = payload;

    const select = {
      id: true,
      phone: true,
      name: true,
    };

    // Build the search condition
    const where = search
      ? {
          isDeleted: false,
          OR: [
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { lastName: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { phone: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {};

    const sort = Object.keys(select).includes(sortBy) && sortBy ? { [sortBy]: order } : {};

    // Fetch paginated users
    const [users, total] = await Promise.all([
      this.prisma.users.findMany({
        take: limit,
        skip: limit * (page - 1),
        where,
        select,
        orderBy: sort,
      }),
      this.prisma.users.count({ where }),
    ]);

    // Return the paginated response
    return CustomApiResponse.paginated(users, page, limit, total);
  }

  async findById(id: string): Promise<IApiResponse<IUser>> {
    const user = await this.prisma.users.findUnique({
      where: { id, isDeleted: false },
      select: {
        id: true,
        phone: true,
        name: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return CustomApiResponse.success(user);
  }

  async create(data: ICreateUserDto): Promise<IApiResponse<IUser>> {
    // Check email uniqueness
    const existingUser = await this.prisma.users.findFirst({
      where: { phone: data.phone, isDeleted: false },
    });

    if (existingUser) {
      throw new BadRequestException('phone already exists');
    }

    const user = await this.prisma.users.create({
      data: {
        id: objectId(),
        ...data,
      },
    });
    return CustomApiResponse.success(user);
  }

  async update(
    id: string,
    data: IUpdateUserDto,
    createUser: IUserSession,
  ): Promise<IApiResponse<IUser>> {
    // Check if user exists
    const existingUser = await this.prisma.users.findUnique({
      where: { id, isDeleted: false },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check email uniqueness if email is being updated
    if (data.phone) {
      const emailUser = await this.prisma.users.findUnique({
        where: { phone: data.phone, isDeleted: false },
      });

      if (emailUser && emailUser.id !== id) {
        throw new BadRequestException('Email already exists');
      }
    }

    const user = await this.prisma.users.update({
      where: { id, isDeleted: false },
      data: {
        ...data,
        updatedAt: new Date(),
        updatedBy: createUser.id,
      },
    });
    return CustomApiResponse.success(user);
  }

  async delete(id: string, user: IUserSession): Promise<IApiResponse<{ message: string }>> {
    // Check if user exists
    const exists = await this.prisma.users.findUnique({
      where: { id, isDeleted: false },
    });
    if (!exists) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.prisma.users.update({
      where: { id, isDeleted: false },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: user.id,
      },
    });
    return CustomApiResponse.success({ message: 'User deleted successfully' });
  }
}
