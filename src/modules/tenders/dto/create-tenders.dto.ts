import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export class CreateTendersDto {
  @ApiProperty({ description: 'The title of the tender', example: 'New Project' })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'The description of the tender',
    example: 'A detailed project description',
  })
  @IsString()
  description: string;

  @ApiProperty({ description: 'The category of the tender', example: 'Construction' })
  @IsString()
  @IsOptional()
  category: string;

  @ApiProperty({ description: 'The budget for the tender', example: 100000.0 })
  @IsNumber()
  budget: number;

  @ApiProperty({ description: 'The deadline for the tender', example: '2023-12-31T23:59:59Z' })
  @IsString()
  deadline: string;

  @ApiProperty({
    description: 'The file URL for the tender',
    example: 'http://example.com/file.pdf',
    required: false,
  })
  @IsString()
  @IsOptional()
  fileId?: string;

  @ApiProperty({
    description: 'The status of the tender',
    example: 'OPEN',
    enum: ['OPEN', 'CLOSED'],
  })
  @IsEnum(['OPEN', 'CLOSED'])
  status: string;
}
