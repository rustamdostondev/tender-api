import { Injectable, NotFoundException } from '@nestjs/common';
import { IApiResponse } from '@common/interfaces/api-response.interface';
import { CustomApiResponse } from '@common/utils/api-response.util';
import { IProposal } from '../interfaces/proposals.interface';
import { CreateProposalDto } from '../dto/create-proposals.dto';
import { IUserSession } from '@modules/auth/interfaces/auth.interface';
import { IPagination } from '@common/interfaces/pagination.interface';
import { UpdateProposalDto } from '../dto/update-proposals.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { objectId } from '@utils';
import { Prisma } from '@prisma/client';
import { ChangeStatusProposalDto } from '../dto/change-status.proposals';
import { ParserService } from '@modules/parser/parser.service';
import { OpenaiService } from '@modules/evaluation/openai/openai.service';
import { aiFormatterForProposal } from '@modules/evaluation/openai/prompt-builder';

@Injectable()
export class ProposalsService {
  constructor(
    private readonly prisma: PrismaService,

    private readonly parser: ParserService,
    private readonly openai: OpenaiService,
  ) {}

  async create(payload: CreateProposalDto, user: IUserSession): Promise<IApiResponse<IProposal>> {
    const { tenderId, ...data } = payload;

    const [tender, file] = await Promise.all([
      this.prisma.tenders.findUnique({ where: { id: tenderId, isDeleted: false } }),
      payload.fileId ? this.prisma.files.findUnique({ where: { id: payload.fileId } }) : null,
    ]);

    if (!tender) {
      throw new NotFoundException(`Tender with ID ${tenderId} not found`);
    }

    if (payload.fileId && !file) {
      throw new NotFoundException(`File with ID ${payload.fileId} not found`);
    }

    const fileTexts = file ? await this.parser.processFile(file.path) : null;

    const aiText = fileTexts ? await this.openai.evaluate(aiFormatterForProposal(fileTexts)) : null;

    const proposal = await this.prisma.proposals.create({
      data: {
        ...data,
        id: objectId(),
        createdById: user.id,
        updatedById: user.id,
        userId: user.id,
        tenderId,
        status: 'PENDING',
        matchPercent: 0,
        isDeleted: false,
        deliveryTime: new Date(data.deliveryTime),
        aiText,
        fileTexts,
      },
    });

    return CustomApiResponse.success(proposal);
  }

  async findById(id: string): Promise<IApiResponse<IProposal>> {
    const proposal = await this.prisma.proposals.findUnique({
      where: { id, isDeleted: false },
      include: {
        file: true,
      },
    });
    if (!proposal) {
      throw new NotFoundException(`Proposal with ID ${id} not found`);
    }
    return CustomApiResponse.success(proposal);
  }

  async findAll(payload: IPagination): Promise<IApiResponse<IProposal[]>> {
    const { limit, page, search, sortBy, order } = payload;

    const select = {
      id: true,
      price: true,
      deliveryTime: true,
      description: true,
      fileId: true,
      status: true,
      matchPercent: true,
      tenderId: true,
      userId: true,
      isDeleted: true,
      createdAt: true,
      file: true,
    };

    const where = search
      ? {
          isDeleted: false,
          OR: [
            {
              message: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              } as unknown,
            },
            {
              status: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              } as unknown,
            },
          ],
        }
      : { isDeleted: false };

    const sort = Object.keys(select).includes(sortBy) && sortBy ? { [sortBy]: order } : {};

    const [results, total] = await Promise.all([
      this.prisma.proposals.findMany({
        take: limit,
        skip: limit * (page - 1),
        where,
        select,
        orderBy: sort,
      }),
      this.prisma.proposals.count({ where }),
    ]);

    return CustomApiResponse.paginated(results, page, limit, total);
  }

  async update(
    id: string,
    data: UpdateProposalDto,
    user: IUserSession,
  ): Promise<IApiResponse<IProposal>> {
    const existingProposal = await this.prisma.proposals.findUnique({
      where: { id, isDeleted: false },
    });

    if (!existingProposal) {
      throw new NotFoundException(`Proposal with ID ${id} not found`);
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
      obj.aiText = await this.openai.evaluate(aiFormatterForProposal(obj.fileTexts));
    }

    const proposal = await this.prisma.proposals.update({
      where: { id, isDeleted: false },
      data: {
        ...data,
        updatedAt: new Date(),
        updatedById: user.id,
        deliveryTime: new Date(data.deliveryTime),
      },
    });

    return CustomApiResponse.success(proposal);
  }

  async delete(id: string, user: IUserSession): Promise<IApiResponse<IProposal>> {
    const existingProposal = await this.prisma.proposals.findUnique({
      where: { id, isDeleted: false },
    });
    if (!existingProposal) {
      throw new NotFoundException(`Proposal with ID ${id} not found`);
    }
    const proposal = await this.prisma.proposals.update({
      where: { id, isDeleted: false },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedById: user.id,
      },
    });
    return CustomApiResponse.success(proposal);
  }

  async getProposalsByTenderId(tenderId: string) {
    const proposals = await this.prisma.proposals.findMany({
      where: { tenderId, isDeleted: false },
      select: {
        id: true,
        userId: true,
        price: true,
        deliveryTime: true,
        createdAt: true,
        status: true,
        matchPercent: true,
        user: true,
        file: true,
      },
    });

    return CustomApiResponse.success(proposals);
  }

  async myList(user: IUserSession): Promise<IApiResponse<IProposal[]>> {
    const proposals = await this.prisma.proposals.findMany({
      where: { userId: user.id, isDeleted: false },
      select: {
        id: true,
        tenderId: true,
        price: true,
        deliveryTime: true,
        createdAt: true,
        status: true,
        matchPercent: true,
        user: true,
      },
    });

    return CustomApiResponse.success(proposals);
  }

  async changeProposalStatus(
    proposalId: string,
    { status }: ChangeStatusProposalDto,
    user: IUserSession,
  ) {
    const exitProposal = await this.prisma.proposals.findUnique({
      where: { id: proposalId, isDeleted: false },
      select: { tenderId: true },
    });

    if (!exitProposal) {
      throw new NotFoundException(`Proposal with ID ${proposalId} not found`);
    }

    // Verify the tender exists and is owned by the user
    const tender = await this.prisma.tenders.findUnique({
      where: { id: exitProposal.tenderId, userId: user.id, isDeleted: false },
    });

    if (!tender) {
      throw new NotFoundException(`Tender with ID ${tender.id} not found or not owned by user`);
    }

    // Update the status of the proposal
    const proposal = await this.prisma.proposals.update({
      where: { id: proposalId, tenderId: tender.id, isDeleted: false },
      data: {
        status,
        tender: { update: { status: status == 'ACCEPTED' ? 'ClOSED' : 'OPEN' } },
      },
    });

    return CustomApiResponse.success(proposal);
  }
}
