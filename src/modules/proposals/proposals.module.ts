import { Module } from '@nestjs/common';
import { ProposalsController } from './controllers/proposals.controller';
import { ProposalsService } from './services/proposals.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ParserModule } from '@modules/parser/parser.module';
import { OpenaiModule } from '@modules/evaluation/openai/openai.module';

@Module({
  imports: [PrismaModule, ParserModule, OpenaiModule],
  controllers: [ProposalsController],
  providers: [ProposalsService],
  exports: [ProposalsService],
})
export class ProposalsModule {}
