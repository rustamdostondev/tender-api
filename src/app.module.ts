import { LoggerModule } from '@common/logger/logger.module';
import { AuthModule } from '@modules/auth/auth.module';
import { UsersModule } from '@modules/users/users.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { TendersModule } from '@modules/tenders/tenders.module';
import { ProposalsModule } from '@modules/proposals/proposals.module';
import { FilesModule } from '@modules/files/files.module';
import { OpenaiModule } from '@modules/evaluation/openai/openai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    LoggerModule,
    AuthModule,
    UsersModule,
    TendersModule,
    ProposalsModule,
    FilesModule,
    OpenaiModule,
  ],
})
export class AppModule {}
