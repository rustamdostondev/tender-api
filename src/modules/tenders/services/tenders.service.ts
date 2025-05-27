import { Injectable, NotFoundException } from '@nestjs/common';
import { IApiResponse } from '@common/interfaces/api-response.interface';
import { CustomApiResponse } from '@common/utils/api-response.util';
import { ITender } from '../interfaces/tenders.interface';
import { IUserSession } from '@modules/auth/interfaces/auth.interface';
import { IPagination } from '@common/interfaces/pagination.interface';
import { UpdateTenderDto } from '../dto/update-tenders.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { objectId } from '@utils';
import { Prisma } from '@prisma/client';
import { CreateTendersDto } from '../dto/create-tenders.dto';
import { ParserService } from '@modules/parser/parser.service';
import { OpenaiService } from '@modules/evaluation/openai/openai.service';
import { aiFormatterForTender } from '@modules/evaluation/openai/prompt-builder';

@Injectable()
export class TendersService {
  constructor(
    private readonly prisma: PrismaService,

    private readonly parser: ParserService,
    private readonly openai: OpenaiService,
  ) {}
  async create(payload: CreateTendersDto, user: IUserSession): Promise<IApiResponse<ITender>> {
    let aiText = null;
    let fileTexts = null;
    if (payload.fileId) {
      const file = await this.prisma.files.findUnique({
        where: { id: payload.fileId },
      });
      if (!file) {
        throw new NotFoundException(`File with ID ${payload.fileId} not found`);
      }

      fileTexts = await this.parser.processFile(file.path);

      aiText = await this.openai.evaluate(aiFormatterForTender(fileTexts));
    }

    const proposal = await this.prisma.tenders.create({
      data: {
        ...payload,
        id: objectId(),
        deadline: new Date(payload.deadline),
        userId: user.id,
        createdById: user.id,
        updatedById: user.id,
        aiText,
        fileTexts,
      },
    });

    return CustomApiResponse.success(proposal);
  }

  async findById(id: string): Promise<IApiResponse<ITender>> {
    const proposal = await this.prisma.tenders.findUnique({
      where: { id, isDeleted: false },
      include: {
        file: true,
        user: true,
      },
    });
    if (!proposal) {
      throw new NotFoundException(`Tender with ID ${id} not found`);
    }
    return CustomApiResponse.success(proposal);
  }

  async findAll(payload: IPagination): Promise<IApiResponse<ITender[]>> {
    const { limit, page, search, sortBy, order } = payload;

    const select = {
      id: true,
      title: true,
      description: true,
      category: true,
      budget: true,
      deadline: true,
      fileId: true,
      status: true,
      userId: true,
      file: true,
      user: {
        select: {
          id: true,
          name: true,
          phone: true,
        },
      },
    };

    // Build the search condition
    const where = search
      ? {
          isDeleted: false,
          OR: [
            {
              title: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              } as unknown,
            },
            {
              description: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              } as unknown,
            },
            {
              category: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              } as unknown,
            },
          ],
        }
      : {};

    const sort = Object.keys(select).includes(sortBy) && sortBy ? { [sortBy]: order } : {};

    // Fetch paginated tenders
    const [results, total] = await Promise.all([
      this.prisma.tenders.findMany({
        take: limit,
        skip: limit * (page - 1),
        where: { ...where, isDeleted: false },
        select,
        orderBy: sort,
      }),
      this.prisma.tenders.count({ where }),
    ]);

    // Return the paginated response
    return CustomApiResponse.paginated(results, page, limit, total);
  }

  async update(
    id: string,
    data: UpdateTenderDto,
    user: IUserSession,
  ): Promise<IApiResponse<ITender>> {
    const existingTender = await this.prisma.tenders.findUnique({
      where: { id },
    });

    if (!existingTender) {
      throw new NotFoundException(`Tender with ID ${id} not found`);
    }

    const obj: {
      fileTexts?: string;
      aiText?: string;
    } = {};

    if (data.fileId) {
      const file = await this.prisma.files.findUnique({
        where: { id: data.fileId },
      });
      if (!file) {
        throw new NotFoundException(`File with ID ${data.fileId} not found`);
      }

      obj.fileTexts = await this.parser.processFile(file.path);
      obj.aiText = await this.openai.evaluate(aiFormatterForTender(obj.fileTexts));
    }

    const proposal = await this.prisma.tenders.update({
      where: { id, isDeleted: false },
      data: {
        ...data,
        deadline: new Date(data.deadline),
        updatedAt: new Date(),
        updatedById: user.id,
        ...obj,
      },
    });

    return CustomApiResponse.success(proposal);
  }

  async delete(id: string, user: IUserSession): Promise<IApiResponse<ITender>> {
    const existingTender = await this.prisma.tenders.findUnique({
      where: { id, isDeleted: false },
    });
    if (!existingTender) {
      throw new NotFoundException(`Tender with ID ${id} not found`);
    }
    const proposal = await this.prisma.tenders.update({
      where: { id, isDeleted: false },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedById: user.id,
      },
    });
    return CustomApiResponse.success(proposal);
  }

  async myFindAll(payload: IPagination, user: IUserSession): Promise<IApiResponse<ITender[]>> {
    const { limit, page, search, sortBy, order } = payload;

    const select = {
      id: true,
      title: true,
      description: true,
      category: true,
      budget: true,
      deadline: true,
      fileId: true,
      status: true,
      userId: true,
      file: true,
      user: {
        select: {
          id: true,
          name: true,
          phone: true,
        },
      },
    };

    // Build the search condition
    const where = search
      ? {
          isDeleted: false,
          OR: [
            {
              title: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              } as unknown,
            },
            {
              description: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              } as unknown,
            },
            {
              category: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              } as unknown,
            },
          ],
        }
      : {};

    const sort = Object.keys(select).includes(sortBy) && sortBy ? { [sortBy]: order } : {};

    // Fetch paginated tenders
    const [results, total] = await Promise.all([
      this.prisma.tenders.findMany({
        take: limit,
        skip: limit * (page - 1),
        where: { ...where, userId: user.id, isDeleted: false },
        select,
        orderBy: sort,
      }),
      this.prisma.tenders.count({ where }),
    ]);

    // Return the paginated response
    return CustomApiResponse.paginated(results, page, limit, total);
  }
}
