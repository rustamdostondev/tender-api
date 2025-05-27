import { Module } from '@nestjs/common';
import { TendersController } from './controllers/tenders.controller';
import { TendersService } from './services/tenders.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ParserModule } from '@modules/parser/parser.module';
import { OpenaiModule } from '@modules/evaluation/openai/openai.module';

@Module({
  imports: [PrismaModule, ParserModule, OpenaiModule],
  controllers: [TendersController],
  providers: [TendersService],
  exports: [TendersService],
})
export class TendersModule {}
