import { IsDefined, IsNotEmpty, IsString } from 'class-validator';
import { IDownloadFile } from '../interfaces';
import { ApiProperty } from '@nestjs/swagger';

export class DownloadFileDto implements IDownloadFile {
  @ApiProperty({ title: 'File id ' })
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  fileId: string;
}
