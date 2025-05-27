import { PARSER_KEY } from '@env';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { LLMWhispererClientV2, LLMWhispererClientException } from 'llmwhisperer-client';
import * as path from 'path';

@Injectable()
export class ParserService {
  private readonly client: LLMWhispererClientV2;

  constructor() {
    this.client = new LLMWhispererClientV2({
      baseUrl: 'https://llmwhisperer-api.us-central.unstract.com/api/v2',
      apiKey: PARSER_KEY,
      loggingLevel: 'info',
    });
  }

  async processFile(name: string): Promise<string> {
    const filePath = path.resolve(name); // Adjust path as needed

    try {
      const response = await this.client.whisper({
        filePath,
        mode: 'high_quality',
        outputMode: 'line-printer',
        pageSeparator: '<<<',
        waitForCompletion: true,
        waitTimeout: 180,
      });

      return response.extraction?.result_text || 'No text found';
    } catch (err) {
      if (err instanceof LLMWhispererClientException) {
        throw new InternalServerErrorException(`LLM Whisperer Error: ${err.errorMessage()}`);
      }
      throw new InternalServerErrorException('Unexpected error occurred');
    }
  }
}
