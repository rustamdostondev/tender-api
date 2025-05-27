import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Length } from 'class-validator';

export class CreateProposalDto {
  @ApiProperty({
    description: 'The id of the tender',
    example: '620f6f45c75b9f6b34f2a9a1',
  })
  @IsString()
  @Length(24)
  tenderId: string;

  @ApiProperty({
    description: 'The price of the proposal',
    example: 1000.99,
  })
  @IsNumber()
  price: number;

  @ApiProperty({
    description: 'The delivery time of the proposal',
    example: '2023-12-31T23:59:59Z',
  })
  @IsString()
  deliveryTime: string;

  @ApiProperty({
    description: 'The message of the proposal',
    example: 'A detailed message',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'The file URL of the proposal',
    example: 'http://example.com/file.pdf',
    required: false,
  })
  @IsString()
  @IsOptional()
  fileId?: string;

  @ApiProperty({
    description: 'The status of the proposal',
    example: 'PENDING',
  })
  status: string;

  @ApiProperty({
    description: 'The match percent of the proposal',
    example: 50,
    required: false,
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  matchPercent?: number;
}
