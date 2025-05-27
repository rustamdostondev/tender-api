import { AuthGuard } from 'src/guards/auth.guard';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProposalsService } from '../services/proposals.service';
import { RESOURCES } from '@common/constants';
import { CreateProposalDto } from '../dto/create-proposals.dto';
import { IUserSession } from '@modules/auth/interfaces/auth.interface';
import { User } from '@common/decorators/user.decorator';
import { UpdateProposalDto } from '../dto/update-proposals.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { ChangeStatusProposalDto } from '../dto/change-status.proposals';

@UseGuards(JwtAuthGuard, AuthGuard)
@ApiBearerAuth('authorization')
@ApiTags('Proposals')
@Controller({
  path: RESOURCES.PROPOSALS,
  version: '1',
})
export class ProposalsController {
  constructor(private readonly proposalsService: ProposalsService) {}

  @Get('getAll')
  @ApiOperation({ summary: 'Get all proposals' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all proposals',
  })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.proposalsService.findAll(paginationDto);
  }

  @Post('create')
  @ApiOperation({ summary: 'Create a new proposal' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Returns the created proposal',
  })
  create(@Body() createProposalDto: CreateProposalDto, @User() user: IUserSession) {
    return this.proposalsService.create(createProposalDto, user);
  }

  @Get('getOne/:id')
  @ApiOperation({ summary: 'Get proposal by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns proposal by id',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Proposal not found' })
  findOne(@Param('id') id: string) {
    return this.proposalsService.findById(id);
  }

  @Put('update/:id')
  @ApiOperation({ summary: 'Update proposal by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns updated proposal',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Proposal not found' })
  update(
    @Param('id') id: string,
    @Body() updateProposalDto: UpdateProposalDto,
    @User() user: IUserSession,
  ) {
    return this.proposalsService.update(id, updateProposalDto, user);
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: 'Delete proposal by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns deleted proposal',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Proposal not found' })
  delete(@Param('id') id: string, @User() user: IUserSession) {
    return this.proposalsService.delete(id, user);
  }

  @Get('tender/:tenderId')
  @ApiOperation({ summary: 'Get proposals by Tender ID' })
  @ApiParam({ name: 'tenderId', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns proposals for a specific tender',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'No proposals found for the tender' })
  getProposalsByTenderId(@Param('tenderId') tenderId: string) {
    return this.proposalsService.getProposalsByTenderId(tenderId);
  }

  @Get('myList')
  @ApiOperation({ summary: 'Get proposals for logged in user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns proposals for the logged in user',
  })
  myList(@User() user: IUserSession) {
    return this.proposalsService.myList(user);
  }

  @Post('changeStatus/:id')
  @ApiOperation({ summary: 'Change proposal status' })
  @ApiBody({ type: ChangeStatusProposalDto })
  changeProposalStatus(
    @Param('id') proposalId: string,
    @Body() body: ChangeStatusProposalDto,
    @User() user: IUserSession,
  ) {
    return this.proposalsService.changeProposalStatus(proposalId, body, user);
  }
}
