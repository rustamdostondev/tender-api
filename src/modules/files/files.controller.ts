import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { BufferedFile } from './interfaces';
import { Response } from 'express';
import { User } from '@common/decorators/user.decorator';
import { IUserSession } from '@modules/auth/interfaces/auth.interface';
import { AuthGuard } from 'src/guards/auth.guard';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@ApiTags('File')
@ApiBearerAuth('authorization')
@UseGuards(JwtAuthGuard, AuthGuard)
@Controller('file')
export class FilesController {
  constructor(private filesService: FilesService) {}

  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file: BufferedFile, @User() user: IUserSession) {
    return this.filesService.upload(file, user);
  }

  @ApiOperation({ summary: 'Download a file' })
  @Get('download/:fileId')
  download(@Param('fileId') fileId: string, @User() user: IUserSession, @Res() response: Response) {
    return this.filesService.download(fileId, user, response);
  }
}
