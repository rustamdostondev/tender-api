// src/evaluation/evaluation.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { OpenaiService } from './openai.service';

@Controller('evaluation')
export class EvaluationController {
  constructor(private readonly openai: OpenaiService) {}

  @Get('/:tenderId')
  async evaluate(@Param('tenderId') tenderId: string) {
    return this.openai.evaluateTender({ tenderId });
  }
}
