import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ChangeStatusProposalDto {
  @ApiProperty({
    description: 'The status of the proposal',
    example: 'PENDING',
  })
  @IsString()
  status: string;
}
