import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EvaluationController } from './evaluation.controller';
import { OpenaiService } from './openai.service';
import { ParserModule } from '@modules/parser/parser.module';
import { FilesModule } from '@modules/files/files.module';

@Module({
  imports: [PrismaModule, ParserModule, FilesModule],
  controllers: [EvaluationController],
  providers: [OpenaiService],
  exports: [OpenaiService],
})
export class OpenaiModule {}
