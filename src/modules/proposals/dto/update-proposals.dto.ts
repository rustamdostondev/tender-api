import { PartialType } from '@nestjs/swagger';
import { CreateProposalDto } from './create-proposals.dto';
export class UpdateProposalDto extends PartialType(CreateProposalDto) {}
