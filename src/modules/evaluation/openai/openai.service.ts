// src/evaluation/openai.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { OpenAI } from 'openai';
import { PrismaService } from 'src/prisma/prisma.service';
import { buildPrompt, renderTenderTable } from './prompt-builder';
import { OPEN_API_KEY } from '@env';

@Injectable()
export class OpenaiService {
  private openai: OpenAI;

  constructor(private readonly prisma: PrismaService) {
    this.openai = new OpenAI({
      apiKey: OPEN_API_KEY,
    });
  }

  async evaluate(prompt: string, retries = 2): Promise<string | null> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
      });

      return response.choices[0].message.content;
    } catch (error: any) {
      console.log(error);

      if (error.status === 429 && retries > 0) {
        // Wait 2 seconds before retrying
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return this.evaluate(prompt, retries - 1);
      }

      // For free tier, if you hit 429, best is to return null or a user-friendly message
      console.error('OpenAI API error:', error.message);
      return null; // or throw error if you want to handle it upstream
    }
  }

  async evaluateTender({ tenderId }) {
    const tender = await this.prisma.tenders.findFirst({
      where: {
        id: tenderId,
      },
      include: {
        file: true,
      },
    });

    if (!tender) {
      throw new NotFoundException('Tender file not found');
    }

    const proposals = await this.prisma.proposals.findMany({
      where: {
        tenderId,
      },
      include: {
        file: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (!proposals) {
      throw new NotFoundException('Proposal files not found');
    }

    const allProposalText = proposals.reduce((acc, proposal) => {
      return acc + proposal.aiText + '\n';
    }, '');

    const prompt = buildPrompt(tender.aiText, allProposalText);

    const aiResponse = await this.evaluate(prompt);

    const resultJson = this.extractJson(aiResponse);

    const html = renderTenderTable(resultJson);

    await this.prisma.tenders.update({
      where: {
        id: tenderId,
      },
      data: {
        aiResult: html,
      },
    });

    return {
      success: true,
      data: {
        html: html,
      },
    };
  }

  private extractJson(text) {
    try {
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');

      if (jsonStart === -1 || jsonEnd === -1 || jsonStart > jsonEnd) {
        throw new Error('JSON not found');
      }

      const jsonString = text.substring(jsonStart, jsonEnd + 1);
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Failed to extract JSON:', error.message);
      return null;
    }
  }
}
