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
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TendersService } from '../services/tenders.service';
import { RESOURCES } from '@common/constants';
import { IUserSession } from '@modules/auth/interfaces/auth.interface';
import { User } from '@common/decorators/user.decorator';
import { UpdateTenderDto } from '../dto/update-tenders.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { CreateTendersDto } from '../dto/create-tenders.dto';

@UseGuards(JwtAuthGuard, AuthGuard)
@ApiBearerAuth('authorization')
@ApiTags('Tenders')
@Controller({
  path: RESOURCES.TENDERS,
  version: '1',
})
export class TendersController {
  constructor(private readonly tendersService: TendersService) {}

  @Get('getAll')
  @ApiOperation({ summary: 'Get all tenders' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all tenders',
  })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.tendersService.findAll(paginationDto);
  }

  @Get('myGetAll')
  @ApiOperation({ summary: 'Get all tenders' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all tenders',
  })
  myFindAll(@Query() paginationDto: PaginationDto, @User() user: IUserSession) {
    return this.tendersService.myFindAll(paginationDto, user);
  }

  @Post('create')
  @ApiOperation({ summary: 'Create a new proposal' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Returns the created proposal',
  })
  create(@Body() createTenderDto: CreateTendersDto, @User() user: IUserSession) {
    return this.tendersService.create(createTenderDto, user);
  }

  @Get('getOne/:id')
  @ApiOperation({ summary: 'Get proposal by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns proposal by id',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Tender not found' })
  findOne(@Param('id') id: string) {
    return this.tendersService.findById(id);
  }

  @Put('update/:id')
  @ApiOperation({ summary: 'Update proposal by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns updated proposal',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Tender not found' })
  update(
    @Param('id') id: string,
    @Body() updateTenderDto: UpdateTenderDto,
    @User() user: IUserSession,
  ) {
    return this.tendersService.update(id, updateTenderDto, user);
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: 'Delete proposal by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns deleted proposal',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Tender not found' })
  delete(@Param('id') id: string, @User() user: IUserSession) {
    return this.tendersService.delete(id, user);
  }
}
